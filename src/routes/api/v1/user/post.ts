import { bookmarkController } from "@/controllers/user/bookmark.controller";
import { commentController } from "@/controllers/user/comment.controller";
import { groupController } from "@/controllers/user/group.controller";
import { likeController } from "@/controllers/user/likes.controller";
import {
  PostController,
  postController,
} from "@/controllers/user/post.controller";
import { uploadPost } from "@/middleware/upload";

// import { } from "@/middleware/user.middleware";
import { Router } from "express";

const router = Router();
export function Post(): Router {
  router
    .get("/all-post", postController.getAllPosts)
    .get("/my-post", postController.getMyPosts)
    .get("/:userId", postController.getPostsByUserId);
  // .get("/group/:groupId", postController.getPostsByGroupId);

  router
    .post("/create", uploadPost, postController.createPost)
    .post("/create-group", postController.createGroupPost);

  router
    .delete("/:id", postController.deleteUserPost)
    .delete("/group/:groupId/:postId", postController.deleteGroupAdminPost);
  // like route
  router.post("/:id/like", likeController.createLike);
  // bookmark route
  router.post("/:ref/bookmark", bookmarkController.createBookmark);
  // comment route
  router.post("/:ref/comment", commentController.createComment);
  router.get("/:ref/comments", commentController.getComment);

  return router;
}
