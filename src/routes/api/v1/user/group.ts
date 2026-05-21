import { groupController } from "@/controllers/user/group.controller";

import { userAuthenticationMiddleware } from "@/middleware/user.middleware";
import { Router } from "express";

const router = Router();
export function Group(): Router {
  router.get("", userAuthenticationMiddleware, groupController.getAllGroups);

  router.post(
    "/create",
    userAuthenticationMiddleware,
    groupController.createGroup,
  );
  router.get(
    "/:ref",
    userAuthenticationMiddleware,
    groupController.getGroupById,
  );
  router.post(
    "/:ref/join",
    userAuthenticationMiddleware,
    groupController.joinGroup,
  );
  router.delete(
    "/:ref/leave",
    userAuthenticationMiddleware,
    groupController.leaveGroup,
  );

  return router;
}
