// import { createUserSchema, loginSchema } from "@/validations-schema";
import { adminAuthController } from "@/controllers/admin/auth.controller";
import { validateBody } from "@/middleware/validation.middleware";
import { loginSchema } from "@/validations-schema";
import { Router } from "express";
const route = Router();

export function Auth(): Router {
  //   route.post(
  //     "/register",
  //     validateBody(createUserSchema),
  //     userAuthentication.registerUser
  //   );
  route.post("/login", validateBody(loginSchema), adminAuthController.login);
  return route;
}
