import { verifyHash, generateToken } from "@/core";
import { prismaService } from "@/services/prisma.service";
import { userService } from "@/services/user.service";
import { type NextFunction, type Request, type Response } from "express";
import createHttpError from "http-errors";

class AdminAuthController {
  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const admin = await prismaService.admin.findFirst({
        where: {
          email,
        },
      });
      if (!admin) throw new createHttpError.BadRequest("admin not found");

      const isVerified = await verifyHash(password, admin.password);
      if (!isVerified)
        throw new createHttpError.Unauthorized("Invalid credentials");

      const token = generateToken(
        userService.extractUserDataForJWT(admin as any),
      );

      const { password: _, ...adminData } = admin;
      res.json({
        message: "Login successful",
        data: {
          admin: adminData,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
export const adminAuthController = new AdminAuthController();
export type { AdminAuthController };
