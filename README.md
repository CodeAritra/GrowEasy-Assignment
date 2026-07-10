# GrowEasy CRM — AI-Powered CSV Lead Importer
### Developed by **Aritra Dhank**

GrowEasy CRM AI Lead Importer is a robust full-stack web application designed to clean, map, and import messy CSV datasets (e.g., Facebook Lead Exports, Google Ads Exports, arbitrary CRM sheets) into a unified GrowEasy CRM schema using the high-performance **Groq LLM AI Engine**.

---

## 🌟 Key Features

### 1. Required Features (Fully Implemented)
*   **Intelligent AI Mapping & Extraction:** Calls Groq API in batches of 10-20 leads to resolve headers, extract phone country codes, and map fields correctly into the target GrowEasy CRM format.
*   **Dual-Stage Import Flow:**
    1.  **Step 1:** Upload file & preview raw contents locally in a responsive, virtualized scroll table.
    2.  **Step 2:** Confirm import to trigger the backend AI mapping service, preventing premature API expenses.
*   **Data Validation & Skipping Logic:** Automatically skips records missing both email and mobile numbers.
*   **SQLite Lead Persistence:** Stores imported leads in a localized SQLite database.
*   **Dashboard Analytics:** Shows import metrics (Total Imported, Total Skipped) along with an interactive, searchable datatable of all imported leads.

### 2. Bonus Features (Fully Implemented)
*   **Dynamic Multi-Environment Setup (Docker & Local):** Full separation of Development and Production environment variables (`.env.development` & `.env.production`) for maximum flexibility.
*   **Drag & Drop Upload:** Drop area with modern CSS transitions.
*   **Real-time Batch Progress Indicators:** Shows progress (e.g., "Processing batch 2 of 5...") to provide an interactive user experience.
*   **Virtualized Datatable:** Employs efficient rendering to support thousands of preview rows without lagging the UI.
*   **Persistent Theme Manager:** Support for beautiful persistent Light and Dark modes.
*   **Download Option:** Easily export the final mapped, AI-extracted leads back as a clean, standardized CSV.
*   **Containerized Orchestration (Docker Compose):** Optimized, secure, multi-stage Docker build pipeline for instant local deployment.

---

## 🛠️ Technology Stack

*   **Frontend:** Next.js (App Router, Tailwind CSS, TypeScript)
*   **Backend:** Node.js + Express (TypeScript)
*   **Database:** SQLite (`sqlite3` compiled natively from source in Docker)
*   **AI Engine:** Groq API SDK (Resolving mapping ambiguities and extracting leads)
*   **Orchestration:** Docker Compose (Docker Engine WSL2 backend)

---

## 🚀 Quick Start 

The easiest and recommended way for a reviewer to run the application is using **Docker**, as it automatically compiles all native dependencies (including SQLite) and manages the service networking.

### Step 1: Copy Environment Templates
From the project root folder (`d:\GrowEasy`), run the following commands in your terminal to initialize the environment files:

*   **Linux / macOS / Git Bash:**
    ```bash
    cp frontend/.env.example frontend/.env.development
    cp backend/.env.example backend/.env.development
    ```
*   **Windows (PowerShell):**
    ```powershell
    Copy-Item frontend/.env.example frontend/.env.development
    Copy-Item backend/.env.example backend/.env.development
    ```

### Step 2: Add your Groq API Key
Open the newly created [backend/.env.development](file:///d:/GrowEasy/backend/.env.development) file and insert your API key:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### Step 3: Run the Application
Start the containerized stack in the background:
```bash
docker compose up -d --build
```
*(No environment warnings will be shown as the stack dynamically resolves environment configurations).*

### Step 4: Verify Setup
*   **Frontend UI:** Open [http://localhost:3000](http://localhost:3000) 
*   **Backend Server:** Open [http://localhost:4000/api/health](http://localhost:4000/api/health) (Should return `{ "status": "ok" }`).

To shut down the application:
```bash
docker compose down
```

---

## 🛠️ Alternative Local Setup (Without Docker)

If you prefer to run the services natively on your machine, follow these steps:

### Pre-requisites
Ensure you have **Node.js (v20+)** installed.

### 1. Backend Setup
1. Copy the environment template:
   ```bash
   cd backend
   cp .env.example .env.development
   ```
2. Open `.env.development` and add your `GROQ_API_KEY`.
3. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```
   *(Server starts on `http://localhost:4000`)*

### 2. Frontend Setup
1. Open a new terminal window, navigate to the frontend directory:
   ```bash
   cd frontend
   cp .env.example .env.development
   ```
2. Install dependencies and start the Next.js app:
   ```bash
   npm install
   npm run dev
   ```
   *(Frontend dashboard runs on `http://localhost:3000`)*

---

## 🏗️ Architecture & Security Highlights

*   **Multi-Stage Build Pipeline:** 
    *   In the **Builder** stage, native libraries (`sqlite3`) are compiled directly from source, eliminating standard runtime GLIBC errors on Windows/Linux host transfers.
    *   In the **Runner** stage, we throw away all build tools, source code, and developer packages. Next.js runs in its specialized `standalone` bundle, reducing the final image size from 1.5GB to ~150MB.
*   **Running as Non-Root User:** Both frontend and backend runner stages drop root access privileges to run as a restricted `nextjs` system user, providing production-grade security.
*   **SQLite Volume Persistence:** The SQLite database is mounted as a named Docker volume (`sqlite_data`) mapped to `/app/data` inside the container. This guarantees your data persists even if you rebuild or stop the container.
