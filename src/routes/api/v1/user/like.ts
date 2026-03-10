import { likeController } from "@/controllers/user/likes.controller";
import { Router } from "express";
const route = Router();

export function likeRoute(): Router {
  route.post("/:id", likeController.createLike);

  return route;
}
