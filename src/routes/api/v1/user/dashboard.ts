import { dashboardController } from "@/controllers/user/dashboard.controller";
import { uploadAvatar } from "@/middleware/upload";
import express, { Router } from "express";
import path from "path";
const route = Router();

export function UserDashboard(): Router {
  route
    .get("/", dashboardController.getOverview)
    .get("/:ref/profile", dashboardController.getProfile)
    .get("/:ref/me", dashboardController.me)
    .put("/:ref/profile", dashboardController.updateProfile)
    .post("/:email/send-mail", dashboardController.sendVerifyEmail)
    .put(
      "/:ref/avatar",
      // upload.single("avatar"),
      uploadAvatar,
      // express.static(path.join(__dirname, "../uploads")),
      dashboardController.uploadAvatar,
    )
    .post("/verify-email", dashboardController.verifyEmailAddress);

  return route;
}
