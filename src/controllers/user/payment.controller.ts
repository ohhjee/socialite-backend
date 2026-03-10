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
      const { amount, email, subscriptionType } = req.body;
      const userId = req.user?.id;
      // const money = Number;

      // log("amount: ", amount);
      // log("email: ", email);
      // log("subscriptionType: ", subscriptionType);
      // // return;

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
          callback_url: `${process.env.FRONTEND_URL}/dashboard/premium/verify`,
          metadata: { userId, email, subscriptionType },
        },
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      const paymentData = response.data;

      if (!paymentData.status || !paymentData.data?.authorization_url) {
        throw new Error("Paystack did not return a valid checkout URL");
      }

      const existingPayment = await prismaService.payment.findFirst({
        where: { userId },
      });

      if (existingPayment) {
        // ✅ User already subscribed — UPDATE instead of creating a duplicate
        await prismaService.payment.update({
          where: { id: existingPayment.id },
          data: {
            reference: paymentData.data.reference, // new reference for new transaction
            amount,
            email,
            status: "PENDING",
            subscriptionType,
          },
        });

        logger.info("Payment record updated for re-subscription", {
          userId,
          reference: paymentData.data.reference,
          subscriptionType,
        });
      } else {
        // ✅ First time subscribing — CREATE
        await prismaService.payment.create({
          data: {
            userId,
            reference: paymentData.data.reference,
            amount,
            email,
            status: "PENDING",
            subscriptionType,
          },
        });

        logger.info("Payment initialized for new subscriber", {
          reference: paymentData.data.reference,
          email,
          amount: amountInKobo,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Payment initialized",
        authorizationUrl: paymentData.data.authorization_url,
        reference: paymentData.data.reference,
        subscriptionType,
        accessCode: paymentData.data.access_code,
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

      const data = response.data.data;
      const paystackStatus = data?.status; // "success" | "failed" | "abandoned"

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
        },
      });

      // ✅ If successful, upgrade the user (uncomment and adapt as needed)
      // if (newStatus === "SUCCESS") {
      //   await prismaService.user.update({
      //     where: { id: existingPayment.userId },
      //     data: { isPremium: true },
      //   });
      // }

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

  // ✅ New endpoint: user explicitly clicks "Cancel" before leaving Paystack page
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
}

const paymentController = new PaymentController();
export { paymentController };
export type { PaymentController };
