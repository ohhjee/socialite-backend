import type { Request } from "express";
import type { z } from "zod";
import type { Admin, User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      admin: SUPERADMIN;
      //   vendor: Vendor;
      user: User;
    }
  }
  type zInfer<T extends z.ZodSchema> = z.infer<T>;

  interface ValidatedRequest<T extends z.ZodSchema> extends Request {
    body: z.infer<T>;
  }

  interface AuthenticationRequest extends Request {
    admin: SUPERADMIN;
    // vendor: Vendor;
    user: User;
  }
}
