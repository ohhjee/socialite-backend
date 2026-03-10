// import { User } from './../generated/prisma/models/User';
import { User } from "@/generated/prisma";
// import type { User } from "@prisma/client";

class UserService {
  /**
   * Extract user data for JWT token
   */
  public extractUserDataForJWT(
    user: User
  ): Record<string, string | number | string[]> {
    return {
      id: user.id,
      email: user.email,
      userName: user.userName ?? "",
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
    };
  }
}

export const userService = new UserService();
export type { UserService };
