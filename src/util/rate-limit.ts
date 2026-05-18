import { rateLimit } from "express-rate-limit";
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 800,
  message: {
    status: 429,
    message: "To many Requests, please try again later",
  },
});
export const authLimiter = (limit: number) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    message: {
      status: 429,
      message: "To many Requests, please try again later",
    },
  });
};
