import { adminPostController } from "@/controllers/admin/post.controller";

import { Router } from "express";

const router = Router();
export function Post(): Router {
  router.get("/all-posts", adminPostController.getAllPosts);
  router.delete("/:postId", adminPostController.deletePostById);

  return router;
}
