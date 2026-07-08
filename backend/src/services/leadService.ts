import { runQuery, allQuery, SqlParam } from "../db/db";
import { TargetLead } from "./aiService";
import { parse } from "csv-parse";
import { AppError } from "../utils/AppError";

export class LeadService {
  /**
   * Parses a CSV file buffer and returns raw parsed rows.
   */
  public static parseCSV(buffer: Buffer): Promise<Record<string, string>[]> {
    return new Promise((resolve, reject) => {
      const csvContent: string = buffer.toString("utf-8");
      parse(
        csvContent,
        {
          columns: true,
          skip_empty_lines: true,
          trim: true
        },
        (err: Error | undefined, records: Record<string, string>[] | undefined) => {
          if (err) {
            return reject(new AppError("Failed to parse CSV file: " + err.message, 400));
          }
          if (!records || records.length === 0) {
            return reject(new AppError("The uploaded CSV file is empty.", 400));
          }
          resolve(records);
        }
      );
    });
  }
  /**
   * Saves a single mapped CRM lead to the database.
   */
  public static async saveLead(lead: TargetLead): Promise<void> {
    // Validation check: skip if both email and mobile are missing
    const hasEmail: boolean = typeof lead.email === "string" && lead.email.trim().length > 0;
    const hasMobile: boolean = typeof lead.mobile_without_country_code === "string" && lead.mobile_without_country_code.trim().length > 0;

    if (!hasEmail && !hasMobile) {
      console.log(`Skipping lead: missing both email and mobile. Name: ${lead.name}`);
      return;
    }

    // Sanitize enums to match database schema CHECK constraints
    const allowedStatuses: string[] = ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"];
    let sanitizedStatus: "GOOD_LEAD_FOLLOW_UP" | "DID_NOT_CONNECT" | "BAD_LEAD" | "SALE_DONE" = "GOOD_LEAD_FOLLOW_UP";
    if (allowedStatuses.includes(lead.crm_status)) {
      sanitizedStatus = lead.crm_status;
    }

    const allowedDataSources: string[] = ["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots"];
    let sanitizedDataSource: "leads_on_demand" | "meridian_tower" | "eden_park" | "varah_swamy" | "sarjapur_plots" | "" = "";
    if (lead.data_source && allowedDataSources.includes(lead.data_source)) {
      sanitizedDataSource = lead.data_source;
    }

    // Format created_at to parsable format
    let formattedDate: string = lead.created_at;
    try {
      const parsedDate: Date = new Date(lead.created_at);
      if (isNaN(parsedDate.getTime())) {
        formattedDate = new Date().toISOString();
      } else {
        formattedDate = parsedDate.toISOString();
      }
    } catch {
      formattedDate = new Date().toISOString();
    }

    const sql: string = `
      INSERT INTO leads (
        created_at, name, email, country_code, mobile_without_country_code,
        company, city, state, country, lead_owner, crm_status, crm_note,
        data_source, possession_time, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params: SqlParam[] = [
      formattedDate,
      lead.name || "",
      lead.email || "",
      lead.country_code || "",
      lead.mobile_without_country_code || "",
      lead.company || "",
      lead.city || "",
      lead.state || "",
      lead.country || "",
      lead.lead_owner || "",
      sanitizedStatus,
      lead.crm_note || "",
      sanitizedDataSource,
      lead.possession_time || "",
      lead.description || ""
    ];

    await runQuery(sql, params);
  }

  /**
   * Retrieves all imported leads from SQLite.
   */
  public static async getAllLeads(): Promise<TargetLead[]> {
    const sql: string = `
      SELECT 
        created_at, name, email, country_code, mobile_without_country_code,
        company, city, state, country, lead_owner, crm_status, crm_note,
        data_source, possession_time, description
      FROM leads
      ORDER BY id DESC
    `;
    return allQuery<TargetLead>(sql);
  }
}
