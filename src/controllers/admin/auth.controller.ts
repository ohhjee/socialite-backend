import { generateToken, hashPassword, verifyHash } from "@/core";
import { adminService } from "@/services/admin.service";
import { prismaService } from "@/services/prisma.service";
import { AdminRole } from "@prisma/client";
import { type NextFunction, type Request, type Response } from "express";
import createHttpError from "http-errors";
import { log } from "node:console";

class AdminAuthController {
  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      log("Admin login attempt:", { email });
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
        adminService.extractUserDataForJWT(admin as any),
      );

      const { password: _, ...adminData } = admin;
      res.json({
        message: "Login successful",
        data: {
          user: adminData,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // TODO:: create admin type later where you choose which admin you want to create e.g super admin, content moderator, support admin.

  public createAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { firstName, lastName, email, password,role } = req.body;
      const admin = await prismaService.admin.create({
        data: {
          firstName,
          lastName,
          email,
          password: await hashPassword(password),
          role
        },
      });
      res.json({ message: "Admin created successfully", data: admin });
    } catch (error) {
      next(error);
    }
  };

}
export const adminAuthController = new AdminAuthController();
export type { AdminAuthController };
