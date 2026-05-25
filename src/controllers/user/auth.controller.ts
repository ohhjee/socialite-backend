import { ROLE_PERMISSIONS } from "@/config/permission";
import { hashPassword, verifyHash } from "@/core";
import { generateToken } from "@/core/util";
import {
  sendNewPasswordEmail,
  sendResetPasswordEmail,
  sendWelcomeEmail,
} from "@/services/auth.service";
import { prismaService } from "@/services/prisma.service";
import { userService } from "@/services/user.service";
import { generateResetCode } from "@/util/resetCode";
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
      res.status(200).json({
        message: "User created successfully",
        data: {
          user,
          token,
        },
      });
      await sendWelcomeEmail(
        newUser.email,
        newUser.firstName,
        newUser.lastName,
      );
    } catch (error) {
      next(error);
    }
  };
  public verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { email } = req.body;

      const validEmail = await prismaService.user.findUnique({
        where: { email },
      });

      if (!validEmail) {
        throw new createHttpError.Conflict("Email does not exist");
      }

      const existing = await prismaService.passwordToken.findUnique({
        where: { email },
      });

      // ✅ If token exists and is still valid → reuse it
      if (existing && existing.expiredAt > new Date()) {
        // ⚠️ IMPORTANT: You cannot recover original token from hash
        // So either:
        // 1. Don’t resend email
        // OR
        // 2. Store plain token (better for OTP systems)

        return res.json({
          message: "Token already sent. Check your email.",
        });
      }

      // ✅ Generate new token
      const resetToken = generateResetCode();
      const hashedToken = await hashPassword(resetToken);
      const expiredAt = new Date(Date.now() + 15 * 60 * 1000);

      // ✅ Save FIRST
      await prismaService.passwordToken.upsert({
        where: { email },
        update: {
          token: hashedToken,
          expiredAt,
        },
        create: {
          email,
          token: hashedToken,
          expiredAt,
        },
      });

      // ✅ THEN send email
      await sendResetPasswordEmail(email, resetToken);

      res.json({
        message: "Token sent to your mail",
      });
    } catch (error) {
      next(error);
    }
  };
  public verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { token, email } = req.body;

      if (!token) {
        throw new createHttpError.BadRequest("Token is required");
      }

      if (!email) {
        throw new createHttpError.BadRequest("Email is required");
      }

      const tokenStr = String(token).trim();

      const validToken = await prismaService.passwordToken.findUnique({
        where: { email },
      });

      if (!validToken) {
        throw new createHttpError.BadRequest("Invalid token");
      }

      const isMatch = await verifyHash(tokenStr, validToken.token);

      if (!isMatch || validToken.expiredAt < new Date()) {
        throw new createHttpError.BadRequest(
          "Invalid token or token has expired",
        );
      }

      // await prismaService.passwordToken.delete({
      //   where: { email },
      // });

      res.json({
        message: "Token verified",
      });
    } catch (error) {
      next(error);
    }
  };
  public updatePassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { token, email, newPassword } = req.body;
      if (!newPassword) {
        throw new createHttpError.BadRequest("New password is required");
      }
      const getUserToken = await prismaService.passwordToken.findUnique({
        where: { email },
      });

      if (!getUserToken) {
        throw new createHttpError.BadRequest("Invalid token");
      }
      const isMatch = await verifyHash(token, getUserToken.token);
      if (!isMatch) {
        throw new createHttpError.BadRequest("Invalid token");
      }

      const hashedPassword = await hashPassword(newPassword);
      const updatedPassword = await prismaService.user.update({
        where: { email },
        data: {
          password: hashedPassword,
        },
      });
      if (updatedPassword) {
        await prismaService.passwordToken.delete({
          where: { email },
        });
      }

      await sendNewPasswordEmail(email, updatedPassword.userName);
      res.status(200).json({
        message: "Password updated, returning to login page",
      });
    } catch (error) {
      next(error);
    }
  };
}

export const userAuthentication = new UserAuthentication();
export type { UserAuthentication };
