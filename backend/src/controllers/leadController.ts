import { Request, Response, NextFunction } from "express";
import { AIService, TargetLead } from "../services/aiService";
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
   * Confirms raw rows, calls Groq AI to map columns, and inserts into database in batches.
   */
  public static async importConfirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRecords: Record<string, string>[] = req.body.records;

      if (!rawRecords || !Array.isArray(rawRecords) || rawRecords.length === 0) {
        return next(new AppError("No records provided to import.", 400));
      }

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
      }

      res.json({
        message: "Lead import processing completed.",
        totalProcessed: rawRecords.length,
        importedCount: successCount,
        skippedCount,
        failedCount,
        importedLeads,
        skippedLeads
      });
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

