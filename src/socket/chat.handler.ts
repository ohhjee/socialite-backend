import type { Socket } from "socket.io";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  MessagePayload,
  MessageResponse,
} from "@/types/socket";

import { TypedServer } from ".";
import { prismaService } from "@/services/prisma.service";

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

const onlineUsers = new Map<number, string>();

export const chatHandler = (io: TypedServer, socket: TypedSocket) => {
  const userId = socket.data.userId as number;

  const getRoom = (id: string | number): string => String(id).trim();

  console.log(`User ${userId} connected → Socket ID: ${socket.id}`);

  const markOnline = () => {
    onlineUsers.set(userId, socket.id);
    io.emit("user:status", { userId, isOnline: true });
    console.log(` User ${userId} ONLINE | Total: ${onlineUsers.size}`);
  };

  const markOffline = () => {
    onlineUsers.delete(userId);
    io.emit("user:status", { userId, isOnline: false });
    console.log(` User ${userId} OFFLINE | Remaining: ${onlineUsers.size}`);
  };

  markOnline();

  // Handle disconnect properly
  socket.on("disconnect", () => {
    setTimeout(() => {
      if (onlineUsers.get(userId) === socket.id) {
        markOffline();
      }
    }, 800); // 800ms delay helps with reloads
  });

  // Allow manual status request
  socket.on("user:request-online", () => {
    const onlineList = Array.from(onlineUsers.keys());
    socket.emit("user:online-list", onlineList);
  });

  socket.on("conversation:join", async (conversationId: string | number) => {
    const room = getRoom(conversationId);
    console.log(`User ${userId} trying to join room: ${room}`);

    const member = await prismaService.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId: Number(conversationId),
          userId,
        },
      },
    });

    if (!member) {
      console.log(`User ${userId} is NOT a member of ${room}`);
      return socket.emit("error", "Not a member of this conversation");
    }

    socket.join(room);
    console.log(`✅ User ${userId} joined room: ${room}`);
  });

  socket.on("conversation:leave", (conversationId: string | number) => {
    socket.leave(getRoom(conversationId));
  });

  // ====================== SEND MESSAGE ======================
  socket.on(
    "message:send",
    async (
      payload: MessagePayload,
      ack: (res: MessageResponse | null) => void,
    ) => {
      try {
        const conversationIdNum = Number(payload.conversationId);
        const room = getRoom(payload.conversationId);

        if (isNaN(conversationIdNum)) return ack(null);

        const member = await prismaService.conversationMember.findUnique({
          where: {
            conversationId_userId: {
              conversationId: conversationIdNum,
              userId,
            },
          },
        });

        if (!member) return ack(null);

        const message = await prismaService.message.create({
          data: {
            body: payload.body,
            conversationId: conversationIdNum,
            senderId: userId,
          },
          include: { sender: true },
        });

        io.to(room).emit("message:new", message);

        console.log(`Message sent in room ${room} by user ${userId}`);

        ack(message);
      } catch (err) {
        console.error("Socket send error:", err);
        ack(null);
      }
    },
  );

  socket.on(
    "typing:start",
    ({ conversationId }: { conversationId: string | number }) => {
      const room = getRoom(conversationId);
      // Emit to others only (exclude sender)
      socket.to(room).emit("typing:update", {
        userId,
        conversationId: room,
        isTyping: true,
      });
    },
  );

  socket.on(
    "typing:stop",
    ({ conversationId }: { conversationId: string | number }) => {
      const room = getRoom(conversationId);
      socket.to(room).emit("typing:update", {
        userId,
        conversationId: room,
        isTyping: false,
      });
    },
  );
};
