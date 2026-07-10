import dotenv from "dotenv";
import path from "path";

// Load environment variables dynamically based on NODE_ENV
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
