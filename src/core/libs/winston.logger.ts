import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import winston, { type Logger } from "winston";

const logDir = join(process.cwd(), "logs");
if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

export const initWinstonLogger = (
  filename: string = "server.log",
  level = "info"
): Logger => {
  return winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.errors({ stack: true }),
      winston.format.prettyPrint()
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: `${logDir}/${filename}` }),
    ],
  });
};
