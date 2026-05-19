import { Admin, Group, GroupPost, Post, User } from "@prisma/client";
import createHttpError from "http-errors";

type DeletePermissionCheck = {
  post: Post;
  user?: User;
  groupPost?: GroupPost & { group: Group };
  admin?: Admin;
};

export const canDelete = ({
  post,
  user,
  groupPost,
  admin,
}: DeletePermissionCheck): boolean => {
  if (admin) {
    return true;
  }

  if (!user) {
    throw new createHttpError.Forbidden(
      "You do not have permission to delete this post.",
    );
  }

  const isAuthor = post.userId === user.id;
  const isGroupAdmin = groupPost ? groupPost.group.adminId === user.id : false;

  if (!isAuthor && !isGroupAdmin) {
    throw new createHttpError.Forbidden(
      "You do not have permission to delete this post.",
    );
  }

  return true;
};
