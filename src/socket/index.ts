import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@/types/socket";
import { socketAuthMiddleware } from "@/middleware/socket.middleware";
import { chatHandler } from "./chat.handler";
import { log } from "console";

export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
let io: TypedServer;

export const initSocket = (httpServer: HttpServer): TypedServer => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });
  io.use(socketAuthMiddleware);
  io.on("connection", (socket) => {
    log(socket.handshake.auth.userId);
    console.log(`Socket connected: ${socket.id} | User: ${socket.data}`);
    chatHandler(io, socket);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): TypedServer => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};
