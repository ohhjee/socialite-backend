// import { User } from './../generated/prisma/models/User';
import { User } from "@prisma/client";
// import type { User } from "@prisma/client";

class UserService {
  /**
   * Extract user data for JWT token
   */
  public extractUserDataForJWT(
    user: User,
  ): Record<string, string | number | string[]> {
    return {
      id: user.id,
      email: user.email,
      userName: user.userName ?? "",
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      ref: user.ref ?? "",
    };
  }
}

export const userService = new UserService();
export type { UserService };
