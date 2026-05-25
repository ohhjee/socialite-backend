import { canDelete } from "@/policy/canDelete";
import { prismaService } from "@/services/prisma.service";
import { type Request, type Response, type NextFunction } from "express";
import createHttpError from "http-errors";
import { log } from "node:console";

class AdminPostController {
  public getAllPosts = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const page = 1;
      const limit = 10;
      const posts = await prismaService.post.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          comments: true,
          likes: true,
          bookmarks: true,
          postImages: true,
        },
        orderBy: { createdAt: "desc" },
      });
      res.json({ message: "Posts fetched successfully", data: posts });
    } catch (error) {
      next(error);
    }
  };

  public getPostById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { ref } = req.params as { ref: string };
      const post = await prismaService.post.findUnique({
        where: { ref },
        include: {
          user: { omit: { password: true } },
          postImages: true,
          likes: true,
          bookmarks: true,
          comments: {
            include: {
              user: { omit: { password: true } },
            },
          },
        },
      });
      if (!post) {
        throw new createHttpError.NotFound("Post not found");
      }
      res.json({ message: "Post fetched successfully", data: post });
    } catch (error) {
      next(error);
    }
  };
  public deletePostById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const admin = req.admin;
      log(admin);
      const { ref } = req.params as { ref: string };
      // const ref = NumbertId);

      if (!ref) {
        throw new createHttpError.Conflict("Invalid post id");
      }
      const post = await prismaService.post.findUnique({
        where: { ref },
      });

      if (!post) {
        throw new createHttpError.NotFound("Post not found");
      }
      log(post);
      canDelete({ post, admin });
      await prismaService.post.delete({
        where: { ref },
        include: {
          comments: true,
          likes: true,
          bookmarks: true,
          postImages: true,
        },
      });

      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
}

export const adminPostController = new AdminPostController();
export type { AdminPostController };
