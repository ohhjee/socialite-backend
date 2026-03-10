export enum Permission {
  READ_TODO = "read:todo",
  CREATE_TODO = "create:todo",
  UPDATE_TODO = "update:todo",
  DELETE_TODO = "delete:todo",
  CREATE_USER = "create:user",
  UPDATE_USER = "update:user",
  DELETE_USER = "delete:user",
  MANAGE_ROLES = "manage:roles",
  MANAGE_PERMISSIONS = "manage:permissions",
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  READER: [Permission.READ_TODO],
  AUTHOR: [Permission.READ_TODO, Permission.CREATE_TODO],
  EDITOR: [
    Permission.READ_TODO,
    Permission.CREATE_TODO,
    Permission.UPDATE_TODO,
  ],
  MODERATOR: [
    Permission.READ_TODO,
    Permission.CREATE_TODO,
    Permission.UPDATE_TODO,
    Permission.DELETE_TODO,
  ],
  ADMIN: [
    Permission.READ_TODO,
    Permission.CREATE_TODO,
    Permission.UPDATE_TODO,
    Permission.DELETE_TODO,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.MANAGE_ROLES,
  ],
  SUPERADMIN: [
    Permission.READ_TODO,
    Permission.CREATE_TODO,
    Permission.UPDATE_TODO,
    Permission.DELETE_TODO,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.MANAGE_ROLES,
    Permission.MANAGE_PERMISSIONS,
  ],
};
