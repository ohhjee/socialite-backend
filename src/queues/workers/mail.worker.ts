import { Worker, Job } from "bullmq";
import { redisConfig } from "@/config/redis.config";
import { sendEmailTemplate } from "@/services/mail/mail.service";

const worker = new Worker(
  "emailQueue",
  async (job: Job) => {
    console.log(
      `📩 Processing job ${job.id} - attempt ${job.attemptsMade + 1}`,
    );
    const { to, subject, template, replacements } = job.data;

    console.log(`   Sending email to: ${to}, Template: ${template}`);
    await sendEmailTemplate(to, subject, template, replacements);
  },
  {
    connection: redisConfig,
    concurrency: 5,
  },
);

worker.on("ready", () => {
  console.log("🚀 Mail worker is ready and waiting for jobs");
});

worker.on("active", (job) => {
  console.log(`⚡ Job ${job.id} is now active`);
});

worker.on("completed", (job) => {
  console.log(`✅ Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(
    `❌ Job failed: ${job?.id} - Attempt ${job?.attemptsMade}/${job?.opts?.attempts}`,
    err.message,
  );
});

worker.on("error", (err) => {
  console.error("🔥 Worker error:", err);
});

worker.on("drained", () => {
  console.log("✨ Queue is drained (all jobs processed)");
});

// Log connection state
console.log("🔌 Mail worker initializing with Redis config:", redisConfig);

export { worker };
