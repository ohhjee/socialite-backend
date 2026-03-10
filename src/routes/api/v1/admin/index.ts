import { Router } from "express";
import { Auth } from "./auth";
import { userAuthenticationMiddleware } from "@/middleware/user.middleware";
import { Post } from "./post";
import { authenticationMiddleware } from "@/middleware/auth.middleware";

const route = Router();
export function adminRouter(): Router {
  route.use("/auth", Auth());

  //   route.use("/dashboard", userAuthenticationMiddleware, UserDashboard());
  //   route.use("/group", userAuthenticationMiddleware, Group());
  route.use("/post", authenticationMiddleware, Post());
  return route;
}
