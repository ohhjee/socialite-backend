import { redisConfig } from "@/config/redis.config";
import { sendEmailTemplate } from "@/services/mail/mail.service";
import { Worker } from "bullmq";
// import { redisConfig } from "../../config/redis.config";
// import { sendEmailTemplate } from "../../services/mail/mail.service";

const worker = new Worker(
  "emailQueue",
  async (job) => {
    console.log(`Processing job ${job.id} with data:`, job.data);
    const { to, subject, template, replacements } = job.data;

    if (job.name === "sendEmailTemplate") {
      await sendEmailTemplate(to, subject, template, replacements);
    }
  },
  {
    connection: redisConfig,
  },
);

worker.on("completed", (job) => {
  console.log(`Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.log(`Job failed: ${job?.id}`, err);
});
