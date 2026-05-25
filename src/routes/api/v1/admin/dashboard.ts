import { adminUserController } from "@/controllers/admin/user.controller";
import { Router } from "express";
const route = Router();

export function AdminDashboard(): Router {
  route.get("/", adminUserController.getUsers);
  route.get("/:ref/user", adminUserController.getUserById);
  route.post("/:ref/suspend", adminUserController.suspendUser);
  route.post("/:ref/unsuspend", adminUserController.unSuspendUser);

  return route;
}
