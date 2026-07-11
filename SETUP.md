# Setup & Installation Guide

This document outlines the step-by-step instructions to run the GrowEasy CRM AI Lead Importer locally on your system, both with and without Docker.

---

## 🚀 Quick Start (Docker Setup - Recommended)

The easiest and recommended way for a reviewer to run the application is using **Docker**, as it automatically compiles all native dependencies (including SQLite) and manages the service networking.

### Step 1: Clone the Repository
Clone the repository to your local machine and navigate to the project directory:
```bash
git clone https://github.com/CodeAritra/GrowEasy-Assignment.git
cd GrowEasy-Assignment
```

### Step 2: Copy Environment Templates
Run the following commands in your terminal to initialize the environment files:

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

### Step 3: Add your Groq API Key
Open the newly created `backend/.env.development` file and insert your API key:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### Step 4: Run the Application
Start the containerized stack in the background:
```bash
docker compose up -d --build
```
*(No environment warnings will be shown as the stack dynamically resolves environment configurations).*

### Step 5: Verify Setup
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
