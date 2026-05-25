import { adminAuthenticationMiddleware } from "@/middleware/auth.middleware";
import { Router } from "express";
import { Auth } from "./auth";
import { AdminDashboard } from "./dashboard";
import { AdminPost } from "./adminPost";

const route = Router();
export function adminRouter(): Router {
  route.use("/auth", Auth());

  route.use("/dashboard", adminAuthenticationMiddleware, AdminDashboard());
  //   route.use("/group", userAuthenticationMiddleware, Group());
  route.use("/post", adminAuthenticationMiddleware, AdminPost());
  return route;
}
