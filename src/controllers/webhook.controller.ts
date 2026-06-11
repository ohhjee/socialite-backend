import { handleChargeFailed, handleChargeSuccess, handleSubscriptionCreated } from '@/services/webhook.service';
import { Request, Response } from 'express';
import { log } from 'node:console';

export const handlePaystackWebhook = async (req: Request, res: Response) => {
  res.sendStatus(200);


try {
    const event = JSON.parse(req.body.toString());
    const { event: eventType, data } = event;

    log('received paystack webhook:', eventType);

    if (eventType === 'subscription.create') {
      await handleSubscriptionCreated(data);
    } else if (eventType === 'charge.success') {
      await handleChargeSuccess(data);
    } else if (eventType === 'charge.failed') {
      await handleChargeFailed(data);
    } else {
      log('Unhandled webhook event:', eventType);
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
  }
};