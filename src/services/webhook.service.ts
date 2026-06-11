import { log } from "node:console";
import { prismaService } from "./prisma.service";

export const handleChargeSuccess = async (data: any) => {
  const {
    reference,
    customer,
    amount,
    channel,
    currency,
    paid_at,
    metadata,
    authorization,
  } = data;

  const userId = Number(metadata?.userId); 

  if (!userId || isNaN(userId)) {
    throw new Error("Missing or invalid userId in metadata");
  }

  // Check if already processed
  const existing = await prismaService.payment.findUnique({
    where: { reference },
  });

  if (existing?.status === "SUCCESS") return; 

  if (existing) {
    // Record exists (PENDING) → just update it
    await prismaService.payment.update({
      where: { reference },
      data: {
        status: "SUCCESS",
        paidAt: new Date(paid_at),
        channel,
        currency,
        authorization_code: authorization?.authorization_code ?? null,
        amount: amount / 100, // convert kobo to naira
        metadata,
      },
    });
  } else {
   
    await prismaService.payment.create({
      data: {
        reference,
        amount: amount / 100,
        email: customer.email,
        status: "SUCCESS",
        channel,
        currency,
        paidAt: new Date(paid_at),
        authorization_code: authorization?.authorization_code ?? null,
        interval: metadata?.interval ?? "MONTHLY",
        subscriptionType: metadata?.subscriptionType ?? null,
        metadata,
        userId,
      },
    });
  }
};

export const handleChargeFailed = async (data: any) => {
  const { reference } = data;

  await prismaService.payment.updateMany({
    where: {
      reference,
      NOT: { status: "SUCCESS" },
    },
    data: { status: "FAILED" },
  });
};

export const handleSubscriptionCreated = async(data:any)=>{
  log("sub_created",data)
}