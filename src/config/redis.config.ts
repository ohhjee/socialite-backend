import { redisHost, redisPort } from "@/constant";
import { RedisOptions } from "bullmq";

export const redisConfig: RedisOptions = {
  host: redisHost,
  port: redisPort,
};
