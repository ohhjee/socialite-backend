export const _IS_PROD_ = process.env.NODE_ENV === "production",
  _PORT_ = Number(process.env.PORT) || 4000,
  _DEBUG_ = process.env.DEBUG || true,
  _APP_URL_ = process.env.APP_URL || `http://localhost:${_PORT_}`,
  _FRONTEND_URL_ = process.env.FRONTEND_URL || "http://172.16.60.156:3000/";

export const { BCRYPT_SALT_ROUNDS, JWT_SECRET, JWT_EXPIRES_IN } =
  process.env as Record<string, string>;
export const app_name = process.env.APP_NAME;
// Redis Credentials
export const redisPort = Number(process.env.Redis_Port) || Number(6379);
export const redisHost = process.env.Redis_Host || "localhost";
export const redisUrl = process.env.Redis_URL || "";
// Paystack Credentials
export const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || "";
export const paystackBaseUrl = process.env.PAYSTACK_BASE_URL || "";
export const paystackPort = process.env.paystackPort || "";
// Email Credentials
export const emailUser = process.env.EMAIL_USER || "";
export const emailPass = process.env.EMAIL_PASS || "";
//cloudflare credentials
export const R2_ACCESSKEY = process.env.R2_ACCESSKEY || "";
export const R2_SECRETACCESSKEY = process.env.R2_SECRETACCESSKEY || "";
export const R2_URL = process.env.R2_URL || "";
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";
//Resend email

export const Resend_Email = process.env.Resend_Email || "";
