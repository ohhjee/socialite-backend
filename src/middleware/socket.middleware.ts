import type { Socket } from "socket.io";
import { authenticateToken } from "./user.middleware";
import { log } from "node:console";

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  try {
    const token =
      socket.handshake.auth?.token ??
      socket.handshake.headers?.authorization?.split(" ")[1];
    // log("Socket auth token:", token);
    if (!token) {
      return next(new Error("Unauthorized: no token provided"));
    }

    const { user, decoded } = await authenticateToken(token);

    socket.data.user = user;
    socket.data.userId = decoded.id;

    next();
  } catch (error: any) {
    console.error("Socket auth error:", error.message);
    next(new Error(error.message || "Unauthorized"));
  }
};
