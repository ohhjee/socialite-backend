import { userAuthenticationMiddleware } from "@/middleware/user.middleware";
import { Router } from "express";
import { Auth } from "./auth";
import { UserDashboard } from "./dashboard";
import { Group } from "./group";
import { Post } from "./post";
import { paymentRoute } from "./payment";
import { likeRoute } from "./like";
const route = Router();
export function userRoutes(): Router {
  route.use("/auth", Auth());

  route.use("/dashboard", userAuthenticationMiddleware, UserDashboard());
  route.use("/group", userAuthenticationMiddleware, Group());
  route.use("/post", userAuthenticationMiddleware, Post());
  route.use("/payment", userAuthenticationMiddleware, paymentRoute());
  // route.use("/like", userAuthenticationMiddleware, likeRoute());
  return route;
}
