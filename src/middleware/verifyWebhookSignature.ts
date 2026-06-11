import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { paystackSecretKey } from "@/constant";


export const verifyPaystackWebhook=(req: Request, res: Response, next: NextFunction) => {

    const hash = crypto.createHmac('sha512',     paystackSecretKey).update(req.body).digest('hex');
      const signature = req.headers['x-paystack-signature'];

  if (hash !== signature) {
    return res.status(401).json({ message: 'Invalid signature' });
  }

  next();
}