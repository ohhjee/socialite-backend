import { adminPostController } from "@/controllers/admin/post.controller";
import { adminUserController } from "@/controllers/admin/user.controller";
import { Router } from "express";
const route = Router();

export function AdminPost(): Router {
  route.delete("/:ref", adminPostController.deletePostById);
  route.get("/", adminPostController.getAllPosts);
  //   route.post("/:ref/suspend", adminUserController.suspendUser);
  //   route.post("/:ref/unsuspend", adminUserController.unSuspendUser);

  return route;
}
