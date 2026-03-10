import { prismaService } from "@/services/prisma.service";
import { type Response, type NextFunction } from "express";
import createHttpError from "http-errors";
import { log } from "node:console";

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
      const userName = req.params.userName as string;

      const user = await prismaService.user.findUnique({
        where: { userName },
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
    const userName = req.params.userName as string;
    log("Fetching profile for user:", userName);

    // In your backend controller
    const user = await prismaService.user.findUnique({
      where: { userName },
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
  };
  public getOverview = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const { id } = req.user;
    const userDetails = await prismaService.user.findUnique({
      where: {
        id,
      },
      include: {
        payments: true,
      },
      omit: {
        password: true,
      },
    });

    log("User Details:", userDetails);

    if (!userDetails) {
      throw createHttpError.NotFound("User not found");
    }

    res.json({ status: "fetch good", data: userDetails });
  };
}

export const dashboardController = new DashboardController();
export type { DashboardController };
