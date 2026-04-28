import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
// import { apiV1Routes } from "./api/v1";
import { apiV1Routes } from "./api/v1";
export function registeredRoutes(): express.Router {
  const route = express.Router();
  route.get("/", (_: Request, res: Response) => {
    res.json({ message: "Welcome to the API", status: "OK" });
  });

  route.use("/api/v1", express.static("public/uploads"), apiV1Routes());
  //   route.use("/health", async (_: Request, res: Response) => {
  //     try {
  //       const dbHealth = await prismaService.healthCheck();
  //       res.status(StatusCode.OK).json({
  //         status: "Success",
  //         message: "Api is healthy",
  //         database: dbHealth,
  //         timestamp: new Date().toISOString(),
  //       });
  //     } catch (error) {
  //       res.status(StatusCode.SERVICE_UNAVAILABLE).json({
  //         status: "Error",
  //         message: "Api is unhealthy",
  //         error: error instanceof Error ? error.message : "unknown error",
  //       });
  //     }
  //   });
  route.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404);
    const error = new Error(`🔍 - Not Found - ${req.originalUrl}`) as Error & {
      status?: number;
    };
    error.status = 404;
    next(error);
  });
  return route;
}
