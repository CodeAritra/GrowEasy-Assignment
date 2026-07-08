/** Raw CSV record as parsed by PapaParse or the backend. */
export type RawRecord = Record<string, string>;

/** A single CRM lead mapped to the GrowEasy target schema. */
export interface TargetLead {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status:
    | "GOOD_LEAD_FOLLOW_UP"
    | "DID_NOT_CONNECT"
    | "BAD_LEAD"
    | "SALE_DONE";
  crm_note: string;
  data_source:
    | "leads_on_demand"
    | "meridian_tower"
    | "eden_park"
    | "varah_swamy"
    | "sarjapur_plots"
    | "";
  possession_time: string;
  description: string;
}

/** Response from POST /api/upload */
export interface UploadResponse {
  message: string;
  rowCount: number;
  headers: string[];
  records: RawRecord[];
}

/** Response from POST /api/import-confirm */
export interface ImportConfirmResponse {
  message: string;
  totalProcessed: number;
  importedCount: number;
  skippedCount: number;
  failedCount: number;
  importedLeads: TargetLead[];
  skippedLeads: TargetLead[];
}

/** Structured API error */
export interface ApiErrorResponse {
  error: {
    message: string;
    statusCode: number;
    details?: string;
  };
}
