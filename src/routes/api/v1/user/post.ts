import { groupController } from "@/controllers/user/group.controller";
import { likeController } from "@/controllers/user/likes.controller";
import {
  PostController,
  postController,
} from "@/controllers/user/post.controller";

// import { } from "@/middleware/user.middleware";
import { Router } from "express";

const router = Router();
export function Post(): Router {
  router
    .get("/all-post", postController.getAllPosts)
    .get("/my-post", postController.getMyPosts)
    .get("/:userId", postController.getPostsByUserId)
    .get("/group/:groupId", postController.getPostsByGroupId);

  router
    .post("/create", postController.createPost)
    .post("/create-group", postController.createGroupPost);

  router
    .delete("/:id", postController.deleteUserPost)
    .delete("/group/:groupId/:postId", postController.deleteGroupAdminPost);

  router.post("/:id/like", likeController.createLike);

  return router;
}
