import crypto from "crypto";

export function generateResetCode(): string {
  return crypto.randomInt(0, 1000000).toString().padStart(6, "0");
}
