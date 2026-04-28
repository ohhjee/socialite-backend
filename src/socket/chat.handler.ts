import type { Socket } from "socket.io";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  MessagePayload,
} from "@/types/socket";
import { TypedServer } from ".";
import { log } from "console";
import { prismaService } from "@/services/prisma.service";

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export const chatHandler = (io: TypedServer, socket: TypedSocket) => {
  const userId = socket.data.userId as number;
  // const userId = socket.data.userId as string;
  // log(socket.handshake.auth);
  log(`User ${userId} connected with socket ID ${socket.id}`);

  // Join a conversation room — users only receive messages for rooms they joined
  // socket.on("conversation:join", async (conversationId) => {
  //   const member = await prismaService.conversationMember.findUnique({
  //     where: { conversationId_userId: { conversationId, userId } },
  //   });
  //   if (!member)
  //     return socket.emit("error", "Not a member of this conversation");
  //   socket.join(conversationId);
  // });

  // socket.on("conversation:leave", (conversationId) => {
  //   socket.leave(conversationId);
  // });

  // // Send a message — persist first, then broadcast
  // socket.on("message:send", async (payload: MessagePayload, ack) => {
  //   const { conversationId, body } = payload;

  //   // Authorization check
  //   const member = await prismaService.conversationMember.findUnique({
  //     where: { conversationId_userId: { conversationId, userId } },
  //   });
  //   if (!member) return socket.emit("error", "Not authorized");

  //   const message = await prismaService.message.create({
  //     data: { body, conversationId, senderId: userId },
  //     include: {
  //       sender: { select: { id: true, username: true, avatar: true } },
  //     },
  //   });

  //   const response = {
  //     ...message,
  //     createdAt: message.createdAt.toISOString(),
  //   };

  //   // Broadcast to every member in the room (including sender)
  //   io.to(conversationId).emit("message:new", response);

  //   // Acknowledge the sender with the persisted message
  //   ack(response);
  // });

  // // Typing indicators — no DB, pure real-time
  // socket.on("typing:start", ({ conversationId }) => {
  //   socket
  //     .to(conversationId)
  //     .emit("typing:update", { conversationId, userId, isTyping: true });
  // });

  // socket.on("typing:stop", ({ conversationId }) => {
  //   socket
  //     .to(conversationId)
  //     .emit("typing:update", { conversationId, userId, isTyping: false });
  // });
};
