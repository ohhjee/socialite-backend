import { redisUrl, redisHost, redisPort } from "@/constant";
import { RedisOptions } from "bullmq";

export const redisConfig: RedisOptions = redisUrl
  ? {
      host: new URL(redisUrl).hostname,
      port: Number(new URL(redisUrl).port),
      password: new URL(redisUrl).password,
      tls: {
        rejectUnauthorized: false,
      },
    }
  : {
      host: redisHost,
      port: redisPort,
    };
