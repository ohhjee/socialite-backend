import { ROLE_PERMISSIONS } from "@/config/permission";
import { hashPassword, verifyHash } from "@/core";
import { generateToken } from "@/core/util";
import { prismaService } from "@/services/prisma.service";
import { userService } from "@/services/user.service";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import createHttpError from "http-errors";
import { log } from "node:console";

class UserAuthentication {
  public login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    try {
      const user = await prismaService.user.findFirst({
        where: {
          email,
        },
      });
      if (!user) throw new createHttpError.Conflict("user not found");

      const isVerified = await verifyHash(password, user.password);
      if (!isVerified)
        throw new createHttpError.Conflict("Invalid credentials");

      const token = generateToken(userService.extractUserDataForJWT(user));
      const { password: _, ...userData } = user;
      res.json({
        message: "User logged in successfully",
        data: {
          user: userData,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  };
  public registerUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { firstName, lastName, userName, email, password } = req.body;
      const existingEmail = await prismaService.user.findFirst({
        where: {
          email,
        },
      });
      // const roles = await prismaService.role.findUnique({
      //   where: { id: 4 },
      // });

      if (existingEmail)
        throw new createHttpError.Conflict("email already exists");
      const existingUsername = await prismaService.user.findFirst({
        where: {
          email,
        },
      });
      if (existingUsername)
        throw new createHttpError.Conflict("Username already exists");

      const hashPwd = await hashPassword(password);
      const newUser = await prismaService.user.create({
        data: {
          firstName,
          lastName,
          userName,
          email,
          password: hashPwd,
        },
      });
      const token = generateToken(userService.extractUserDataForJWT(newUser));
      const { password: _, ...user } = newUser;
      res.json({
        message: "User created successfully",
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const userAuthentication = new UserAuthentication();
export type { UserAuthentication };
