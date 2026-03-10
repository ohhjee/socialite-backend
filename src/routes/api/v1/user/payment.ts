import { dashboardController } from "@/controllers/user/dashboard.controller";
import { paymentController } from "@/controllers/user/payment.controller";
import { Router } from "express";
const route = Router();

export function paymentRoute(): Router {
  route.post("/initialize", paymentController.createPayment);
  route.get(
    "/verify",
    // authenticate,               ← strongly recommended
    paymentController.verifyPayment,
  );
  // .get("/:userName/profile", dashboardController.getProfile)
  // .get("/:id/me", dashboardController.me);

  return route;
}
