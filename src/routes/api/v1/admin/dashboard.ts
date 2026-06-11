import { adminController } from "@/controllers/admin/admin.controller";
import { adminAuthController } from "@/controllers/admin/auth.controller";
import { adminUserController } from "@/controllers/admin/user.controller";
import { requireRole } from "@/middleware/auth.middleware";
import { AdminRole } from "@prisma/client";
import { Router } from "express";
const route = Router();

export function AdminDashboard(): Router {
  route.get("/me", requireRole("superAdmin" ,"supportAdmin"), adminUserController.getUser);
  route.get("/get-admin", requireRole('superAdmin'), adminController.getAllAdmin);
  route.get("/get-all-users", adminUserController.getUsers);
  route.get("/:ref", adminUserController.getUserById);
  route.patch("/:ref/suspend", adminUserController.suspendUser);
  route.patch("/:ref/restore", adminUserController.unSuspendUser);


    route.post("/create-admin",requireRole("superAdmin"),  adminAuthController.createAdmin);
  

  return route;
}
