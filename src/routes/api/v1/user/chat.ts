import { chatController } from "@/controllers/user/chat.controller";
import { groupController } from "@/controllers/user/group.controller";

import { userAuthenticationMiddleware } from "@/middleware/user.middleware";
import { Router } from "express";

const router = Router();
export function ChatRouter(): Router {
  // routes/chat.route.ts
  router.get("/:ref/conversations", chatController.getConversations);
  router.post("/:ref/conversation", chatController.getOrCreateConversation);
  router.post("/send", chatController.sendMessage);
  router.get("/:conversationId/messages", chatController.getMessages);

  return router;
}
