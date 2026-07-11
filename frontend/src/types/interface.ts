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
  failedLeads: TargetLead[];
}

/** Structured API error */
export interface ApiErrorResponse {
  error: {
    message: string;
    statusCode: number;
    details?: string;
  };
}

/** Response from GET /api/leads */
export interface LeadsResponse {
  leads: TargetLead[];
}

/** Progress updates sent by the server during streaming */
export interface StreamProgressMessage {
  type: "progress";
  batchIndex: number;
  totalBatches: number;
  importedCount: number;
  skippedCount: number;
  failedCount: number;
}

/** Final summary sent by the server when streaming completes */
export interface StreamSummaryMessage {
  type: "summary";
  totalProcessed: number;
  importedCount: number;
  skippedCount: number;
  failedCount: number;
  importedLeads: TargetLead[];
  skippedLeads: TargetLead[];
  failedLeads: TargetLead[];
}

/** Retry updates sent by the server during transient failures */
export interface StreamRetryMessage {
  type: "retry";
  batchIndex: number;
  totalBatches: number;
  attempt: number;
  maxAttempts: number;
  errorMsg: string;
  delayMs: number;
}

/** Union of all possible stream messages */
export type StreamMessage = StreamProgressMessage | StreamSummaryMessage | StreamRetryMessage;

/** Status of a single batch during import */
export type BatchStatus = "pending" | "processing" | "completed" | "failed" | "retrying";

/** Per-batch tracking info */
export interface BatchInfo {
  status: BatchStatus;
  retryReason?: string;
  retryAttempt?: number;
  retryMaxAttempts?: number;
}

/** Frontend progress state tracking */
export interface ImportProgress {
  currentBatch: number;
  totalBatches: number;
  totalRows: number;
  percentage: number;
  importedCount: number;
  skippedCount: number;
  failedCount: number;
  retryAttempt?: number;
  retryMaxAttempts?: number;
  retryMessage?: string;
  retryReason?: string;
  batchStatuses: BatchInfo[];
}
