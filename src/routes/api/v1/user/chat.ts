import { chatController } from "@/controllers/user/chat.controller";
import { groupController } from "@/controllers/user/group.controller";

import { userAuthenticationMiddleware } from "@/middleware/user.middleware";
import { Router } from "express";

const router = Router();
export function ChatRouter(): Router {
  router.post("/conversations", chatController.getOrCreateConversation);

  return router;
}
