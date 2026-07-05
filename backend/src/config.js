import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PORT = Number(process.env.PORT) || 4000;
export const DEMO_MODE = process.env.DEMO_MODE !== 'false';
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
export const DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/threatwatch';

export const EVIDENCE_DIR = path.resolve(
  __dirname,
  '..',
  process.env.EVIDENCE_DIR || 'evidence'
);

if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}
