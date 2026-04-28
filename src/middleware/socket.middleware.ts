import type { Socket } from "socket.io";
import { authenticateToken } from "./user.middleware";
import { log } from "node:console";

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  try {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImVtYWlsIjoiaGliYWZhcXVyYUBtYWlsaW5hdG9yLmNvbSIsInVzZXJOYW1lIjoic3lsdWdvcGlqIiwiZmlyc3ROYW1lIjoiSG95dCIsImxhc3ROYW1lIjoiT3dlbiIsImlhdCI6MTc3NzI4MjY5NCwiZXhwIjoxNzc5MzU2Mjk0fQ._JL1qoGu2TZBMox45rHl5jINTmznY_ReCcTZYQutqEs";
    //   socket.handshake.auth?.token ??
    //   socket.handshake.headers?.authorization?.split(" ")[1];
    // log("Socket auth token:", socket.handshake.auth?.token);
    log("token:", token);

    if (!token) {
      return next(new Error("Unauthorized: no token provided"));
    }

    const { user, decoded } = await authenticateToken(token);

    // Attach to socket
    socket.data.user = user;
    socket.data.userId = decoded.id;

    next();
  } catch (error: any) {
    next(new Error(error.message || "Unauthorized"));
  }
};
