export interface MessagePayload {
  conversationId: string;
  body: string;
}

export interface MessageResponse {
  id: string;
  body: string;
  conversationId: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; username: string; avatar: string | null };
}

export interface TypingPayload {
  conversationId: string;
  isTyping: boolean;
}

export interface ServerToClientEvents {
  "message:new": (msg: MessageResponse) => void;
  "typing:update": (payload: TypingPayload & { userId: string }) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  "message:send": (
    payload: MessagePayload,
    ack: (msg: MessageResponse) => void,
  ) => void;
  "typing:start": (payload: TypingPayload) => void;
  "typing:stop": (payload: TypingPayload) => void;
  "conversation:join": (conversationId: string) => void;
  "conversation:leave": (conversationId: string) => void;
}
