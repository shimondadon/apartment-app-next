// Storage layer using in-memory storage (Vercel-compatible)
// NOTE: Data will be lost on serverless function cold starts
// For production, consider using Vercel KV, Postgres, or MongoDB

export class JsonStorage {
  private data: Map<string, any[]>;
  private filename: string;

  constructor(filename: string) {
    this.filename = filename;
    this.data = new Map();
  }

  read<T>(): T[] {
    if (!this.data.has(this.filename)) {
      this.data.set(this.filename, []);
    }
    return this.data.get(this.filename) || [];
  }

  write<T>(data: T[]): void {
    this.data.set(this.filename, data);
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
