import { TargetLead, GroqResponse, GroqAPIResponse } from "../types/interface";

export class AIService {
  private static GROQ_API_URL: string = process.env.GROQ_API_URL!;
  private static GROQ_MODEL: string = process.env.GROQ_MODEL!;

  /**
   * Sends a batch of raw records to Groq to map them to the CRM schema.
   */
  public static async mapBatch(rawRecords: Record<string, string>[]): Promise<TargetLead[]> {
    const apiKey: string | undefined = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY environment variable is not defined.");
    }

    const model: string = this.GROQ_MODEL;

    const systemPrompt: string = `
You are an expert CRM data mapping assistant.
Your task is to take a batch of raw records from a CSV file (with dynamic, messy, or arbitrary headers) and map/clean them into the target GrowEasy CRM Lead schema.

Target GrowEasy CRM Lead Schema:
1. \`created_at\`: Lead creation date. Must be a clean ISO date string (YYYY-MM-DDTHH:mm:ss.sssZ) or date format parsable by JavaScript's \`new Date()\`. If missing or invalid, default to the current time.
2. \`name\`: Lead full name.
3. \`email\`: Primary email address. If multiple emails exist, extract the first one here, and append the remaining emails to \`crm_note\`.
4. \`country_code\`: The country code (e.g., "+91", "+1"). Clean it to start with "+". If missing, default to "+91" if the country is India or the mobile length is 10 digits without code, otherwise infer from the country.
5. \`mobile_without_country_code\`: Mobile number excluding the country code. If multiple numbers exist, extract the first here, and append the remaining numbers to \`crm_note\`.
6. \`company\`: Company name.
7. \`city\`: City name.
8. \`state\`: State name.
9. \`country\`: Country name.
10. \`lead_owner\`: Email or ID of the lead owner.
11. \`crm_status\`: Lead status. MUST strictly be one of:
    - "GOOD_LEAD_FOLLOW_UP"
    - "DID_NOT_CONNECT"
    - "BAD_LEAD"
    - "SALE_DONE"
    If status is empty, ambiguous, or doesn't map cleanly, default to "GOOD_LEAD_FOLLOW_UP".
12. \`crm_note\`: Remarks, follow-up notes, additional comments, extra phone numbers, extra email addresses, or overflow column data that doesn't fit into other fields.
13. \`data_source\`: Source identifier. MUST strictly be one of:
    - "leads_on_demand"
    - "meridian_tower"
    - "eden_park"
    - "varah_swamy"
    - "sarjapur_plots"
    - "" (empty string, if none of the above match confidently)
14. \`possession_time\`: Property possession time.
15. \`description\`: Additional description.

Formatting Rules:
- Return the output strictly as a JSON object containing a "leads" array.
- Each lead in the array must conform to the target schema.
- Do not introduce unescaped line breaks. Use "\\n" for line breaks inside strings.
- Ensure all fields are included in each object. Use empty strings for missing fields.
- If a record has neither email nor mobile, output it anyway with empty fields.
`;

    const userContent: string = JSON.stringify(rawRecords);

    const response: Response = await fetch(this.GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText: string = await response.text();
      throw new Error(`Groq API error (${response.status}): ${errorText}`);
    }

    const data: GroqAPIResponse = await response.json() as GroqAPIResponse;
    const messageContent: string | undefined = data.choices?.[0]?.message?.content;
    if (!messageContent) {
      throw new Error("Groq API returned an empty or invalid completion response.");
    }

    try {
      const parsedData: GroqResponse = JSON.parse(messageContent) as GroqResponse;
      if (!parsedData.leads || !Array.isArray(parsedData.leads)) {
        throw new Error("Invalid response format: 'leads' array is missing.");
      }
      return parsedData.leads;
    } catch (parseError: unknown) {
      const parseErrorMsg: string = parseError instanceof Error ? parseError.message : String(parseError);
      console.error("Error parsing Groq JSON output:", messageContent);
      throw new Error(`Failed to parse AI response: ${parseErrorMsg}`);
    }
  }
}
