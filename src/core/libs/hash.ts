import { BCRYPT_SALT_ROUNDS } from "@/constant";
import { hash, compare } from "bcryptjs";

const saltRounds = Number(BCRYPT_SALT_ROUNDS);

export const hashPassword = async (password: string): Promise<string> =>
  hash(password, saltRounds);

export const verifyHash = async (
  password: string,
  hash: string
): Promise<boolean> => compare(password, hash);
