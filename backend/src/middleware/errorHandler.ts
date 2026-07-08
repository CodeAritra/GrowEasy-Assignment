import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let statusCode: number = 500;
  let message: string = "Internal Server Error";
  let details: string | undefined = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Log the error details on the server
  console.error(`[API Error] [${req.method} ${req.path}]:`, err);

  // Include stack trace if in development mode
  if (process.env.NODE_ENV === "development") {
    details = err.stack;
  }

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      ...(details ? { details } : {})
    }
  });
};
