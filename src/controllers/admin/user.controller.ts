import { canDelete } from "@/policy/canDelete";
import { prismaService } from "@/services/prisma.service";
import { type Request, type Response, type NextFunction } from "express";
import createHttpError from "http-errors";
import { log } from "node:console";

class AdminUserController {
  public getUser = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const admin = req.admin;
    // log("Admin fetching their data:", { ref });
    try {
      log("Admin logged in:", admin);
      log("Admin ref check:", { adminRef: admin?.ref, adminExists: !!admin });
      if (!admin || !admin.ref) {
        throw new createHttpError.Unauthorized("You are not logged in");
      }
      const user = await prismaService.admin.findUnique({
        where: { ref: admin.ref },
        omit: { password: true },
      });
      if (!user) throw new createHttpError.NotFound("Admin not found");
      res.json({
        message: "Admin fetched successfully",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };
  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await prismaService.user.findMany({
        omit: { password: true },
      });
      const userCount = await prismaService.user.count();
      const verifiedUsersCount = await prismaService.user.count({
        where: { is_verified: true },
      });
      const unverifiedUsersCount = await prismaService.user.count({
        where: { is_verified: null },
      });
      res.json({
        message: "Users fetched successfully",
        data: { users, userCount, verifiedUsersCount, unverifiedUsersCount },
      });
    } catch (error) {
      next(error);
    }
  };
  public getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const ref = req.params.ref as string;
      const user = await prismaService.user.findUnique({
        where: { ref },
        include: {
          posts: { include: { likes: true, comments: true, bookmarks: true } },
          groups: { include: { groupPosts: true } },
          joinedGroups: {
            include: {
              groups: { include: { groupPosts: { include: { user: true } } } },
            },
          },
        },
        omit: { password: true },
      });
      if (!user) {
        throw new createHttpError.NotFound("User not found");
      }
      res
        .status(200)
        .json({ message: "User fetched successfully", data: user });
    } catch (error) {
      next(error);
    }
  };
  public suspendUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const ref = req.params.ref as string;
      const user = await prismaService.user.findUnique({ where: { ref } });
      if (!user) {
        throw new createHttpError.NotFound("User not found");
      }
      if (user.softDelete) {
        throw new createHttpError.BadRequest("User is already suspended");
      }
      await prismaService.user.update({
        where: { ref },
        data: { softDelete: new Date() },
      });
      res
        .status(200)
        .json({ message: "User suspended successfully", data: user });
    } catch (error) {
      next(error);
    }
  };
  public unSuspendUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const ref = req.params.ref as string;
      const user = await prismaService.user.findUnique({ where: { ref } });
      if (!user) {
        throw new createHttpError.NotFound("User not found");
      }
      if (!user.softDelete) {
        throw new createHttpError.BadRequest("User is not suspended");
      }
      await prismaService.user.update({
        where: { ref },
        data: { softDelete: null },
      });
      res
        .status(200)
        .json({ message: "User unsuspended successfully", data: user });
    } catch (error) {
      next(error);
    }
  };
}

export const adminUserController = new AdminUserController();
export type { AdminUserController };
