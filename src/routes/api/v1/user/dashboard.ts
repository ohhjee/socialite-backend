import { dashboardController } from "@/controllers/user/dashboard.controller";
import { Router } from "express";
const route = Router();

export function UserDashboard(): Router {
  route
    .get("/", dashboardController.getOverview)
    .get("/:userName/profile", dashboardController.getProfile)
    .get("/:userName/me", dashboardController.me);

  return route;
}
