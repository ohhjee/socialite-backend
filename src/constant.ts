export const _IS_PROD_ = process.env.NODE_ENV === "production",
  _PORT_ = Number(process.env.PORT) || 4000,
  _DEBUG_ = process.env.DEBUG || true,
  _APP_URL_ = process.env.APP_URL || `http://localhost:${_PORT_}`;

export const { BCRYPT_SALT_ROUNDS, JWT_SECRET, JWT_EXPIRES_IN } =
  process.env as Record<string, string>;

export const redisPort = process.env.Redis_Port || "6379";
export const redisHost = process.env.Redis_Host || "localhost";

export const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || "";
export const paystackBaseUrl = process.env.PAYSTACK_BASE_URL || "";
export const paystackPort = process.env.paystackPort || "";
