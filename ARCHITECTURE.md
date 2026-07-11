# Technical Architecture & Data Flow

This document details the architectural design, processing flow, and security configurations of the GrowEasy CRM AI Lead Importer.

---

## 🔄 Architecture & Data Flow

### 1. High-Level System Architecture
The application is structured into three primary layers: the Next.js Frontend Client, the Node.js/Express Backend Server (with SQLite database), and the External Groq Cloud LLM:

```mermaid
graph LR
    subgraph Client ["Client-Side (Next.js)"]
        UI["Interactive UI & Dashboard"] <--> |"SSE Progress Updates"| API["API Requests"]
        UI --> |"Display Table"| Table["Virtualized DataTable Preview"]
    end
    
    subgraph Server ["Backend Server (Node.js/Express)"]
        API <--> CTRL["Lead Controller"]
        CTRL <--> |"Process Batches"| AIS["AI Service (Groq SDK)"]
        CTRL --> |"Lead Persistence"| DB[("SQLite Database")]
    end
    
    subgraph External ["AI Infrastructure"]
        AIS <--> |"Resilient Retries"| Groq(("Groq Cloud LLM"))
    end
```

### 2. End-to-End Processing Flow
Below is the detailed step-by-step processing lifecycle of an uploaded CSV file:

```mermaid
graph TD
    A["User Uploads CSV"] --> B["POST /api/upload (Backend Parser)"]
    B --> C["Render Virtualized Table Preview"]
    C --> D{"User clicks Confirm Import?"}
    D -->|No| C
    D -->|Yes| E["POST /api/import-confirm"]
    E --> F["Split Records into Batches of 15"]
    F --> G["AI Service: Call Groq API"]
    G --> H{"API Request Success?"}
    H -->|"No (429/5xx)"| I["AI Retry Mechanism: Exponential Backoff"]
    I --> G
    H -->|"No (Retries Exhausted)"| J["Graceful Failure Fallback Stub"]
    H -->|Yes| K["AI Schema Mapping & Extraction"]
    J --> L["Lead Rules & Skipping Logic"]
    K --> L
    L --> M{"Skip Row? (Missing Email & Phone)"}
    M -->|Yes| N["Mark as Skipped"]
    M -->|No| O["Save to SQLite DB"]
    N --> P["Stream Progress Update via SSE"]
    O --> P
    P --> Q["Frontend: Real-time Progress Bar & Table Update"]
    Q --> R["Download Extracted CSV / View Dashboard"]
```

---

## 🏗️ Architecture & Security Highlights

*   **Multi-Stage Build Pipeline:** 
    *   In the **Builder** stage, native libraries (`sqlite3`) are compiled directly from source, eliminating standard runtime GLIBC errors on Windows/Linux host transfers.
    *   In the **Runner** stage, we throw away all build tools, source code, and developer packages. Next.js runs in its specialized `standalone` bundle, reducing the final image size from 1.5GB to ~150MB.
*   **Running as Non-Root User:** Both frontend and backend runner stages drop root access privileges to run as a restricted `nextjs` system user, providing production-grade security.
*   **SQLite Volume Persistence:** The SQLite database is mounted as a named Docker volume (`sqlite_data`) mapped to `/app/data` inside the container. This guarantees your data persists even if you rebuild or stop the container.
