// import { rateLimit } from "express-rate-limit";
// export const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   limit: 8000000000000000000000000000000000000000000000000000000000000000000000,
//   message: {
//     status: 429,
//     message: "Too many Requests, please try again later",
//   },
// });
// export const authLimiter = (limit: number) => {
//   return rateLimit({
//     windowMs: 15 * 60 * 1000,
//     limit,
//     message: {
//       status: 429,
//       message: "Too many Requests, please try again later",
//     },
//   });
// };
