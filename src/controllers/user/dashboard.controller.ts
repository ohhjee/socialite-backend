import { generateResetCode } from "@/util/resetCode";
import { prismaService } from "@/services/prisma.service";
import { type Response, type NextFunction } from "express";
import createHttpError from "http-errors";
import { log } from "node:console";
import multer from "multer";
import path from "node:path";
import fs from "fs";
import { hashPassword, verifyHash } from "@/core";
import {
  _FRONTEND_URL_,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
  R2_URL,
} from "@/constant";
import { sendVerificationEmail } from "@/services/auth.service";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/config/cloudflare.r2.config";
import { extractKey } from "@/util/exractKey";

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
      const file = req.file;

      // log(file);
      // return;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // log(image);
      // return;
      // const newAvatarPath = `/uploads/avatars/${ref}/${req.file.filename}`;

      // Fetch current user to get old avatar path
      const currentUser = await prismaService.user.findUnique({
        where: { ref },
        select: { avatarSrc: true },
      });

      if (currentUser?.avatarSrc) {
        const oldKey = extractKey(currentUser.avatarSrc);
        await s3Client.send(
          await new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: oldKey,
          }),
        );
      }

      const cleanFileName = file?.originalname
        .replace(/\s+/g, "-") // replace spaces
        .replace(/[()]/g, "") // remove brackets
        .toLowerCase();
      const fileName = `${ref}-${Date.now()}-${cleanFileName}`;

      const key = `avatar/${fileName}`;

      const newAvatarPath = `${R2_PUBLIC_URL}/${key}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          Body: file?.buffer,
          ContentType: file?.mimetype,
        }),
      );
      // Delete old avatar file if it exists
      // if (currentUser?.avatarSrc) {
      //   const oldFilePath = path.join(
      //     process.cwd(),
      //     currentUser.avatarSrc.replace(/^\/+/, ""), // remove leading slash
      //   );

      //   if (fs.existsSync(oldFilePath)) {
      //     fs.unlinkSync(oldFilePath); // Delete the old file
      //     console.log("Old avatar deleted:", oldFilePath);
      //   }
      // }

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

  public sendVerifyEmail = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const email = req.params.email as string;

      const user = await prismaService.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw createHttpError.NotFound("User not found");
      }

      const token = generateResetCode();
      const hashedToken = await hashPassword(token);
      log(token);

      await prismaService.user.update({
        where: { email },
        data: {
          verification_token: token,
          verification_token_expiry: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      const fdUrl = `${_FRONTEND_URL_}/account?email=${email}&token=${token}`;

      await sendVerificationEmail(email, fdUrl, user.userName);

      return res.status(200).json({ message: "Email sent" });
    } catch (error) {
      next(error);
    }
  };
  public verifyEmailAddress = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { email, token } = req.body;
      log(token);
      if (!email || !token) {
        throw createHttpError.BadRequest("Email and token are required");
      }
      const user = await prismaService.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw createHttpError.NotFound("User not found");
      }
      if (user.is_verified) {
        throw createHttpError.BadRequest("Email already verified");
      }
      log(user.verification_token, token);
      if (!user.verification_token || user.verification_token !== token) {
        throw createHttpError.BadRequest("Invalid token");
      }
      if (
        !user.verification_token_expiry ||
        user.verification_token_expiry < new Date()
      ) {
        throw createHttpError.BadRequest("Token expired");
      }

      await prismaService.user.update({
        where: { email },
        data: {
          is_verified: true,
          verified_at: new Date(),
          verification_token: null,
          verification_token_expiry: null,
        },
      });

      return res.status(200).json({ message: "Email verified" });
    } catch (error) {
      next(error);
    }
  };
}

export const dashboardController = new DashboardController();
export type { DashboardController };
