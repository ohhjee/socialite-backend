import {
  createUserSchema,
  loginSchema,
  resetPassword,
} from "@/validations-schema";
import { validateBody } from "@/middleware/validation.middleware";
import { userAuthentication } from "@/controllers/user/auth.controller";
import { Router } from "express";
import { authLimiter } from "@/util/rate-limit";
const route = Router();

export function Auth(): Router {
  route.post(
    "/register",
    authLimiter(40000),
    validateBody(createUserSchema),
    userAuthentication.registerUser,
  );
  route.post(
    "/login",
    authLimiter(40000),
    validateBody(loginSchema),
    userAuthentication.login,
  );
  route.post(
    "/reset-password",
    // authLimiter(5),
    validateBody(resetPassword),
    userAuthentication.verifyEmail,
  );
  route.post(
    "/verify-token",
    // authLimiter(5),
    // validateBody(resetPassword),
    userAuthentication.verifyToken,
  );
  route.patch(
    "/update-password",
    // authLimiter(5),
    // validateBody(resetPassword),
    userAuthentication.updatePassword,
  );
  return route;
}
