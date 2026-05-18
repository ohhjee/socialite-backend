import { prismaService } from "@/services/prisma.service";
import { log } from "console";
import { NextFunction, Response } from "express";

class BookmarkController {
  public createBookmark = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const ref = req.params.ref as string;

      const post = await prismaService.post.findFirst({
        where: { ref },
      });

      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }

      const existingLike = await prismaService.bookmark.findFirst({
        where: { post_Id: post.id, userId: req.user.id },
        include: { post: true },
      });

      if (existingLike) {
        if (existingLike.deletedAt === null) {
          await prismaService.bookmark.update({
            where: { id: existingLike.id },
            data: { deletedAt: new Date() },
          });
          res
            .status(200)
            .json({ message: "Bookmark removed", isBookmarked: false });
        } else {
          await prismaService.bookmark.update({
            where: { id: existingLike.id },
            data: { deletedAt: null },
          });
          res
            .status(200)
            .json({ message: "Post Bookmarked", isBookmarked: true });
        }
        return;
      }

      await prismaService.bookmark.create({
        data: { post_Id: post.id, userId: req.user.id },
      });

      res.status(201).json({ message: "Post Bookmarked", isBookmarked: true });
    } catch (error) {
      next(error);
    }
  };
}

const bookmarkController = new BookmarkController();
export { bookmarkController };
export type { BookmarkController };
