import { canDelete } from "@/policy/canDelete";
import { prismaService } from "@/services/prisma.service";
import { type Request, type Response, type NextFunction } from "express";
import createHttpError from "http-errors";
import { log } from "node:console";

class AdminPostController {
  public deletePostById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const admin = req.admin;
      log(admin);
      const { postId } = req.params;
      const postIdNumber = Number(postId);

      if (!postIdNumber) {
        throw new createHttpError.Conflict("Invalid post id");
      }
      const post = await prismaService.post.findUnique({
        where: { id: postIdNumber },
      });

      if (!post) {
        throw new createHttpError.NotFound("Post not found");
      }
      log(post);
      canDelete({ post, admin });
      await prismaService.post.delete({
        where: { id: postIdNumber },
      });

      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

  public getAllPosts = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const posts = await prismaService.post.findMany();
      res.json({ message: "Posts fetched successfully", data: posts });
    } catch (error) {
      next(error);
    }
  };
}

export const adminPostController = new AdminPostController();
export type { AdminPostController };
