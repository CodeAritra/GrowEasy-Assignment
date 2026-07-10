import sqlite3 from "sqlite3";
import path from "path";

const DB_PATH: string = process.env.DATABASE_PATH !
export type SqlParam = string | number | boolean | null;

// Initialize database connection
export const db: sqlite3.Database = new sqlite3.Database(DB_PATH, (err: Error | null): void => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database at:", DB_PATH);
    initializeSchema();
  }
});

function initializeSchema(): void {
  const schemaQuery: string = `
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT,
      name TEXT,
      email TEXT,
      country_code TEXT,
      mobile_without_country_code TEXT,
      company TEXT,
      city TEXT,
      state TEXT,
      country TEXT,
      lead_owner TEXT,
      crm_status TEXT CHECK(crm_status IN ('GOOD_LEAD_FOLLOW_UP', 'DID_NOT_CONNECT', 'BAD_LEAD', 'SALE_DONE')),
      crm_note TEXT,
      data_source TEXT CHECK(data_source IN ('leads_on_demand', 'meridian_tower', 'eden_park', 'varah_swamy', 'sarjapur_plots', '', NULL)),
      possession_time TEXT,
      description TEXT
    );
  `;

  db.run(schemaQuery, (err: Error | null): void => {
    if (err) {
      console.error("Error initializing schema:", err.message);
    } else {
      console.log("Database schema initialized successfully.");
    }
  });
}

/**
 * Promisified run helper
 */
export function runQuery(sql: string, params: SqlParam[] = []): Promise<void> {
  return new Promise((resolve: () => void, reject: (err: Error) => void): void => {
    db.run(sql, params, function (this: sqlite3.RunResult, err: Error | null): void {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Promisified all helper
 */
export function allQuery<T>(sql: string, params: SqlParam[] = []): Promise<T[]> {
  return new Promise((resolve: (value: T[]) => void, reject: (err: Error) => void): void => {
    db.all(sql, params, (err: Error | null, rows: Record<string, SqlParam>[]): void => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as unknown as T[]);
      }
    });
  });
}


