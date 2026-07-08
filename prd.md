# Product Requirements Document (PRD): AI-Powered CSV Importer

## 1. Overview & Goal
Build a responsive, modern web application and backend API that allows users to upload CSV files of various formats (e.g., Facebook Lead Exports, Google Ads, Real Estate CRMs, custom spreadsheets) and uses AI (Groq) to map and extract the contents into a structured, unified GrowEasy CRM Lead format.

---

## 2. Target CRM Schema
The system must parse, extract, and clean data into the following fields:

| Field Name | Description | Rules / Type |
| :--- | :--- | :--- |
| `created_at` | Lead creation date | ISO String or date format parsable by `new Date()` |
| `name` | Lead full name | String |
| `email` | Primary email | String (Skip row if both email & mobile are missing) |
| `country_code` | Mobile country code | String (e.g., `+91`, `+1`) |
| `mobile_without_country_code` | Mobile number | String (excluding country code) |
| `company` | Company name | String |
| `city` | City name | String |
| `state` | State name | String |
| `country` | Country name | String |
| `lead_owner` | Lead owner email/ID | String |
| `crm_status` | Lead status | Must be: `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, or `SALE_DONE` |
| `crm_note` | Remarks and overflow data | Notes, remarks, extra emails, extra mobile numbers, etc. |
| `data_source` | Source identifier | Must be: `leads_on_demand`, `meridian_tower`, `eden_park`, `varah_swamy`, `sarjapur_plots` (or blank) |
| `possession_time` | Property possession time | String |
| `description` | Additional description | String |

---

## 3. Detailed Features & User Flow

### Tech Stack Decisions
* **AI Provider**: Groq
* **Database**: SQLite (for lead persistence)
* **AI Batch Size**: 10 - 20 records per batch

### Frontend (Next.js)
1. **Upload View**:
   - Drag & Drop zone and file picker for CSV files.
   - Clean, modern layout (vibrant aesthetics, dark mode support).
2. **Preview View**:
   - Local CSV parsing without backend or AI processing.
   - A beautiful responsive table displaying the parsed rows.
   - Support for horizontal/vertical scrolling, sticky headers, and virtualization for large files.
   - A prominent **"Confirm Import"** button to start the AI extraction process.
3. **Importing State**:
   - A progress indicator showing batch processing status and percentage completion.
4. **Parsed Results View**:
   - Display AI-extracted CRM records in a responsive table.
   - Display import summary metrics:
     - Total imported successfully
     - Total skipped (invalid records missing both email and mobile)
     - Error count (if any batches failed)
   - Download extracted records as a clean CSV or JSON.

### Backend (Node.js / Express / TypeScript)
1. **API Endpoints**:
   - `POST /api/upload`: Accepts CSV file, parses it, and returns the raw parsed rows.
   - `POST /api/import-confirm`: Receives raw records to process in batches, executes the Groq-powered mapping, inserts valid records into SQLite, and returns execution status/leads.
   - `GET /api/leads`: Retrieves imported leads from the database.
2. **AI Mapping Engine**:
   - Groups records into optimized batch sizes (10-20 leads).
   - Instructs Groq to map the unstructured headers/values of the source CSV into the exact GrowEasy schema.
   - Enforces field rules (e.g., parsing dates, moving extra emails/phones to `crm_note`, assigning correct enum values to `crm_status` and `data_source`).
3. **Data Integrity / Validation**:
   - Automatically drops rows missing both email and mobile numbers (logged as skipped).

---

## 4. Complete Feature List & Implementation Checklist

### Required Features (Mandatory)
- [ ] **File Upload Picker**: Allow users to select a valid CSV file via a traditional picker.
- [ ] **Pre-AI Preview Table**: Client-side parsing to display uploaded rows before any AI processing.
- [ ] **Interactive Preview Table**: Responsive table with sticky headers, horizontal scrolling, and vertical scrolling.
- [ ] **Confirmation Step**: A prominent "Confirm Import" button that triggers the backend call.
- [ ] **Any Valid CSV Parsing**: Backend parses any uploaded CSV file without assuming fixed column names.
- [ ] **AI-Powered Batch Processing**: Batch processing (10-20 records) using an LLM to map raw columns into the CRM schema.
- [ ] **Target CRM Schema Extraction**: Map and clean fields: `created_at` (parsable date), `name`, `email`, `country_code`, `mobile_without_country_code`, `company`, `city`, `state`, `country`, `lead_owner`, `crm_status`, `crm_note`, `data_source`, `possession_time`, `description`.
- [ ] **Lead Rules Engine**:
  - Restrict `crm_status` to: `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, or `SALE_DONE`.
  - Restrict `data_source` to specified values or blank.
  - Skip invalid records missing *both* email and mobile number.
  - Move extra emails or mobile numbers to `crm_note`.
  - Avoid introducing unescaped line breaks.
- [ ] **Result Display Table**: Show successfully parsed records, skipped records count, total imported, and total skipped metrics.

### Bonus Features
- [ ] **Drag & Drop Upload**: Modern drag-and-drop file upload zone with hover animations and states.
- [ ] **Progress Indicators**: Real-time progress bars or batch counters during AI processing.
- [ ] **Streaming / Incremental Parsing**: Stream processed batches from server to client as they complete.
- [ ] **Retry Mechanism**: Automatically retry failed AI batch calls (e.g., rate limits, transient errors).
- [ ] **Virtualized Table**: Support viewing large CSVs smoothly using virtualization.
- [ ] **Dark Mode**: Toggle between light and dark mode with rich aesthetics.
- [ ] **Download Option**: Export the final AI-extracted records as CSV or JSON.
- [ ] **Unit Tests**: Test coverage for CSV parsing, prompt mapping logic, and database operations.
- [ ] **Docker Setup**: Dockerfiles and docker-compose configurations to orchestrate frontend and backend.
- [ ] **Deployment Configurations**: Configurations for Vercel, Railway, Render, or similar.
- [ ] **Setup Instructions**: Comprehensive setup guide in `README.md`.

