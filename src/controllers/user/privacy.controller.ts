import { s3Client } from "@/config/cloudflare.r2.config";
import { R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/constant";
import { initWinstonLogger } from "@/core";
import { TicketIdGenerator } from "@/core/ticketGenerator";
import { canDelete } from "@/policy/canDelete";
import { prismaService } from "@/services/prisma.service";
import { redisService } from "@/services/redis.service";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { type NextFunction, type Response } from "express";
import createHttpError from "http-errors";
import { log } from "node:console";
import { includes } from "zod/v4";

// const logger = initWinstonLogger("post.log");

class PrivacyController {
  public getUserPrivate = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const privacy = await prismaService.privacy.findUnique({
        where: { userId: req.user.id },
      });
      res.json({ message: "Privacy fetched successfully", data: privacy });
    } catch (error) {
      next(error);
    }
  };
  public privateAccount = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const {
      privateAccount,
      showInSearch,
      showOnlineStatus,
      showReadReceipts,
      suggestAccount,
    } = req.body as {
      showInSearch: boolean;
      showOnlineStatus: boolean;
      showReadReceipts: boolean;
      privateAccount: boolean;
      suggestAccount: boolean;
    };
    try {
   const result=   await prismaService.privacy.upsert({
        where: { userId: req.user.id },
        update: {
          userId: req.user.id,
          privateAccount,
          showInSearch,
          showOnlineStatus,
          showReadReceipts,
          suggestAccount,
        },
        create: {
          userId: req.user.id,
          privateAccount,
          showInSearch,
          showOnlineStatus,
          showReadReceipts,
          suggestAccount,
        },
      });
      res.status(200).send({ message: "Privacy updated successfully", data:result });
    } catch (error) {
      next(error);
    }
  };
}
const privacyController = new PrivacyController();
export { privacyController };
export type { PrivacyController };
