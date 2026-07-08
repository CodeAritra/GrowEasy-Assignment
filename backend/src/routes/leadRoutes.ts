import express from "express";
import multer from "multer";
import { LeadController } from "../controllers/leadController";

const router: express.Router = express.Router();

const storage: multer.StorageEngine = multer.memoryStorage();
const upload: multer.Multer = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Route for CSV upload & pre-AI parsing
router.post("/upload", upload.single("file"), LeadController.uploadCSV);

// Route for AI batch extraction and database save
router.post("/import-confirm", LeadController.importConfirm);

// Route for retrieving all imported leads
router.get("/leads", LeadController.getLeads);

export default router;
