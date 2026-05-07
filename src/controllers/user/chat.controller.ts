import { prismaService } from "@/services/prisma.service";
import { log } from "console";
import { type Request, type Response, type NextFunction } from "express";

class ChatController {
  // GET /user/chat/:ref/conversations
  public getConversations = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const currentUserId = req.user.id as number;

      const conversations = await prismaService.conversation.findMany({
        where: {
          members: { some: { userId: currentUserId } },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  ref: true,
                  firstName: true,
                  lastName: true,
                  userName: true,
                  avatarSrc: true,
                  email: true,
                  bio: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      });
      log("conversationFromDB", conversations);
      const data = conversations.map((conv) => {
        const otherMember = conv.members.find(
          (m) => m.userId !== currentUserId,
        );
        const lastMsg = conv.messages[0] ?? null;

        return {
          id: String(conv.id),
          user: otherMember?.user ?? null,
          lastMessage: lastMsg?.body ?? "",
          messages: conv.messages.map((m) => ({
            id: String(m.id),
            senderId: String(m.senderId),
            body: m.body,
            timestamp: m.createdAt,
          })),
          unreadCount: 0, // add a readAt field to Message later to track this
        };
      });

      log("conversations", data);
      return res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  // POST /user/chat/:ref/conversation
  public getOrCreateConversation = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const currentUserId = req.user.id as number;
      const ref = req.params.ref as string;

      const targetUser = await prismaService.user.findUnique({
        where: { ref },
      });

      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      if (currentUserId === targetUser.id) {
        return res.status(400).json({ message: "Cannot message yourself" });
      }

      const existing = await prismaService.conversation.findFirst({
        where: {
          type: "DM",
          AND: [
            { members: { some: { userId: currentUserId } } },
            { members: { some: { userId: targetUser.id } } },
          ],
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  ref: true,
                  firstName: true,
                  lastName: true,
                  userName: true,
                  avatarSrc: true,
                  email: true,
                  bio: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (existing) {
        return res.status(200).json({ data: existing });
      }

      const conversation = await prismaService.conversation.create({
        data: {
          type: "DM",
          members: {
            create: [{ userId: currentUserId }, { userId: targetUser.id }],
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  ref: true,
                  firstName: true,
                  lastName: true,
                  userName: true,
                  avatarSrc: true,
                  email: true,
                  bio: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      return res.status(201).json({ data: conversation });
    } catch (error) {
      next(error);
    }
  };

  // POST /user/chat/send
  public sendMessage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const currentUserId = req.user.id as number;
      const { conversationId, body } = req.body;

      if (!conversationId || !body?.trim()) {
        return res
          .status(400)
          .json({ message: "conversationId and body are required" });
      }

      // Guard: sender must be a member of the conversation
      const membership = await prismaService.conversationMember.findFirst({
        where: {
          conversationId: Number(conversationId),
          userId: currentUserId,
        },
      });

      if (!membership) {
        return res
          .status(403)
          .json({ message: "You are not a member of this conversation" });
      }

      const message = await prismaService.message.create({
        data: {
          conversationId: Number(conversationId),
          senderId: currentUserId,
          body: body.trim(),
        },
      });

      return res.status(201).json({
        data: {
          id: String(message.id),
          senderId: String(message.senderId),
          content: message.body,
          timestamp: message.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /user/chat/:conversationId/messages
  public getMessages = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const currentUserId = req.user.id as number;
      const conversationId = Number(req.params.conversationId);

      const membership = await prismaService.conversationMember.findFirst({
        where: { conversationId, userId: currentUserId },
      });

      if (!membership) {
        return res
          .status(403)
          .json({ message: "You are not a member of this conversation" });
      }

      const messages = await prismaService.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
      });

      const data = messages.map((m) => ({
        id: String(m.id),
        senderId: String(m.senderId),
        body: m.body,
        createdAt: m.createdAt,
      }));

      return res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };
}

export const chatController = new ChatController();
export type { ChatController };
