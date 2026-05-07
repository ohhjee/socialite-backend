export interface MessagePayload {
  conversationId: string | number;
  body: string;
}

export interface MessageResponse {
  id: string | number;
  body: string;
  conversationId: string | number;
  senderId: string | number;
  createdAt: Date | string;
  sender?: {
    id: string | number;
    username?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string | null;
  };
}

export interface TypingPayload {
  conversationId: string | number;
  isTyping: boolean;
}

export interface UserStatusPayload {
  userId: string | number;
  isOnline: boolean;
}

export interface ServerToClientEvents {
  "message:new": (msg: MessageResponse) => void;

  // Online Status
  "user:status": (payload: UserStatusPayload) => void;
  "user:online-list": (onlineUserIds: (string | number)[]) => void;

  // Typing
  "typing:update": (
    payload: TypingPayload & { userId: string | number },
  ) => void;

  // Error
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  "message:send": (
    payload: MessagePayload,
    ack: (msg: MessageResponse | null) => void,
  ) => void;

  "conversation:join": (conversationId: string | number) => void;
  "conversation:leave": (conversationId: string | number) => void;

  // Typing
  "typing:start": (payload: TypingPayload) => void;
  "typing:stop": (payload: TypingPayload) => void;

  // Online Status
  "user:request-online": () => void;
  "user:status:update": (payload: UserStatusPayload) => void;
}
//
