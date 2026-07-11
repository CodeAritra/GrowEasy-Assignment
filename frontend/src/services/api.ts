import type {
  RawRecord,
  TargetLead,
  UploadResponse,
  ImportConfirmResponse,
  LeadsResponse,
  ApiErrorResponse,
  StreamMessage,
} from "@/types/interface";
import { fetchEventSource } from "@microsoft/fetch-event-source";

const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL!;

/**
 * Custom error class for API errors with status code and structured message.
 */
export class ApiError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

/**
 * Parses an API error response and throws a typed ApiError.
 */
async function handleErrorResponse(response: Response): Promise<never> {
  let message: string = `API Error: ${response.status} ${response.statusText}`;

  try {
    const errorData: ApiErrorResponse = (await response.json()) as ApiErrorResponse;
    if (errorData.error?.message) {
      message = errorData.error.message;
    }
  } catch {
    // If parsing fails, use the default message
  }

  throw new ApiError(message, response.status);
}

/**
 * Uploads a CSV file to the backend for raw parsing.
 * Does NOT trigger any AI processing.
 */
export async function uploadCSV(file: File): Promise<UploadResponse> {
  const formData: FormData = new FormData();
  formData.append("file", file);

  const response: Response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    return handleErrorResponse(response);
  }

  return (await response.json()) as UploadResponse;
}

/**
 * Fetches all existing leads from the backend database.
 */
export async function fetchLeads(): Promise<TargetLead[]> {
  const response: Response = await fetch(`${API_BASE_URL}/leads`);

  if (!response.ok) {
    return handleErrorResponse(response);
  }

  const data = (await response.json()) as LeadsResponse;
  return data.leads;
}

/**
 * Sends parsed raw records to the backend for AI-powered mapping and database import,
 * reading progress updates from the standard Server-Sent Events (SSE) stream.
 */
export async function importConfirm(
  records: RawRecord[],
  onProgress?: (message: StreamMessage) => void,
  signal?: AbortSignal
): Promise<ImportConfirmResponse> {
  let resolvePromise!: (value: ImportConfirmResponse) => void;
  let rejectPromise!: (reason: unknown) => void;
  const resultPromise = new Promise<ImportConfirmResponse>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  const ctrl = new AbortController();

  if (signal) {
    if (signal.aborted) {
      rejectPromise(new Error("Import aborted."));
      return resultPromise;
    }
    signal.addEventListener("abort", () => {
      ctrl.abort();
      rejectPromise(new Error("Import aborted."));
    });
  }

  fetchEventSource(`${API_BASE_URL}/import-confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ records }),
    signal: ctrl.signal,
    openWhenHidden: true,
    async onopen(response: Response): Promise<void> {
      if (response.ok && response.headers.get("content-type")?.includes("text/event-stream")) {
        return;
      } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        let errText = "";
        try {
          errText = await response.text();
        } catch {
          // ignore
        }
        throw new Error(errText || `API Error: ${response.status}`);
      } else {
        throw new Error(`Connection failed: ${response.status}`);
      }
    },
    onmessage(msg: { data: string; event: string; id: string; retry?: number }): void {
      if (!msg.data) return;
      try {
        const parsed = JSON.parse(msg.data) as StreamMessage;
        if (parsed.type === "progress" || parsed.type === "retry") {
          if (onProgress) onProgress(parsed);
        } else if (parsed.type === "summary") {
          const finalSummary: ImportConfirmResponse = {
            message: "Lead import processing completed.",
            totalProcessed: parsed.totalProcessed,
            importedCount: parsed.importedCount,
            skippedCount: parsed.skippedCount,
            failedCount: parsed.failedCount,
            importedLeads: parsed.importedLeads,
            skippedLeads: parsed.skippedLeads,
            failedLeads: parsed.failedLeads,
          };
          resolvePromise(finalSummary);
          ctrl.abort(); // close the connection
        }
      } catch (err) {
        console.error("Failed to parse event message:", err, msg.data);
      }
    },
    onerror(err: unknown): void {
      rejectPromise(err);
      ctrl.abort();
      throw err; // Stop automatic reconnection retries
    }
  }).catch((err: unknown): void => {
    rejectPromise(err);
  });

  return resultPromise;
}
