import "dotenv/config";
import { Server } from "http";
import { App } from "./app";
import { _APP_URL_, _PORT_ } from "./constant";
import { initWinstonLogger } from "./core";
import { AddressInfo } from "net";

const logger = initWinstonLogger("error.log");
const app = new App();
let server: Server;
async function main() {
  function serverError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== "listen") throw error;

    error.code === "EACCES"
      ? logger.error(`Port ${_PORT_} requires elevated privileges`)
      : error.code === "EADDRINUSE"
      ? logger.error(`Port ${_PORT_} is already in use`)
      : logger.error(error.message);
    process.exit(1);
  }
  function serverListening(): void {
    const address = server.address();
    if (address && typeof address === "object") {
      const addressInfo: AddressInfo = address;
      console.info(`${addressInfo.family} server running on ${_APP_URL_}`);
    }
  }
  try {
    await app.init();
    app.express.set("port", _PORT_);

    server = app.httpServer;
    server.on("error", serverError);
    server.on("listening", serverListening);
    server.listen(_PORT_);
  } catch (err: unknown) {
    logger.info("SERVER.INIT ERROR");

    if (err instanceof Error) {
      logger.error(err.name);
      console.error("ERROR: ", err);
    } else {
      console.error("ERROR: ", err);
    }

    process.exit(1);
  }
}

async function shutdown(signal: string) {
  logger.info(`${signal} received: closing HTTP server`);
  try {
    await app.shutdown();
    server.close();
    logger.info("HTTP server closed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown:", error);
    process.exit;
  }
}

process.on("unhandledRejection", (reason: Error) => {
  logger.error("Unhandled Rejection at:", reason.message);
  logger.error(reason.stack);
});

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

main().catch((err: unknown) => {
  logger.error("Failed to start application:", err);
  process.exit(1);
});
