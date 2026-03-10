import { hashPassword } from "./../src/core/libs/hash";
// import { SUPERADMIN } from "@/generated/prisma/enums";
// prisma/seed.ts

import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create predefined roles
  // const roles = [
  //   {
  //     name: "READER",
  //     description: "Can only read todos",
  //     permissions: JSON.stringify(["read:todo"]),
  //   },
  //   {
  //     name: "AUTHOR",
  //     description: "Can create and read todos",
  //     permissions: JSON.stringify(["read:todo", "create:todo"]),
  //   },
  //   {
  //     name: "EDITOR",
  //     description: "Can create, read, and update todos",
  //     permissions: JSON.stringify(["read:todo", "create:todo", "update:todo"]),
  //   },
  //   {
  //     name: "MODERATOR",
  //     description: "Full todo permissions",
  //     permissions: JSON.stringify([
  //       "read:todo",
  //       "create:todo",
  //       "update:todo",
  //       "delete:todo",
  //     ]),
  //   },
  //   {
  //     name: "ADMIN",
  //     description: "Full system permissions",
  //     permissions: JSON.stringify([
  //       "read:todo",
  //       "create:todo",
  //       "update:todo",
  //       "delete:todo",
  //       "create:user",
  //       "update:user",
  //       "delete:user",
  //       "manage:roles",
  //     ]),
  //   },
  //   {
  //     name: "SUPERADMIN",
  //     description: "Complete system access",
  //     permissions: JSON.stringify([
  //       "read:todo",
  //       "create:todo",
  //       "update:todo",
  //       "delete:todo",
  //       "create:user",
  //       "update:user",
  //       "delete:user",
  //       "manage:roles",
  //       "manage:permissions",
  //     ]),
  //   },
  // ];
  // Create an admin user
  const hash = await hashPassword("admin123");

  const adminUser = {
    firstName: "Admin",
    lastName: "Admin",
    email: "admin@admin.com",
    password: hash,
    // role: SUPERADMIN,
  };

  await prisma.admin.upsert({
    where: { email: adminUser.email },
    update: {},
    create: {
      ...adminUser,

      // permissions: roles.find((role) => role.name === "SUPERADMIN")!.name,
    },
  });
  console.log(`✓ Created admin user: ${adminUser.email}`);

  // for (const role of roles) {
  //   await prisma.role.upsert({
  //     where: { name: role.name },
  //     update: {},
  //     create: role,
  //   });
  //   console.log(`✓ Created role: ${role.name}`);
  // }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
