import { TargetLead } from "../types/interface";

export class MockAIService {
  /**
   * TEST SWITCH: Change this string to test different backend retry cases.
   * 
   * Options:
   *  - "none"    : No mock. (Uses real AIService)
   *  - "429"     : Mock a 429 Rate Limit error on all attempts to test failure.
   *  - "502"     : Mock a 502 Bad Gateway server error on all attempts to test failure.
   *  - "json"    : Mock a malformed JSON completion payload on all attempts to test failure.
   *  - "network" : Mock a physical network / fetch timeout error on all attempts to test failure.
   */
  public static MOCK_ERROR_TYPE: "none" | "429" | "502" | "json" | "network" = "none";

  /**
   * Dispatches to the appropriate mock function based on MOCK_ERROR_TYPE.
   */
  public static async mapBatch(
    rawRecords: Record<string, string>[],
    onRetry?: (attempt: number, maxAttempts: number, errorMsg: string, delayMs: number) => void
  ): Promise<TargetLead[]> {
    switch (this.MOCK_ERROR_TYPE) {
      case "429":
        return this.mapBatchMock429(rawRecords, onRetry);
      case "502":
        return this.mapBatchMock502(rawRecords, onRetry);
      case "json":
        return this.mapBatchMockJSON(rawRecords, onRetry);
      case "network":
        return this.mapBatchMockNetwork(rawRecords, onRetry);
      default:
        throw new Error("No mock type configured.");
    }
  }

  /**
   * 1. Mock HTTP 429 Too Many Requests (Rate Limit) on all attempts.
   */
  public static async mapBatchMock429(
    _rawRecords: Record<string, string>[],
    onRetry?: (attempt: number, maxAttempts: number, errorMsg: string, delayMs: number) => void
  ): Promise<TargetLead[]> {
    const maxAttempts = 4;
    let baseDelay = 1500;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const errorMsg = 'Groq API error (429): {"error":{"message":"Rate limit reached for model `llama-3.3-70b-versatile` on tokens per minute (TPM). Please try again in 16.605s.","type":"tokens","code":"rate_limit_exceeded"}}';
      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 300;
        console.warn(`[Mock AI Service 429] Attempt ${attempt}/${maxAttempts} failed: ${errorMsg}. Retrying in ${Math.round(delay)}ms...`);
        if (onRetry) {
          onRetry(attempt, maxAttempts, errorMsg, delay);
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw new Error(errorMsg);
    }

    throw new Error("Failed to map batch after all retry attempts.");
  }

  /**
   * 2. Mock HTTP 502 Bad Gateway on all attempts.
   */
  public static async mapBatchMock502(
    _rawRecords: Record<string, string>[],
    onRetry?: (attempt: number, maxAttempts: number, errorMsg: string, delayMs: number) => void
  ): Promise<TargetLead[]> {
    const maxAttempts = 4;
    let baseDelay = 1500;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const errorMsg = "Groq API error (502): Bad Gateway Error from proxy upstream";
      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 300;
        console.warn(`[Mock AI Service 502] Attempt ${attempt}/${maxAttempts} failed: ${errorMsg}. Retrying in ${Math.round(delay)}ms...`);
        if (onRetry) {
          onRetry(attempt, maxAttempts, errorMsg, delay);
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw new Error(errorMsg);
    }

    throw new Error("Failed to map batch after all retry attempts.");
  }

  /**
   * 3. Mock Physical Network connection failure on all attempts.
   */
  public static async mapBatchMockNetwork(
    _rawRecords: Record<string, string>[],
    onRetry?: (attempt: number, maxAttempts: number, errorMsg: string, delayMs: number) => void
  ): Promise<TargetLead[]> {
    const maxAttempts = 4;
    let baseDelay = 1500;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const errorMsg = "Fetch failed due to network connection error";
      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 300;
        console.warn(`[Mock AI Service Network] Attempt ${attempt}/${maxAttempts} failed: ${errorMsg}. Retrying in ${Math.round(delay)}ms...`);
        if (onRetry) {
          onRetry(attempt, maxAttempts, `Network error: ${errorMsg}`, delay);
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw new TypeError(errorMsg);
    }

    throw new Error("Failed to map batch after all retry attempts.");
  }

  /**
   * 4. Mock JSON parse failure on all attempts.
   */
  public static async mapBatchMockJSON(
    _rawRecords: Record<string, string>[],
    onRetry?: (attempt: number, maxAttempts: number, errorMsg: string, delayMs: number) => void
  ): Promise<TargetLead[]> {
    const maxAttempts = 4;
    let baseDelay = 1500;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const errorMsg = "Unexpected token i in JSON at position 2";
      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 300;
        console.warn(`[Mock AI Service JSON] JSON parse failed (Attempt ${attempt}/${maxAttempts}): ${errorMsg}. Retrying in ${Math.round(delay)}ms...`);
        if (onRetry) {
          onRetry(attempt, maxAttempts, `JSON parse error: ${errorMsg}`, delay);
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw new SyntaxError(errorMsg);
    }

    throw new Error("Failed to map batch after all retry attempts.");
  }
}
