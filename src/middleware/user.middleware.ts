import { verifyJWT } from "@/core";
import { User } from "@/generated/prisma";
import { prismaService } from "@/services/prisma.service";
import { redisService } from "@/services/redis.service";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

// Decoded token interface
interface DecodedToken {
  id: number;
  role?: "user" | "admin";
}

// Extend Express Request to include user property

export const userAuthenticationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
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

    if (!decoded?.id) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        message: "Invalid authentication token format",
      });
      return;
    }

    // Check if token is blacklisted
    const isBlacklisted = await redisService.isTokenBlacklist(
      decoded.id.toString(),
    );
    if (isBlacklisted) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ status: "error", message: "Token has been revoked" });
      return;
    }

    let user = await redisService.getCachedUser(decoded.id);
    if (!user) {
      user = await prismaService.user.findFirst({
        where: { id: decoded.id },
      });
      if (user) await redisService.cacheUser(decoded.id, user, 900);
    }

    if (user) {
      (req as AuthenticationRequest).user = user as User;

      next();
      return;
    }

    // Neither admin nor user found
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

export const authenticateToken = async (token: string) => {
  const decoded = verifyJWT<DecodedToken>(token);

  if (!decoded?.id) {
    throw new Error("Invalid authentication token format");
  }

  const isBlacklisted = await redisService.isTokenBlacklist(
    decoded.id.toString(),
  );
  if (isBlacklisted) {
    throw new Error("Token has been revoked");
  }

  let user = await redisService.getCachedUser(decoded.id);
  if (!user) {
    user = await prismaService.user.findFirst({
      where: { id: decoded.id },
    });
    if (user) await redisService.cacheUser(decoded.id, user, 900);
  }

  if (!user) {
    throw new Error("Invalid authentication token");
  }

  return { user, decoded };
};
