// import { User } from './../generated/prisma/models/User';
import { Admin, User } from "@prisma/client";
// import type { User } from "@prisma/client";

class AdminService {
  /**
   * Extract user data for JWT token
   */
  public extractUserDataForJWT(
    admin: Admin,
  ): Record<string, string | number | string[]> {
    return {
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName ?? "",
      lastName: admin.lastName ?? "",
      ref: admin.ref ?? "",
      // type: "admin",
    role: admin.role,
// TODO: MAKE SURE YOU GENERATE TOMORROW THEN PUSH USING PRISMA
// TODO: 
    // mustChangePassword: admin.mustChangePassword,

    };
  }
}

export const adminService = new AdminService();
export type { AdminService };
