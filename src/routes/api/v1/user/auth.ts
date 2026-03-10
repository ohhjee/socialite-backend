import { createUserSchema, loginSchema } from "@/validations-schema";
import { validateBody } from "@/middleware/validation.middleware";
import { userAuthentication } from "@/controllers/user/auth.controller";
import { Router } from "express";
const route = Router();

export function Auth(): Router {
  route.post(
    "/register",
    validateBody(createUserSchema),
    userAuthentication.registerUser
  );
  route.post("/login", validateBody(loginSchema), userAuthentication.login);
  return route;
}
