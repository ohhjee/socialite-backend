import { verifyJWT } from "@/core";
import { prismaService } from "@/services/prisma.service";
import { redisService } from "@/services/redis.service";
import { Admin } from "@prisma/client";
import {type NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { log } from "node:console";

// Decoded token interface
interface DecodedToken {
  id: number;
  ref: string;
  role?: "user" | "admin";
}

export const adminAuthenticationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  log("Admin auth middleware triggered for:", req.path);
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ status: "error", message: "You are not logged in" });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyJWT<DecodedToken>(token);
    // console.log("Authorization:", req.headers.authorization);
    // console.log("Admin:", req.admin);
    log("Token decoded:", { decoded, hasRef: !!decoded?.ref });
    if (!decoded?.ref) {
      log("Decoded token missing ref:", { decoded });
      res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        message: "Invalid authentication token format",
      });
      return;
    }

    // Check if token is blacklisted
    const isBlacklisted = await redisService.isTokenBlacklist(decoded.ref);
    log("Token blacklist check:", { ref: decoded.ref, isBlacklisted });
    if (isBlacklisted) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ status: "error", message: "Token has been revoked" });
      return;
    }

    let admin = await redisService.getCachedAdmin(decoded.ref);
    log("Admin auth middleware - cached admin:", {
      hasCachedAdmin: !!admin,
      ref: decoded.ref,
    });
    if (!admin) {
      log("No cached admin, checking database for ref:", decoded.ref);
      admin = await prismaService.admin.findFirst({
        where: { ref: decoded.ref },
      });
      // log("Database admin lookup:", {
      //   found: !!admin,
      //   adminId: admin?.id,
      // });
      if (admin) await redisService.cacheAdmin(decoded.ref, admin, 900);
    }

    if (admin) {
      (req as AuthenticationRequest).admin = admin as Admin;
      log("Middleware setting admin:", {
        adminSet: !!req.admin,
        adminRef: (req as AuthenticationRequest).admin?.ref,
      });
      next();
      return;
    }

    // Neither admin nor user found
    log("Admin not found in DB or cache");
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ status: "error", message: "Invalid authentication token" });
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      status: "error",
      message: "Invalid token",
    });
  }
};

export const requireRole =
  (...roles: string[]) =>
  (req: AuthenticationRequest,res:Response, next: NextFunction) => {
    log("roles:", roles);
    const role = req.admin.role;
    if (!role) {
      throw new createHttpError.Unauthorized("Unauthorized access");
    }
    if (!roles.includes(role)) {
      throw new createHttpError.Forbidden("Forbidden");
    }

    next();
  };
