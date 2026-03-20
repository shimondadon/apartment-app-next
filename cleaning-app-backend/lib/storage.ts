import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

const DEFAULT_DATA_DIR = path.resolve(process.cwd(), 'data');
const RUNTIME_DATA_DIR = path.join('/tmp', 'cleaning-app-data');

function resolveDataDir(): string {
  if (process.env.DATA_DIR) {
    return path.resolve(process.env.DATA_DIR);
  }

  // Vercel serverless file system is read-only outside /tmp.
  if (process.env.VERCEL === '1') {
    return RUNTIME_DATA_DIR;
  }

  return DEFAULT_DATA_DIR;
}

const DATA_DIR = resolveDataDir();

function getSeedDirs(): string[] {
  const candidates = [
    DEFAULT_DATA_DIR,
    path.resolve(process.cwd(), 'cleaning-app-backend', 'data')
  ];

  // Deduplicate possible identical paths.
  return [...new Set(candidates)];
}

function getInitialFileContent(filename: string): string {
  for (const seedDir of getSeedDirs()) {
    const seedPath = path.join(seedDir, filename);
    if (!existsSync(seedPath)) {
      continue;
    }

    try {
      const raw = readFileSync(seedPath, 'utf8').trim();
      return raw || '[]';
    } catch {
      // Try the next seed source.
    }
  }

  return '[]';
}

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

export class JsonStorage {
  private filePath: string;

  constructor(filename: string) {
    this.filePath = path.join(DATA_DIR, filename);
  }

  private ensureFile(): void {
    ensureDataDir();
    if (!existsSync(this.filePath)) {
      const initialContent = getInitialFileContent(path.basename(this.filePath));
      writeFileSync(this.filePath, initialContent, 'utf8');
    }
  }

  read<T>(): T[] {
    this.ensureFile();

    try {
      const raw = readFileSync(this.filePath, 'utf8').trim();
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  write<T>(data: T[]): void {
    this.ensureFile();
    writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  add<T extends { id: string | number }>(item: T): T {
    const data = this.read<T>();
    data.push(item);
    this.write(data);
    return item;
  }

  update<T extends { id: string | number }>(id: string | number, updates: Partial<T>): T | null {
    const data = this.read<T>();
    const normalizedId = String(id);
    const index = data.findIndex(item => String(item.id) === normalizedId);
    if (index === -1) return null;

    data[index] = { ...data[index], ...updates };
    this.write(data);
    return data[index];
  }

  findById<T extends { id: string | number }>(id: string | number): T | null {
    const data = this.read<T>();
    const normalizedId = String(id);
    return data.find(item => String(item.id) === normalizedId) || null;
  }

  findOne<T>(predicate: (item: T) => boolean): T | null {
    const data = this.read<T>();
    return data.find(predicate) || null;
  }

  findMany<T>(predicate: (item: T) => boolean): T[] {
    const data = this.read<T>();
    return data.filter(predicate);
  }

  delete(id: string | number): boolean {
    const data = this.read<any>();
    const normalizedId = String(id);
    const newData = data.filter(item => String(item.id) !== normalizedId);
    if (newData.length === data.length) return false;
    this.write(newData);
    return true;
  }
}

// Initialize storage instances
export const workersStorage = new JsonStorage('workers.json');
export const workSessionsStorage = new JsonStorage('work-sessions.json');
export const inventoryLogsStorage = new JsonStorage('inventory-logs.json');
export const issuesStorage = new JsonStorage('issues.json');
export const taskCompletionsStorage = new JsonStorage('task-completions.json');
