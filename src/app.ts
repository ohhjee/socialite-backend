import { prismaService } from "@/services/prisma.service";
import { log } from "console";
import cors from "cors";
import express, {
  type Application,
  type Response,
  type Request,
  type NextFunction,
} from "express";
import http, { Server } from "http";
import { registeredRoutes } from "./routes/router";
import { redisService } from "./services/redis.service";
import {
  errorHandler,
  type iError,
} from "./core/filter/globalErrorHandler.filter";
import path from "path";
import { initSocket } from "./socket";
// import { limiter } from "./util/rate-limit";
import { worker as mailWorker } from "./queues/workers/mail.worker";
const port = process.env.PORT || 3000;

export class App {
  public express!: Application;
  public httpServer!: Server;
  public async init(): Promise<void> {
    this.express = express();
    this.httpServer = http.createServer(this.express);

    await prismaService.onModuleInit();
    await redisService.waitForReady();

    console.log("✅ Mail worker started and listening for jobs");
    console.log("Worker status:", mailWorker.isRunning());

    initSocket(this.httpServer);
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }
  public async setupRoutes(): Promise<void> {
    this.express.use(registeredRoutes());
  }

  public async setupMiddlewares(): Promise<void> {
    this.express.use(express.json());
    this.express.use(cors());
    this.express.use(express.urlencoded({ extended: true }));
    // this.express.use(limiter);
    this.express.use(
      "/uploads",
      express.static(path.join(process.cwd(), "public/uploads")),
    );
  }
  private setupErrorHandling(): void {
    this.express.use(
      (err: iError, req: Request, res: Response, next: NextFunction) => {
        errorHandler(err, req, res, next);
      },
    );
  }
  public async shutdown(): Promise<void> {
    try {
      this.httpServer.close();
      await prismaService.$disconnect();
      log("Successfully shutdown application.");
    } catch (error) {
      log("Error during shutdown:", error);
    }
  }
}

// const app = new App();
// export { app };
// export type { App };
