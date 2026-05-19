import { redisHost, redisPort } from "@/constant";
import { initWinstonLogger } from "@/core";
import { Post } from "@prisma/client";
import Redis from "ioredis";
const logger = initWinstonLogger("redis.log");
class RedisService {
  private client: Redis;
  private isConnected: boolean = false;

  constructor() {
    this.client = new Redis({
      host: redisHost,
      port: redisPort,
      retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableOfflineQueue: true,
      connectTimeout: 10000,
      keepAlive: 30000,
      enableReadyCheck: true,
      connectionName: "todo-app",
    });
    this.setupEventListener();
  }
  private setupEventListener(): void {
    this.client.on("connect", () => {
      logger.info("Redis: Connection established");
    });
    this.client.on("ready", () => {
      logger.info("Redis: Ready to use");
      this.isConnected = true;
    });
    this.client.on("error", (error) => {
      logger.error("Redis Error: ", error.message);
      this.isConnected = false;
    });
    this.client.on("close", () => {
      logger.info("Redis: Connection closed");
      this.isConnected = false;
    });
    this.client.on("reconnecting", () => {
      logger.info("Redis: Reconnecting...");
    });
    this.client.on("end", () => {
      logger.info("Redis: Connection ended");
      this.isConnected = false;
    });
  }
  public async waitForReady(): Promise<void> {
    if (this.isConnected) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        return reject(new Error("Redis connection timed out"));
      }, 10000);
      this.client.once("ready", () => {
        clearTimeout(timeout);
        resolve();
      });

      this.client.once("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  public async Ping(): Promise<string> {
    try {
      const result = this.client.ping();
      return result;
    } catch (error) {
      logger.error("Redis Error: ", error);
      throw error;
    }
  }
  public async blacklistToken(
    tokenId: string,
    expirationTime: number,
  ): Promise<boolean> {
    try {
      await this.waitForReady();

      const key = `blacklist:${tokenId}`;
      const ttl = Math.max(0, expirationTime - Math.floor(Date.now() / 1000));

      if (ttl > 0) {
        await this.client.setex(key, ttl, "1");
        console.debug(`Token blacklisted: ${tokenId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error blacklisting token:", error);
      return false;
    }
  }
  public async isTokenBlacklist(token: string): Promise<Boolean> {
    try {
      await this.waitForReady();
      const key = `blacklist:${token}`;
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error("Error checking token blacklist:", error);
      return false;
    }
  }
  public async cacheAdmin(
    adminId: number,
    adminData: unknown,
    tllSeconds: number = 900,
  ): Promise<boolean> {
    try {
      await this.waitForReady();

      const key = `Admin:${adminId}`;
      await this.client.setex(key, tllSeconds, JSON.stringify(adminData));
      return true;
    } catch (error) {
      console.error("Error  caching staff:", error);
      return false;
    }
  }
  public async cacheUser(
    adminId: number,
    adminData: unknown,
    tllSeconds: number = 900,
  ): Promise<boolean> {
    try {
      await this.waitForReady();

      const key = `Admin:${adminId}`;
      await this.client.setex(key, tllSeconds, JSON.stringify(adminData));
      return true;
    } catch (error) {
      console.error("Error  caching staff:", error);
      return false;
    }
  }
  public async getCachedAdmin(adminId: number): Promise<unknown | null> {
    try {
      await this.waitForReady();
      const key = `Admin:${adminId}`;
      const result = await this.client.get(key);
      return result;
    } catch (error) {
      console.error("Error getting cached admin:", error);
      return null;
    }
  }
  public async getCachedUser(adminId: number): Promise<unknown | null> {
    try {
      await this.waitForReady();
      const key = `User:${adminId}`;
      const result = await this.client.get(key);
      return result;
    } catch (error) {
      console.error("Error getting cached admin:", error);
      return null;
    }
  }

  public async CachedPosts(key: string, value: any): Promise<unknown | null> {
    try {
      const result = await this.client.set(key, value);
      return result;
    } catch (error) {
      console.error("Error getting cached admin:", error);
      return null;
    }
  }
  public async getCachedPosts(key: string): Promise<unknown | null> {
    try {
      const result = await this.client.get(key);
      return result;
    } catch (error) {
      console.error("Error getting cached admin:", error);
      return null;
    }
  }
  public async set(
    key: string,
    value: string,
    ttl?: number,
  ): Promise<"OK" | null> {
    try {
      if (ttl) {
        const result = await this.client.setex(key, ttl, value);
        return result;
      } else {
        const result = await this.client.set(key, value);
        logger.info(`Set key "${key}" with value "${value}"`);
        return result;
      }
    } catch (error) {
      console.error(`Error setting key "${key}":`, error);
      logger.error(`Error setting key "${key}":`, error);
      throw error;
    }
  }
}

export const redisService = new RedisService();
export type { RedisService };
