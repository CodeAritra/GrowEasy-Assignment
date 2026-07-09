import { Request, Response, NextFunction } from "express";
import { AIService } from "../services/aiService";
import { TargetLead } from "../types/interface";
import { LeadService } from "../services/leadService";
import { AppError } from "../utils/AppError";

export class LeadController {
  /**
   * Handles CSV file upload and returns raw parsed rows.
   */
  public static async uploadCSV(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        return next(new AppError("No file uploaded. Please upload a valid CSV file.", 400));
      }

      const records: Record<string, string>[] = await LeadService.parseCSV(req.file.buffer);

      res.json({
        message: "CSV file parsed successfully.",
        rowCount: records.length,
        headers: Object.keys(records[0]),
        records
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Confirms raw rows, calls Groq AI to map columns, and inserts into database in batches, streaming progress.
   */
  public static async importConfirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRecords: Record<string, string>[] = req.body.records;

      if (!rawRecords || !Array.isArray(rawRecords) || rawRecords.length === 0) {
        return next(new AppError("No records provided to import.", 400));
      }

      // Set headers for SSE streaming
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const batchSize: number = 15;
      const importedLeads: TargetLead[] = [];
      const skippedLeads: TargetLead[] = [];
      let successCount: number = 0;
      let skippedCount: number = 0;
      let failedCount: number = 0;

      // Process records in batches
      for (let i: number = 0; i < rawRecords.length; i += batchSize) {
        const batch: Record<string, string>[] = rawRecords.slice(i, i + batchSize);
        
        try {
          // Run AI mapping
          const mappedBatch: TargetLead[] = await AIService.mapBatch(batch);
          
          for (const lead of mappedBatch) {
            const hasEmail: boolean = typeof lead.email === "string" && lead.email.trim().length > 0;
            const hasMobile: boolean = typeof lead.mobile_without_country_code === "string" && lead.mobile_without_country_code.trim().length > 0;
            
            if (hasEmail || hasMobile) {
              await LeadService.saveLead(lead);
              importedLeads.push(lead);
              successCount++;
            } else {
              skippedLeads.push(lead);
              skippedCount++;
            }
          }
        } catch (err: unknown) {
          const errMsg: string = err instanceof Error ? err.message : String(err);
          console.error(`Error mapping batch starting at index ${i}:`, errMsg);
          failedCount += batch.length;
        }

        // Write progress update after each batch (regardless of success/failure) in SSE format
        const progressUpdate = {
          type: "progress",
          batchIndex: Math.floor(i / batchSize) + 1,
          totalBatches: Math.ceil(rawRecords.length / batchSize),
          importedCount: successCount,
          skippedCount,
          failedCount
        };
        res.write(`data: ${JSON.stringify(progressUpdate)}\n\n`);
      }

      // Write final summary in SSE format
      const finalSummary = {
        type: "summary",
        totalProcessed: rawRecords.length,
        importedCount: successCount,
        skippedCount,
        failedCount,
        importedLeads,
        skippedLeads
      };
      res.write(`data: ${JSON.stringify(finalSummary)}\n\n`);
      res.end();
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves all imported leads from the database.
   */
  public static async getLeads(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const leads: TargetLead[] = await LeadService.getAllLeads();
      res.json({
        leads
      });
    } catch (err: unknown) {
      next(err);
    }
  }
}

