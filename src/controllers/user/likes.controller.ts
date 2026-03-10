import { prismaService } from "@/services/prisma.service";
import { log } from "console";
import { NextFunction, Response } from "express";

class LikeController {
  public createLike = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;

      const post = await prismaService.post.findFirst({
        where: { id: Number(id) },
      });

      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }

      const existingLike = await prismaService.like.findFirst({
        where: { post_Id: Number(id), userId: req.user.id },
        include: { post: true },
      });

      if (existingLike) {
        if (existingLike.deletedAt === null) {
          await prismaService.like.update({
            where: { id: existingLike.id },
            data: { deletedAt: new Date() },
          });
          res.status(200).json({ message: "Post unliked", isLiked: false });
        } else {
          await prismaService.like.update({
            where: { id: existingLike.id },
            data: { deletedAt: null },
          });
          res.status(200).json({ message: "Post liked", isLiked: true });
        }
        return;
      }

      await prismaService.like.create({
        data: { post_Id: post.id, userId: req.user.id },
      });

      res.status(201).json({ message: "Post liked", isLiked: true });
    } catch (error) {
      next(error);
    }
  };
}

const likeController = new LikeController();
export { likeController };
export type { LikeController };
