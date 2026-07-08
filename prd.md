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

### Mandatory Features
- [ ] **File Upload**: Support for selecting files via file picker.
- [ ] **Drag & Drop**: Modern drag-and-drop zone with visual hover states.
- [ ] **Unprocessed Preview**: Client-side preview parsed before sending to API.
- [ ] **Interactive Table**: Responsive table with sticky headers, horizontal and vertical scrolling.
- [ ] **Confirmation step**: User must click "Confirm Import" before AI processing starts.
- [ ] **AI-Powered Batch Processing**: Extract CRM fields using LLM (Groq) in batches.
- [ ] **Lead Rules Engine**:
  - Restrict status values to `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, `SALE_DONE`.
  - Restrict data source to specified values or blank.
  - Move overflow email/mobile to notes.
  - Parse created dates correctly.
  - Drop invalid leads lacking both email and mobile.
- [ ] **Results Display**: Beautiful table of successfully parsed leads and list/count of skipped/invalid records.

### Bonus Features (To be completed after priority requirements)
- [ ] **Incremental Processing / Progress Bar**: Show real-time progress percentages as batches complete.
- [ ] **Retry Mechanism**: Automatically retry failed AI batch calls.
- [ ] **Virtualized Table**: Efficient table rendering (e.g., React Window or CSS virtualization) for handling large files without lagging.
- [ ] **Dark Mode**: Complete light and dark mode toggles with a gorgeous visual aesthetic.
- [ ] **Download Option**: Export the final parsed leads directly as CSV or JSON from the browser.
- [ ] **Docker Setup**: Containers to run backend and frontend seamlessly.
- [ ] **Unit Tests**: Test coverage for CSV parsing, mapping prompts, and database persistence.
- [ ] **Setup Instructions**: Complete and detailed `README.md`.
