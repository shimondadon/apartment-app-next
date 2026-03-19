// Storage layer using in-memory storage (Vercel-compatible)
// NOTE: Data persists during serverless function warm state
// For production, consider using Vercel KV, Postgres, or MongoDB

// Global shared storage that persists across API calls while function is warm
const globalStorage = new Map<string, any[]>();

export class JsonStorage {
  private filename: string;

  constructor(filename: string) {
    this.filename = filename;
  }

  read<T>(): T[] {
    if (!globalStorage.has(this.filename)) {
      globalStorage.set(this.filename, []);
    }
    return globalStorage.get(this.filename) || [];
  }

  write<T>(data: T[]): void {
    globalStorage.set(this.filename, data);
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
export const taskCompletionsStorage = new JsonStorage('task-completions.json');
