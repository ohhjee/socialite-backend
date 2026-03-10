import { type NextFunction, type Request, type Response } from "express";
import { initWinstonLogger } from "../libs";
import { StatusCodes } from "http-status-codes";
import * as util from "util";
import { _DEBUG_, _IS_PROD_ } from "@/constant";

export type iError = {
  message: string;
  status?: number;
  fields?: {
    name?: {
      message?: string;
    };
  };
  name?: string;
  stack?: unknown;
  sql?: unknown;
};

const logger = initWinstonLogger("error.log");

export function errorHandler(
  err: iError,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (err) {
    const status: number =
      Number(err.status) || StatusCodes.INTERNAL_SERVER_ERROR;

    const errorMessage =
      err.message || "Something went wrong while processing your request";
    const message =
      status === 500
        ? "An error occurred while processing your request. Please try again."
        : errorMessage;

    logger.error(`REQUEST HANDLING ERROR:
    \nERROR:\n${JSON.stringify(err)},
    \nREQUEST HEADERS:\n${util.inspect(req.headers)}
    \nREQUEST PARAMS:\n${util.inspect(req.params)}
    \nREQUEST QUERY:\n${util.inspect(req.query)}
    \nBODY:\n${util.inspect(req.body)}`);

    if (status === 500) {
      console.error("INTERNAL SERVER ERROR: ", {
        name: err.name,
        message: err.message,
        sql: err.sql,
        error: err,
      });
    }

    const body = { message, stack: _IS_PROD_ && _DEBUG_ ? err : undefined };
    res.status(status).json({ success: false, ...body });
  } else {
    next();
  }
}
