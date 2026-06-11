import { paystackBaseUrl, paystackSecretKey } from "@/constant";
import { initWinstonLogger } from "@/core";
import { prismaService } from "@/services/prisma.service";
import axios from "axios";
import { type NextFunction, type Response } from "express";
import createHttpError from "http-errors";
import { log } from "node:console";

const logger = initWinstonLogger("payment.log");

class PaymentController {
  public createPayment = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { amount, email, plan, planId } = req.body;
      const userId = req.user?.id;
      const userRef = req.user?.ref
      

      if (!amount || amount <= 0 || !Number(amount)) {
        throw createHttpError(400, "Valid positive amount is required");
      }
      if (!email || typeof email !== "string") {
        throw createHttpError(400, "Email is required");
      }
      if (!userId) {
        throw createHttpError(401, "Unauthorized");
      }

      const amountInKobo = amount * 100;

      const response = await axios.post(
        `${paystackBaseUrl}/transaction/initialize`,
        {
          email,
          amount: amountInKobo,
          plan,
          planId,
          callback_url: `${process.env.FRONTEND_URL}/dashboard/premium/verify`,
          metadata: {
            userId,
            email,
            plan,
            cancel_url: `${process.env.FRONTEND_URL}/dashboard/profile/me/${userRef}/settings`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      const paymentData = response.data;

      // log("response: ", paymentData);

      if (!paymentData.status || !paymentData.data?.authorization_url) {
        throw new Error("Paystack did not return a valid checkout URL");
      }

      // ✅ Always create a new payment record for each transaction
      await prismaService.payment.create({
        data: {
          userId,
          reference: paymentData.data.reference,
          amount,
          email,
          status: "PENDING",
          plan,
          planId
          // paidAt: Date.now(),
        },
      });

      logger.info("Payment initialized for new transaction", {
        reference: paymentData.data.reference,
        email,
        amount: amountInKobo,
        userId,
      });

      return res.status(200).json({
        success: true,
        message: "Payment initialized!, Please do not reload the page",
        authorizationUrl: paymentData.data.authorization_url,
        reference: paymentData.data.reference,
        // subscriptionType,
        // accessCode: paymentData.data.access_code,
      });
    } catch (error) {
      // Unwrap Axios/Paystack errors
      if (axios.isAxiosError(error)) {
        const paystackMsg = error.response?.data?.message ?? error.message;
        const status = error.response?.status ?? 500;

        logger.error("Paystack API error", {
          status,
          message: paystackMsg,
          data: error.response?.data,
        });

        return next(createHttpError(status, `Paystack error: ${paystackMsg}`));
      }

      // Re-throw http-errors as-is (e.g. your 400/401 throws above)
      if (createHttpError.isHttpError(error)) {
        return next(error);
      }

      // Anything else
      logger.error("Payment initialization failed", {
        message: (error as Error).message,
        stack: (error as Error).stack,
      });

      return next(
        createHttpError(
          500,
          `Could not initialize payment: ${(error as Error).message}`,
        ),
      );
    }
  };

  public verifyPayment = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const reference =
        req.query.ref || req.query.reference || req.query.trxref;

      if (!reference || typeof reference !== "string") {
        throw createHttpError(400, "Transaction reference is required");
      }

      // ✅ Check if payment record exists
      const existingPayment = await prismaService.payment.findUnique({
        where: { reference },
      });

      if (!existingPayment) {
        throw createHttpError(404, "Payment record not found");
      }

      // ✅ Don't re-verify an already finalized payment
      if (existingPayment.status === "SUCCESS") {
        return res.status(200).json({
          success: true,
          message: "Payment already verified",
          data: existingPayment,
        });
      }

      const response = await axios.get(
        `${paystackBaseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
          },
        },
      );

      // log("Payment verified", response);
      const data = response.data.data;
      log("payment Data: ", data.authorization);
      const paystackStatus = data?.status; // "success" | "failed" | "abandoned"
      // return;

      // ✅ Map Paystack status → your DB enum
      const statusMap: Record<string, "SUCCESS" | "FAILED" | "CANCELLED"> = {
        success: "SUCCESS",
        failed: "FAILED",
        abandoned: "CANCELLED", // Paystack calls cancellation "abandoned"
      };

      const newStatus = statusMap[paystackStatus] ?? "FAILED";

      // ✅ Update payment record in DB
      const updatedPayment = await prismaService.payment.update({
        where: { reference },
        data: {
          status: newStatus,
          channel: data.channel,
          currency: data.currency,
          paidAt: data.paid_at ? new Date(data.paid_at) : null,
          metadata: data.metadata ?? {},
          authorization_code: data.authorization.authorization_code,
        },
      });

      // ✅ If successful, upgrade the user (uncomment and adapt as needed)
      if (newStatus === "SUCCESS") {
        await prismaService.user.update({
          where: { id: existingPayment.userId },
          data: { isPremium: true },
        });
      }
 

      logger.info("Payment verified", { reference, status: newStatus });

      return res.status(200).json({
        success: newStatus === "SUCCESS",
        message:
          newStatus === "SUCCESS"
            ? "Payment successful"
            : newStatus === "CANCELLED"
              ? "Payment was cancelled. You can retry."
              : "Payment failed. Please try again.",
        data: {
          status: updatedPayment.status,
          reference: updatedPayment.reference,
          amount: updatedPayment.amount,
          paidAt: updatedPayment.paidAt,
          channel: updatedPayment.channel,
          currency: updatedPayment.currency,
          canRetry: newStatus !== "SUCCESS", // ✅ Frontend uses this to show retry button
        },
      });
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message || "Paystack verification failed";
        return res.status(status).json({ success: false, message });
      }
      next(createHttpError(500, "Could not verify payment"));
    }
  };
  public ChargePayment = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { amount, email, authorization_code } = req.body;

      const amountInKobo = amount * 100;
      const response = await axios.post(
        `${paystackBaseUrl}/transaction/charge_authorization`,
        {
          method: "POST",
          data: {
            email,
            authorization_code,
            amountInKobo,
          },
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
          },
        },
      );
      // log("Charge response: ", response.data);
    } catch (error) {}
  };

  public cancelPayment = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { reference } = req.body;

      if (!reference || typeof reference !== "string") {
        throw createHttpError(400, "Reference is required");
      }

      const payment = await prismaService.payment.findUnique({
        where: { reference },
      });

      if (!payment) {
        throw createHttpError(404, "Payment not found");
      }

      // Only PENDING payments can be cancelled manually
      if (payment.status !== "PENDING") {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel a payment with status: ${payment.status}`,
        });
      }

      await prismaService.payment.update({
        where: { reference },
        data: { status: "CANCELLED" },
      });

      logger.info("Payment cancelled by user", { reference });

      return res.status(200).json({
        success: true,
        message: "Payment cancelled. You can retry anytime.",
        canRetry: true,
      });
    } catch (error) {
      next(createHttpError(500, "Could not cancel payment"));
    }
  };
 public getPaymentStatus = async (
  req: AuthenticationRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw createHttpError(401, "Unauthorized");
    }

    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 2, 100);

    const skip = (page - 1) * limit;

    // ✅ Fetch payments + total count in parallel
    const [payments, total] = await Promise.all([
      prismaService.payment.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prismaService.payment.count({
        where: { userId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: "Payment status retrieved successfully",
      data: payments.map((payment) => ({
        id: payment.id,
        status: payment.status,
        reference: payment.reference,
        amount: payment.amount,
        email: payment.email,
        paidAt: payment.paidAt,
        channel: payment.channel,
        currency: payment.currency,
        subscriptionType: payment.subscriptionType,
        createdAt: payment.createdAt,
        authorization_code: payment.authorization_code,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};
}

const paymentController = new PaymentController();
export { paymentController };
export type { PaymentController };
