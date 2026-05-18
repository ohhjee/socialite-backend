import { redisConfig } from "@/config/redis.config";
import { Queue } from "bullmq";

export const mailQueue = new Queue("emailQueue", { connection: redisConfig });

// export async function addMailJob(data) {
//   await mailQueue.add("send-mail", data, {
//     backoff: { type: "exponential", delay: 5000 },
//     removeOnComplete: true,
//   });
// }

// mailQueue.upsertJobScheduler(
//   "repeat-every-10s",
//   {
//     every: 1000,
//   },
//   {
//     name: "repeat-every-10s",
//     data: {
//       jobData: "",
//     },
//   },
// );
