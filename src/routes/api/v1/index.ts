import { Router } from "express";
import { userRoutes } from "./user";
import { adminRouter } from "./admin";

export function apiV1Routes(): Router {
  const route = Router();
  route.use("/user", userRoutes());

  route.use("/admin", adminRouter());
  return route;
}
