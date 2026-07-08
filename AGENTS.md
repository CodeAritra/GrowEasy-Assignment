# AI Agents

# Evaluation Criteria

Always ensure all features and code satisfy the following project evaluation criteria:

## AI Prompt Engineering
- **Ability to extract fields accurately**: Prompts and AI pipeline must ensure precise field extraction.
- **Intelligent field mapping**: Map dynamic/messy input columns to standard target fields intelligently.
- **Handling messy datasets**: Clean and handle unexpected formatting, missing values, and structure anomalies.
- **Handling ambiguous columns**: Resolve ambiguity in column headers using LLM reasoning and smart fallback logic.

## Backend Quality
- **API design**: RESTful, clean, predictable API endpoints with appropriate status codes.
- **Clean architecture**: Logical separation of concerns (e.g., controllers, services, repositories/utils).
- **Error handling**: Comprehensive error catching, structured response payloads, and informative logging.
- **Batch processing**: Handle large datasets efficiently without timing out or running out of memory.
- **Maintainable code**: Readable code, modular functions, clear naming conventions, and docstrings.

## Frontend Quality
- **Modern UI**: Clean, stunning interface with professional aesthetic (colors, typography, spacing).
- **Responsive layout**: Works seamlessly on desktop, tablet, and mobile.
- **Clean UX**: Intuitive flows, clear instructions, and minimal friction.
- **CSV preview experience**: Interactive table preview for CSV data before processing.
- **Loading states**: Skeletons, spinners, or progress bars for all asynchronous operations.
- **Error handling**: Clear error messages in UI with graceful recovery.

## Code Quality
- **Readability**: Code must be readable and clean.
- **Type safety**: Strict TypeScript types where possible; avoid `any`.
- **Folder structure**: Structured and consistent directory hierarchy.
- **Reusability**: Extract reusable components, custom hooks, and utility functions.
- **Best practices**: Adhere to modern Next.js/React standard patterns.

## Overall Engineering
- **Performance**: Optimize rendering, API response times, and state updates.
- **Edge case handling**: Test and handle empty values, extremely large files, invalid files, and API failures.
- **Production readiness**: Secure, robust, and deployable codebase.

# Project Context

## 1. Project Goal
Build a responsive web application and backend API that allows users to upload CSV files of various formats (e.g., Facebook Lead Exports, Google Ads, CRMs) and use AI (Groq) to map and extract their contents into a structured, unified GrowEasy CRM Lead format.

## 2. Technical Stack
- **Frontend**: Next.js (App Router, Tailwind CSS v4, TypeScript)
- **Backend**: Node.js + Express (TypeScript)
- **Database**: SQLite (for lead persistence)
- **AI Engine**: Groq API (LLM-based column mapping & extraction in batches of 10-20 leads)

## 3. Directory Layout
- `backend/`: Node.js/Express server in TypeScript.
- `frontend/`: Next.js client-side application.
- `prd.md`: Product Requirements Document detailing target schema, flows, and criteria.
- `todo.md`: Strictly divided required vs. bonus checklist.

## 4. Unified GrowEasy CRM Lead Schema
Every imported record is parsed and saved using the following target fields:
- `created_at` (TEXT / ISO Date)
- `name` (TEXT)
- `email` (TEXT - Skip row if both email & mobile are missing)
- `country_code` (TEXT)
- `mobile_without_country_code` (TEXT)
- `company` (TEXT)
- `city` (TEXT)
- `state` (TEXT)
- `country` (TEXT)
- `lead_owner` (TEXT)
- `crm_status` (Must be: `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, or `SALE_DONE`)
- `crm_note` (Remarks, overflow fields, extra email/phones)
- `data_source` (Must be: `leads_on_demand`, `meridian_tower`, `eden_park`, `varah_swamy`, `sarjapur_plots`, or blank)
- `possession_time` (TEXT)
- `description` (TEXT)

## 5. Backend Architectural Conventions
- **Controllers**: Standardized Express controllers (`leadController.ts`) handle routing requests/responses and forward errors to `next(err)`.
- **Services**: Business operations are strictly placed in services. `LeadService.ts` handles parsing raw CSV buffers (`parseCSV`), saving records, and fetching records from the SQLite database. `AIService.ts` manages batch mapping via the Groq LLM API.
- **Error Handling**: A custom `AppError` is thrown for operational issues (with a custom status code). Centralized error formatting and request logging are handled by a global error handler middleware (`errorHandler.ts`).
- **Configuration**: Loaded at initial boot-up via `import "dotenv/config";` at the absolute top of the server entrypoint (`index.ts`) to avoid module resolution timing issues.

## 6. Frontend Architectural Conventions
- **Routing & Components**: Adhere strictly to the Next.js idiomatic pattern: page files (`page.tsx`) must be Server Components, while interactivity, React hooks, and browser-facing states are encapsulated in client components (e.g., `<CSVImporterWizard />` containing `"use client";`).

