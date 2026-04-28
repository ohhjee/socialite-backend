import { prismaService } from "@/services/prisma.service";
import { type Request, type Response, type NextFunction } from "express";
import { log } from "node:console";

class ChatController {
  public getOrCreateConversation = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const currentUserId = req.user.id as number;
      const { targetUserId, type = "DM" } = req.body;
      log("getOrCreateConversation called with:", {
        currentUserId,
        targetUserId,
        type,
        // name,
        // memberIds,
      });
      return;

      // ── DM ────────────────────────────────────────────────────
      if (type === "DM") {
        if (!targetUserId) {
          return res
            .status(400)
            .json({ message: "targetUserId is required for DM" });
        }
        if (currentUserId === targetUserId) {
          return res.status(400).json({ message: "Cannot message yourself" });
        }

        // Check if DM already exists between these two users
        const existing = await prismaService.conversation.findFirst({
          where: {
            type: "DM",
            AND: [
              { members: { some: { userId: currentUserId } } },
              { members: { some: { userId: targetUserId } } },
            ],
          },
          include: {
            members: {
              include: {
                user: { select: { id: true, userName: true, avatarSrc: true } },
              },
            },
          },
        });

        if (existing) return res.status(200).json({ data: existing });

        const conversation = await prismaService.conversation.create({
          data: {
            type: "DM",
            members: {
              create: [{ userId: currentUserId }, { userId: targetUserId }],
            },
          },
          include: {
            members: {
              include: {
                user: { select: { id: true, userName: true, avatarSrc: true } },
              },
            },
          },
        });

        return res.status(201).json({ data: conversation });
      }

      // ── GROUP ─────────────────────────────────────────────────
      if (type === "GROUP") {
        if (!name) {
          return res
            .status(400)
            .json({ message: "name is required for group" });
        }
        if (!memberIds || memberIds.length < 2) {
          return res
            .status(400)
            .json({ message: "Group needs at least 2 other members" });
        }

        const allMemberIds: number[] = [
          currentUserId,
          ...memberIds.map(Number),
        ];

        const conversation = await prismaService.conversation.create({
          data: {
            type: "GROUP",
            name,
            members: {
              create: allMemberIds.map((userId) => ({
                userId,
                isAdmin: userId === currentUserId, // creator is admin
              })),
            },
          },
          include: {
            members: {
              include: {
                user: { select: { id: true, userName: true, avatarSrc: true } },
              },
            },
          },
        });

        return res.status(201).json({ data: conversation });
      }

      res.status(400).json({ message: "type must be DM or GROUP" });
    } catch (error) {
      next(error);
    }
  };
}
export const chatController = new ChatController();
export type { ChatController };
