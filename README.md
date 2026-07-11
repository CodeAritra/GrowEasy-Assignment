# GrowEasy CRM — AI-Powered CSV Lead Importer
### Developed by **Aritra Dhank**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-FF5733?style=for-the-badge&logo=vercel&logoColor=white)](https://grow-easy-assignment-three.vercel.app)
[![Setup Guide](https://img.shields.io/badge/Setup%20Guide-007ACC?style=for-the-badge&logo=docker&logoColor=white)](./SETUP.md)
[![Architecture Flow](https://img.shields.io/badge/Architecture%20Flow-2EA44F?style=for-the-badge&logo=mermaid&logoColor=white)](./ARCHITECTURE.md)

GrowEasy CRM AI Lead Importer is a robust full-stack web application designed to clean, map, and import messy CSV datasets (e.g., Facebook Lead Exports, Google Ads Exports, arbitrary CRM sheets) into a unified GrowEasy CRM schema using the high-performance **Groq LLM AI Engine**.

---

## 🌟 Key Features

### 1. Functional Requirements (Fully Implemented)

#### 💻 Frontend (Next.js)
*   **Step 1 — Upload CSV:** Supports both traditional file picking and drag-and-drop uploads.
*   **Step 2 — Pre-AI Preview Table:** Renders the uploaded CSV raw contents in a beautiful, responsive table featuring sticky headers, horizontal scrolling, and vertical scrolling—without initiating premature AI API calls.
*   **Step 3 — Confirm Import Step:** A prominent "Confirm Import" button ensures the backend AI mapping service is called only after the user's explicit confirmation.
*   **Step 4 — Display Parsed Results:** Visualizes the final AI-extracted CRM records in a responsive table, displaying summary metrics (Total Imported, Total Skipped) and detailing skipped rows.

#### ⚙️ Backend & AI Mapping Pipeline (Node.js + Express)
*   **Arbitrary CSV Parsing:** Dynamically accepts and parses any valid CSV format (e.g., Facebook Lead Exports, Google Ads Exports, Real Estate CRM sheets, custom spreadsheets) without assuming fixed column headers.
*   **Optimized Batch Processing:** Groups records into efficient batch sizes of 10 to 20 for concurrent AI mapping and database persistence.
*   **Lead Rules & Validation Engine:**
    *   **CRM Status Enforcing:** Restricts `crm_status` strictly to: `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, or `SALE_DONE` (with a default fallback).
    *   **Data Source Enforcing:** Restricts `data_source` strictly to: `leads_on_demand`, `meridian_tower`, `eden_park`, `varah_swamy`, `sarjapur_plots`, or blank.
    *   **Date Format Normalization:** Cleans `created_at` into ISO strings or date formats fully parses by JavaScript's `new Date()`.
    *   **Fields Split & Overflow (CRM Notes):** Places primary email/phone in target fields, and automatically moves extra emails/phones or overflow data to `crm_note`.
    *   **Skip Logic:** Automatically filters out and skips records missing *both* an email and a mobile number.
    *   **CSV Compatibility:** Escapes line breaks inside CRM strings to prevent unescaped breaks from corrupting CSV structures.
*   **SQLite Lead Persistence:** Stores successfully imported leads in a localized SQLite database.

### 2. Bonus Features
*   **Drag & Drop Upload Zone:** Interactive file dropping area with clean modern CSS animations.
*   **Real-time Batch Progress Indicators:** Displays progress bars and live batch processing counters (e.g., "Processing batch 2 of 5...") in the UI.
*   **Streaming & Incremental Parsing:** Utilizes Server-Sent Events (SSE) to stream processed batches from server to client as they complete, offering instant visual updates.
*   **Intelligent AI Retry Mechanism:** Resilient backend featuring up to 3 automated retries with exponential backoff and smart parsing of the API's `Retry-After` rate-limit (429) and server (5xx) headers.
*   **Virtualized Datatable:** Smoothly renders thousands of raw CSV rows without browser lag by employing list virtualization.
*   **Persistent Theme Manager:** Beautiful system-aware dark and light modes with persistent user selection.
*   **Download Option:** Standardized export of AI-extracted leads back to a clean CSV.
*   **Containerized Orchestration (Docker Setup):** Multi-stage production Docker build pipeline, dropping root privileges to run as a restricted system user for production-grade security.
*   **Cloud Deployment:** Fully hosted and running in the cloud.

---

## 🛠️ Technology Stack

*   **Frontend:** Next.js (App Router, Tailwind CSS, TypeScript)
*   **Backend:** Node.js + Express (TypeScript)
*   **Database:** SQLite (`sqlite3` compiled natively from source in Docker)
*   **AI Engine:** Groq API SDK
*   **Orchestration:** Docker Compose
