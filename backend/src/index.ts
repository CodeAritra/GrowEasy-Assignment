import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import leadRouter from "./routes/leadRoutes";
import { AppError } from "./utils/AppError";
import { errorHandler } from "./middleware/errorHandler";

const app: express.Application = express();
const port: number = Number(process.env.PORT);

// Enable CORS for frontend application
app.use(cors({
  origin: process.env.FRONTEND_URL!
}));
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response): Response => {
  return res.json({ status: "ok" });
});

// Register routes
app.use("/api", leadRouter);

// Fallback for 404 Not Found routes
app.use((req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route not found: ${req.method} ${req.path}`, 404));
});

// Global Error Handler
app.use(errorHandler);

app.listen(port, (): void => {
  console.log(`Server running on port ${port}`);
});


