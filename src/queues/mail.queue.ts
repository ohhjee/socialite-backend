import { redisConfig } from "@/config/redis.config";
import { Queue } from "bullmq";

export const mailQueue = new Queue("emailQueue", { connection: redisConfig });

export async function addMailJob(data: {
  to: string;
  subject: string;
  template: string;
  replacements: Record<string, any>;
}) {
  try {
    const job = await mailQueue.add("send-mail", data, {
      delay: 10000, // reduced delay to 1 second for testing
      attempts: 300,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: false,
      removeOnFail: false,
    });
    console.log(`📧 Mail job added to queue: ${job.id}`);
    return job;
  } catch (error) {
    console.error("❌ Failed to add mail job:", error);
    throw error;
  }
}
