import { prismaService } from "@/services/prisma.service";
import { NextFunction, Response } from "express";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { log } from "node:console";

class GroupController {
  public createGroup = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = req.user;
      const { name } = req.body;

      if (!name) {
        throw new createHttpError.Conflict("Group name is required");
      }
      const existingGroup = await prismaService.group.findUnique({
        where: {
          name: name.trim(),
        },
      });
      if (existingGroup) {
        throw new createHttpError.Conflict("Group already exists");
      }
      const newGroup = await prismaService.group.create({
        data: {
          name: name,
          admin: { connect: { id: user.id } },
        },
        include: {
          joinedGroup: true,
        },
      });
      await prismaService.joinedGroup.create({
        data: {
          user: { connect: { id: user.id } },
          group: { connect: { id: newGroup.id } },
        },
      });

      const userGroup = await prismaService.group.findFirst({
        where: { id: newGroup.id },
        include: {
          joinedGroup: { include: { user: true, group: true } },
        },
      });
      await prismaService.userGroup.create({
        data: { userId: user.id, groupId: newGroup.id },
      });

      res.status(StatusCodes.CREATED).json({
        status: "success",
        data: userGroup,
      });
    } catch (error) {
      next(error);
    }
  };

  public getAllGroups = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const allGroup = await prismaService.group.findMany({
        include: {
          joinedGroups: { include: { user: true } },
          // joinedGroup: { include: { user: true } }, // ← consistent name
          // joinedGroups: { include: { user: true } },
          groupPosts: true,
        },
      });
      res.status(StatusCodes.OK).json({
        status: "Groups fetched successfully",
        data: allGroup,
      });
    } catch (error) {
      next(error);
    }
  };
  public getGroupById = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const groupId = parseInt(String(id));
      const findGroup = await prismaService.group.findUnique({
        where: { id: groupId },
      });
      if (!findGroup) {
        throw new createHttpError.NotFound("Group not found");
      }

      const group = await prismaService.group.findUnique({
        where: { id: groupId },

        include: {
          joinedGroups: { include: { user: { omit: { password: true } } } },
          groupPosts: {
            include: { user: { omit: { password: true } } },
            orderBy: { createdAt: "desc" },
          },
          // {
          //   include: {
          //     post: { include: { user: { omit: { password: true } } } },
          //   },
          // },
          // post: true,
        },
      });
      if (!group) {
        throw new createHttpError.NotFound("Group not found");
      }
      res.status(StatusCodes.OK).json({
        status: "Group fetched successfully",
        data: group,
      });
    } catch (error) {
      next(error);
    }
  };

  public joinGroup = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = req.user;
      const { id } = req.params;
      const groupId = parseInt(String(id));
      if (!groupId) {
        throw new createHttpError.BadRequest("Invalid group ID");
      }

      const findGroup = await prismaService.group.findUnique({
        where: { id: groupId },
      });
      if (!findGroup) {
        throw new createHttpError.NotFound("Group not found");
      }

      const existingUserGroup = await prismaService.userGroup.findUnique({
        where: {
          userId_groupId: { userId: user.id, groupId },
        },
      });

      if (existingUserGroup) {
        throw new createHttpError.Conflict("User has already joined the group");
      }

      const joinGroup = await prismaService.joinedGroup.create({
        data: {
          user: { connect: { id: user.id } },
          groups: { connect: { id: groupId } },
        },
      });

      await prismaService.userGroup.upsert({
        where: { userId_groupId: { userId: user.id, groupId } },
        update: {},
        create: { userId: user.id, groupId },
      });

      res.status(StatusCodes.OK).json({
        status: "Joined group successfully",
        data: joinGroup,
      });
    } catch (error) {
      next(error);
    }
  };

  public leaveGroup = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = req.user;
      const { id } = req.params;
      const groupId = parseInt(String(id));

      if (!groupId) {
        throw new createHttpError.BadRequest("Invalid group ID");
      }

      const findGroup = await prismaService.group.findUnique({
        where: { id: groupId },
      });
      if (!findGroup) {
        throw new createHttpError.NotFound("Group not found");
      }

      // Check BOTH tables
      const existingUserGroup = await prismaService.userGroup.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } },
      });
      const existingJoinedGroup = await prismaService.joinedGroup.findFirst({
        where: { userId: user.id, groupId }, // 👈 findFirst not findUnique
      });

      if (!existingUserGroup && !existingJoinedGroup) {
        throw new createHttpError.NotFound("User has not joined the group");
      }

      // Delete from joinedGroup using its id
      if (existingJoinedGroup) {
        await prismaService.joinedGroup.delete({
          where: { id: existingJoinedGroup.id }, // 👈 use id, not composite
        });
      }

      // Delete from userGroup using composite key
      if (existingUserGroup) {
        await prismaService.userGroup.delete({
          where: { userId_groupId: { userId: user.id, groupId } },
        });
      }

      res.status(StatusCodes.OK).json({
        status: "Left group successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public getGroupMembers = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const groupId = parseInt(String(id));
      const findGroup = await prismaService.group.findUnique({
        where: { id: groupId },
      });
      if (!findGroup) {
        throw new createHttpError.NotFound("Group not found");
      }
      const members = await prismaService.joinedGroup.findMany({
        where: { groupId: groupId },
        include: { user: true },
      });
      res.status(StatusCodes.OK).json({
        status: "Group members fetched successfully",
        data: members,
      });
    } catch (error) {
      next(error);
    }
  };
}

const groupController = new GroupController();
export { groupController };
export type { GroupController };
