import type { Request } from "express";
import type { z } from "zod";
import type { Admin, Post, User } from "@/generated/prisma/client";

declare global {
  namespace Express {
    interface Request {
      admin?: SUPERADMIN; // made optional
      user?: User;
      // vendor?: Vendor;
      post?: Post;
    }
  }

  type zInfer<T extends z.ZodSchema> = z.infer<T>;

  // Better approach for validated requests
  interface ValidatedRequest<T extends z.ZodSchema> extends Request {
    body: z.infer<T>;
  }

  // Fixed AuthenticationRequest
  interface AuthenticationRequest extends Request {
    admin?: SUPERADMIN;
    user?: User;
    post?: Post;
    // body is automatically inherited from Request
  }
}
