import { bookmarkController } from "@/controllers/user/bookmark.controller";
import { Router } from "express";
const route = Router();

export function likeRoute(): Router {
  route.post("/:ref/bookmark", bookmarkController.createBookmark);

  return route;
}
