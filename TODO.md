# AI-Powered CSV Importer: Project TODO List

This document lists the feature-wise implementation checklist, divided strictly into **Required Features** and **Bonus Features** as per the product requirements.

---

# SECTION 1: REQUIRED FEATURES

## 1. Database & Backend API Setup (Required)
- [x] **SQLite Database Initialization**
  - Implement a simple SQLite database helper (using `sqlite3` or `better-sqlite3`).
  - Table `leads` containing all target CRM fields with correct data types.
- [x] **Endpoint: `POST /api/upload`**
  - Accept any valid CSV file from client-side upload.
  - Parse the CSV into raw rows/records without running any AI logic.
  - Return the raw records as JSON to the frontend.
- [x] **Endpoint: `POST /api/import-confirm`**
  - Receive the raw rows payload from the frontend.
  - Batch process rows in sizes of 10 to 20.
  - Call the AI model (Groq) to intelligently map headers and extract records.
  - Save successfully extracted/mapped leads into SQLite.
  - Handle skipping logic: Skip rows missing *both* email and mobile number.
  - Return JSON results detailing successfully parsed leads, skipped leads, and overall metrics (Total imported, Total skipped).
- [x] **Endpoint: `GET /api/leads`**
  - Retrieve all successfully imported leads from SQLite for display.

## 2. AI Model Mapping & Prompt Engineering (Required)
- [x] **Schema Definition & Mapping System Prompt**
  - Create a robust system prompt mapping dynamic input columns to the target GrowEasy CRM format:
    * `created_at` (Lead creation date, parsable by `new Date()`)
    * `name` (Lead name)
    * `email` (Primary email)
    * `country_code` (Country code, e.g., `+91`)
    * `mobile_without_country_code` (Mobile number without country code)
    * `company` (Company name)
    * `city` (City)
    * `state` (State)
    * `country` (Country)
    * `lead_owner` (Lead owner ID/email)
    * `crm_status` (Must match strictly: `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, or `SALE_DONE`)
    * `crm_note` (Notes/remarks, including extra emails/phones/overflow details)
    * `data_source` (Strictly one of: `leads_on_demand`, `meridian_tower`, `eden_park`, `varah_swamy`, `sarjapur_plots`, or blank)
    * `possession_time` (Property possession time)
    * `description` (Additional description)
- [x] **Lead Rules Logic**
  - **Duplicate/Multiple Fields Rule**: First email/mobile goes to respective field; extra ones must be appended to `crm_note`.
  - **CSV Row Compatibility**: Ensure AI output does not insert unescaped line breaks that break rows.
  - **Fallback/Ambiguity Logic**: Resolve ambiguous headers (e.g. mapping "Contact" to phone or name depending on content).

## 3. Frontend Development (Required)
- [x] **Visual Theme & Typography**
  - Set up a premium UI using tailwind css and shadcn.
  - Use professional typography (e.g., Google Fonts Inter/Outfit) and spacing.
- [x] **Step 1: Upload CSV File**
  - Build a file picker interface that accepts `.csv` files.
- [x] **Step 2: Local Table Preview (Pre-AI)**
  - Parse CSV on the client side using a fast library.
  - Render raw data in a beautiful responsive preview table.
  - Support horizontal scrolling, vertical scrolling, and sticky headers.
- [x] **Step 3: Confirm Import Step**
  - Display a prominent **"Confirm Import"** button.
  - Ensure no AI API calls occur prior to confirmation.
- [x] **Step 4: Display Parsed Result**
  - Show the final AI-extracted records returned by the backend in a separate responsive table.
  - Display dynamic metrics: Total Imported, Total Skipped, list of skipped records.

---

# SECTION 2: BONUS FEATURES

## 1. Frontend Enhancements (Bonus)
- [x] **Drag & Drop Upload**: A modern drag-and-drop file upload zone with hover animations.
- [x] **Progress Indicators**: Real-time progress bars or batch indicators (e.g. "Processing Batch 2/10...") during the AI import phase.
- [x] **Virtualized Table**: Support rendering large CSV previews (e.g., using `react-window`) without browser lag.
- [x] **Dark Mode**: Add a light/dark mode theme toggle with persistent configuration.
- [x] **Download Option**: Export the final AI-extracted leads from the UI as a clean CSV 

## 2. Backend & AI Enhancements (Bonus)
- [x] **Streaming / Incremental Parsing**: Stream batches from server to client as they complete.
- [ ] **AI Retry Mechanism**: Implement exponential backoff or simple retries for failed AI batch API requests.
- [ ] **Unit Tests**:
  - Write test suites for CSV parsing.
  - Test suites for prompt extraction validation and mapping.
  - Test suites for SQLite insertions and validations.

## 3. Infrastructure & Deployment (Bonus)
- [ ] **Docker Setup**: Add `Dockerfile` and `docker-compose.yml` to run the app seamlessly in containerized environments.
- [ ] **Cloud Deployment**: Set up scripts or configurations to deploy the frontend (Vercel) and backend (Railway/Render).
- [ ] **Comprehensive README**: Detail step-by-step instructions on how to install, configure, test, and run the app.
