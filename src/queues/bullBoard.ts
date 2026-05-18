import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { mailQueue } from "./mail.queue";

export const serverAdapter = new ExpressAdapter();

createBullBoard({
  queues: [new BullMQAdapter(mailQueue)],
  serverAdapter,
});
