import { handlePaystackWebhook } from '@/controllers/webhook.controller';
import { verifyPaystackWebhook } from '@/middleware/verifyWebhookSignature';
import { Router } from 'express';


const router = Router();

router.post('/paystack', verifyPaystackWebhook, handlePaystackWebhook);

export default router;