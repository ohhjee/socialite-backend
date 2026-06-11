import { bookmarkController } from "@/controllers/user/bookmark.controller";
import { privacyController } from "@/controllers/user/privacy.controller";
import { Router } from "express";
const route = Router();

export function privacyRoute(): Router {
  route.get("/", privacyController.getUserPrivate);
  route.patch("/is-private", privacyController.privateAccount);

  return route;
}
