// Storage layer for JSON file persistence

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class JsonStorage {
  private filePath: string;

  constructor(filename: string) {
    this.filePath = path.join(DATA_DIR, filename);
    this.ensureFile();
  }

  private ensureFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  read<T>(): T[] {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${this.filePath}:`, error);
      return [];
    }
  }

  write<T>(data: T[]): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error writing ${this.filePath}:`, error);
      throw error;
    }
  }

  add<T extends { id: string | number }>(item: T): T {
    const data = this.read<T>();
    data.push(item);
    this.write(data);
    return item;
  }

  update<T extends { id: string | number }>(id: string | number, updates: Partial<T>): T | null {
    const data = this.read<T>();
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    data[index] = { ...data[index], ...updates };
    this.write(data);
    return data[index];
  }

  findById<T extends { id: string | number }>(id: string | number): T | null {
    const data = this.read<T>();
    return data.find(item => item.id === id) || null;
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
    const newData = data.filter(item => item.id !== id);
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
