import type {
  RawRecord,
  UploadResponse,
  ImportConfirmResponse,
  ApiErrorResponse,
} from "@/types/lead";

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
 * Sends parsed raw records to the backend for AI-powered mapping and database import.
 */
export async function importConfirm(
  records: RawRecord[]
): Promise<ImportConfirmResponse> {
  const response: Response = await fetch(`${API_BASE_URL}/import-confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ records }),
  });

  if (!response.ok) {
    return handleErrorResponse(response);
  }

  return (await response.json()) as ImportConfirmResponse;
}
