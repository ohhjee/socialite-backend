import { PrismaClient } from "@/generated/prisma";
import { log } from "node:console";

class PrismaService extends PrismaClient {
  constructor() {
    super({
      log:
        process.env.NODE_ENV === "Production"
          ? ["query", "info", "warn", "error"]
          : undefined,
    });
  }
  public async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
    } catch (error) {
      log(error);
      throw error;
    }
  }

  public async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
    } catch (error) {
      log(error);
      throw error;
    }
  }
}

const prismaService = new PrismaService();

export { prismaService };
export type { PrismaService };
