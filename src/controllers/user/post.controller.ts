import { initWinstonLogger } from "@/core";
import { TicketIdGenerator } from "@/core/ticketGenerator";
import { canDelete } from "@/policy/canDelete";
import { prismaService } from "@/services/prisma.service";
import { redisService } from "@/services/redis.service";
import { type NextFunction, type Response } from "express";
import createHttpError from "http-errors";
import { log } from "node:console";
import { includes } from "zod/v4";

const logger = initWinstonLogger("post.log");

class PostController {
  public createGroupPost = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = req.user;
      const { title, groupId } = req.body;

      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }
      const userGroup = await prismaService.userGroup.findFirst({
        where: { userId: user.id },
      });
      if (!userGroup) {
        return res.status(403).json({ message: "You are not in any group" });
      }
      const newPost = await prismaService.groupPost.create({
        // data: { message: title, userId: user.id },
        data: { message: title, userId: user.id, groupId: groupId },
      });
      // if (userGroup) {
      //   await prismaService.groupPost.create({
      //     data: { groupId: userGroup.groupId },
      //   });
      // }
      logger.info(
        `Group-post ticket-id: ${TicketIdGenerator.generateTicketId()}`,
      );

      log(newPost);
      res.json({ message: "Post created successfully", data: newPost });
    } catch (error) {
      logger.error(
        `Group-post ticket-id: ${TicketIdGenerator.generateTicketId()}`,
        error,
      );
      next(error);
    }
  };

  public getAllPosts = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = req.user;
      const posts = await prismaService.post.findMany({
        include: {
          user: { omit: { password: true } },
          likes: { where: { deletedAt: null } },
        },
      });
      const getCachedPost = redisService.getCachedPosts(`all_posts_${user.id}`);
      const postsWithMeta = posts.map((post) => ({
        ...post,
        isLiked: post.likes.some((like) => like.userId === user.id),
        likes: post.likes.length,
      }));

      if (!getCachedPost) {
        redisService.CachedPosts(`all_posts_${user.id}`, posts);
      }
      res.json({ message: "Posts fetched successfully", data: postsWithMeta });
      // res.json({ message: "Posts fetched successfully", data: posts });
    } catch (error) {
      next(error);
    }
  };

  public getMyPosts = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = req.user;
      const posts = await prismaService.post.findMany({
        where: { userId: user.id },
      });
      const getCachedPost = redisService.getCachedPosts(`my_posts_${user.id}`);

      if (!getCachedPost) {
        redisService.CachedPosts(`my_posts_${user.id}`, posts);
      }
      res.json({ message: "Posts fetched successfully", data: posts });
    } catch (error) {
      next(error);
    }
  };
  public getPostsByUserId = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { userId } = req.params;

      const posts = await prismaService.post.findMany({
        where: { userId: Number(userId) },
      });
      const getCachedPost = redisService.getCachedPosts(
        `individual_user_${userId}`,
      );

      if (!getCachedPost) {
        redisService.CachedPosts(`individual_user_${userId}`, posts);
      }
      res.json({ message: "Posts fetched successfully", data: posts });
    } catch (error) {
      next(error);
    }
  };

  public getGroupPosts = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {};

  public createPost = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = req.user;
      const { title } = req.body;

      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }
      const newPost = await prismaService.post.create({
        data: { title, userId: user.id },
      });
      logger.info(
        `post ticket-id: ${TicketIdGenerator.generateTicketId()}, postId: ${newPost.id}, postTitle: ${newPost.title},userId: ${user.id}`,
      );
      res.json({ message: "Post created successfully", data: newPost });
    } catch (error) {
      logger.error(
        `error ticket-id: ${TicketIdGenerator.generateTicketId()}`,
        error,
      );
      next(error);
    }
  };

  public deleteUserPost = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = req.user;
      const { id } = req.params;
      const postId = Number(id);
      const post = await prismaService.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      canDelete({ post, user });
      await prismaService.post.delete({
        where: { id: postId },
      });
      logger.error(
        "post deleted:",

        TicketIdGenerator.generateTicketId(),
      );
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      logger.error(
        `Error deleting post: ${TicketIdGenerator.generateTicketId()}`,
        error,
      );
      next(error);
    }
  };

  public deleteGroupAdminPost = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = req.user;
      const { groupId, postId } = req.params;
      log(groupId);
      log(postId);
      const groupPost = await prismaService.groupPost.findFirst({
        where: {
          groupId: Number(groupId),
          postId: Number(postId),
        },
        include: { group: true },
      });
      log(groupPost);
      if (!groupPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      const post = await prismaService.groupPost.findUnique({
        where: { id: groupPost.id },
      });
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      // canDelete({  user, groupPost });
      await prismaService.groupPost.delete({
        where: { id: groupPost.id },
      });
      await prismaService.post.delete({
        where: { id: post.id },
      });

      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

  public getPostsByGroupId = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { groupId } = req.params;
      //   log(id);
      const id = Number(groupId);
      const group = await prismaService.group.findUnique({
        where: { id },
      });
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      const posts = await prismaService.groupPost.findMany({
        where: { id },
        include: { post: true, group: { include: { admin: true } } },
      });
      res.json({ message: "Posts fetched successfully", data: posts });
    } catch (error) {
      next(error);
    }
  };
}
const postController = new PostController();
export { postController };
export type { PostController };
