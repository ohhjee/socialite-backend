import { JWT_EXPIRES_IN, JWT_SECRET } from "@/constant";
import jwt from "jsonwebtoken";

const jwtSecret = JWT_SECRET || "50a681fbbe82ec0e28da";
const jwtOptions = { expiresIn: JWT_EXPIRES_IN || "1h" } as jwt.SignOptions;
export const generateToken = (payload: Object): string => {
  return jwt.sign(payload, jwtSecret, jwtOptions);
};

export const verifyJWT = <T>(token: string): T | null => {
  try {
    return jwt.verify(token, jwtSecret) as T;
  } catch (error) {
    console.error(
      "JWT verification error:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
};
