import { prismaService } from "@/services/prisma.service";
import { log } from "console";
import { NextFunction, Response } from "express";

class CommentController {
  public createComment = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const ref = req.params.ref as string;

      const { content } = req.body as { content: string };

      const post = await prismaService.post.findFirst({
        where: { ref },
        include: { postImages: true },
      });
      //   log(post);
      //   return;

      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }

      const comment = await prismaService.comment.create({
        data: {
          content,
          postId: post.id,
          userId: req.user.id,
        },
      });

      res.status(201).json({ message: "Comment created", comment });
    } catch (error) {
      next(error);
    }
  };
  public getComment = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      //   log("lol");
      const ref = req.params.ref as string;
      log(ref);
      const postId = await prismaService.post.findFirst({
        where: { ref },
      });

      const commentId = await prismaService.comment.findMany({
        where: { postId: postId?.id },
        include: { user: { omit: { password: true } } },
      });
      res.status(200).json({ message: "Comments fetched", data: commentId });
      //   log(commentId);
    } catch (error) {
      next(error);
    }
  };
}

const commentController = new CommentController();
export { commentController };
export type { CommentController };
