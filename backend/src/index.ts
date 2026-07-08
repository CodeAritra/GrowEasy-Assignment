import express, { Request, Response } from "express";

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
