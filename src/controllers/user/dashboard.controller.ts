import { prismaService } from "@/services/prisma.service";
import { type Response, type NextFunction } from "express";
import createHttpError from "http-errors";
import { log } from "node:console";
import multer from "multer";
import path from "node:path";
import fs from "fs";

class DashboardController {
  // public me = async (
  //   req: AuthenticationRequest,
  //   res: Response,
  //   next: NextFunction,
  // ) => {
  //   const userName = req.params.userName as string;

  //   const user = await prismaService.user.findUnique({
  //     where: { userName },
  //     omit: { password: true },
  //     include: {
  //       payments: true,
  //       posts: true,
  //       likes: {
  //         include: { post: true },
  //       },
  //       userGroups: { include: { group: true } },
  //       _count: {
  //         select: { posts: true, groups: true },
  //       },
  //     },
  //   });

  //   if (!user) throw createHttpError.NotFound("User not found");

  //   res.json({ status: "success", data: user });
  // };

  // public me = async (
  //   req: AuthenticationRequest,
  //   res: Response,
  //   next: NextFunction,
  // ) => {
  //   try {
  //     const userName = req.params.userName as string;

  //     const user = await prismaService.user.findUnique({
  //       where: { userName },
  //       omit: { password: true },
  //       include: {
  //         payments: true,

  //         posts: {
  //           orderBy: { createdAt: "desc" },
  //           include: {
  //             likes: {
  //               where: { deletedAt: null }, // only active likes
  //             },
  //           },
  //         },

  //         likes: {
  //           where: { deletedAt: null }, // exclude soft deleted
  //           include: {
  //             post: {
  //               include: {
  //                 user: {
  //                   select: {
  //                     firstName: true,
  //                     lastName: true,
  //                     userName: true,
  //                     // avatar: true,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },

  //         // Groups I am admin of
  //         groups: true,
  //         joinedGroups: {
  //           include: {
  //             group: {
  //               include: {
  //                 _count: { select: { userGroups: true } },
  //               },
  //             },
  //           },
  //         },

  //         // Groups I joined (via pivot table)
  //         // userGroups: {
  //         //   include: { group: true },
  //         // },

  //         _count: {
  //           select: { posts: true, groups: true },
  //         },
  //       },
  //     });

  //     if (!user) throw createHttpError.NotFound("User not found");

  //     res.json({ status: "success", data: user });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  public me = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const ref = req.params.ref as string;
      log("user-ref: ", ref);
      const user = await prismaService.user.findUnique({
        where: { ref },
        omit: { password: true },
        include: {
          payments: true,

          posts: {
            orderBy: { createdAt: "desc" },
            include: {
              likes: {
                where: { deletedAt: null }, // only active likes
              },
            },
          },

          likes: {
            where: { deletedAt: null },
            include: {
              post: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      userName: true,
                      // avatar: true,
                    },
                  },
                },
              },
            },
          },

          // Groups I am admin of
          groups: {
            include: {
              joinedGroups: true, // ← this is the actual membership table
              _count: { select: { joinedGroups: true } }, // ← count this, not userGroups
            },
          },

          joinedGroups: {
            include: {
              groups: {
                include: {
                  _count: { select: { joinedGroups: true } }, // ← same here
                },
              },
            },
          },

          // Groups I joined (via pivot table)
          // userGroups: {
          //   include: { group: true },
          // },

          // _count: {
          //   select: { posts: true, groups: true, joinedGroups: true },
          // },
        },
      });

      if (!user) throw createHttpError.NotFound("User not found");

      res.json({ status: "success", data: user });
    } catch (error) {
      next(error);
    }
  };

  public getProfile = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const ref = req.params.ref as string;
      // const { bio } = req.body as { bio?: string };
      log("Fetching profile for user:", ref);

      const user = await prismaService.user.findUnique({
        where: { ref },
        include: {
          posts: true,
          userGroups: { include: { groups: true } },
          groups: true,
          payments: true,
          _count: {
            select: { posts: true, userGroups: true },
          },
        },
        omit: { password: true },
      });
      log("User profile data:", user);
      if (!user) throw createHttpError.NotFound("User not found");

      res.json({ status: "success", data: user });
    } catch (error) {
      next(error);
    }
  };
  public uploadAvatar = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const ref = req.params.ref as string;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const newAvatarPath = `/uploads/avatars/${ref}/${req.file.filename}`;

      // Fetch current user to get old avatar path
      const currentUser = await prismaService.user.findUnique({
        where: { ref },
        select: { avatarSrc: true },
      });

      // Delete old avatar file if it exists
      if (currentUser?.avatarSrc) {
        const oldFilePath = path.join(
          process.cwd(),
          currentUser.avatarSrc.replace(/^\/+/, ""), // remove leading slash
        );

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath); // Delete the old file
          console.log("Old avatar deleted:", oldFilePath);
        }
      }

      // Update database with new avatar
      const updatedUser = await prismaService.user.update({
        where: { ref },
        data: { avatarSrc: newAvatarPath },
        select: {
          id: true,
          userName: true,
          avatarSrc: true,
          firstName: true,
          lastName: true,
          email: true,
          bio: true,
        },
      });

      res.status(200).json({
        success: true,
        message: "Avatar uploaded successfully",
        data: {
          avatar: updatedUser.avatarSrc,
        },
        user: updatedUser,
      });
    } catch (error: any) {
      console.error("Upload avatar error:", error);

      if (error.code === "P2025") {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.status(500).json({
        success: false,
        message: "Failed to upload avatar",
        error: error.message,
      });
    }
  };
  public updateProfile = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const ref = req.params.ref as string;
    const { userName, bio } = req.body;

    try {
      const updatedUser = await prismaService.user.update({
        where: { ref },

        data: { userName, bio },
        omit: { password: true },
      });
      if (!updatedUser) throw createHttpError.NotFound("User not found");

      res.json({
        status: "success",
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  };
  public getOverview = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.user;

      const userDetails = await prismaService.user.findUnique({
        where: { id },
        include: {
          payments: true,
        },
        omit: {
          password: true,
        },
      });

      if (!userDetails) {
        throw createHttpError.NotFound("User not found");
      }

      // Optional: Make avatar URL absolute if needed
      const userWithFullAvatar = {
        ...userDetails,
        avatar: userDetails.avatarSrc
          ? userDetails.avatarSrc.startsWith("http")
            ? userDetails.avatarSrc
            : `/uploads/avatars/${userDetails.userName}/${userDetails.avatarSrc.split("/").pop()}`
          : null,
      };

      res.json({
        status: "success",
        data: userWithFullAvatar,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const dashboardController = new DashboardController();
export type { DashboardController };
