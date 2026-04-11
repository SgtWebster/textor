// app/api/experiment/_storage.ts
// MVP: persists records as JSON Lines in a project-local data directory.
// For production, replace with a proper database (e.g. Prisma + Postgres / Supabase).

import { promises as fs } from "fs";
import path from "path";

// Store data under <project-root>/data/experiment/ for persistence across restarts.
// Ensure this directory is listed in .gitignore.
const DATA_DIR = path.join(process.cwd(), "data", "experiment");

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function appendRecord(
  filename: string,
  record: object
): Promise<void> {
  await ensureDir();
  const line = JSON.stringify(record) + "\n";
  await fs.appendFile(path.join(DATA_DIR, filename), line, "utf-8");
}

export async function readRecords<T>(filename: string): Promise<T[]> {
  await ensureDir();
  try {
    const content = await fs.readFile(
      path.join(DATA_DIR, filename),
      "utf-8"
    );
    return content
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as T);
  } catch {
    return [];
  }
}

export async function updateLastRecord(
  filename: string,
  predicate: (r: Record<string, unknown>) => boolean,
  updater: (r: Record<string, unknown>) => Record<string, unknown>
): Promise<void> {
  const records = await readRecords<Record<string, unknown>>(filename);
  // Find last matching record index and update it
  let lastIdx = -1;
  for (let i = records.length - 1; i >= 0; i--) {
    if (predicate(records[i])) { lastIdx = i; break; }
  }
  if (lastIdx === -1) return;
  records[lastIdx] = updater(records[lastIdx]);
  await ensureDir();
  const content = records.map((r) => JSON.stringify(r)).join("\n") + "\n";
  await fs.writeFile(path.join(DATA_DIR, filename), content, "utf-8");
}
