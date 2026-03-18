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

// Initialize with test data on cold start
function initializeTestData() {
  // Only initialize if storage is empty
  if (workersStorage.read().length === 0) {
    const testWorker = {
      id: 'worker_test_001',
      name: 'Test Worker',
      code: 'test',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    };
    workersStorage.add(testWorker);

    // Add some completed work sessions
    const sessions = [
      {
        id: 'session_001',
        workerId: 'worker_test_001',
        apartmentId: 'apt_001',
        startTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        status: 'completed',
      },
      {
        id: 'session_002',
        workerId: 'worker_test_001',
        apartmentId: 'apt_002',
        startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000),
        status: 'completed',
      },
      {
        id: 'session_003',
        workerId: 'worker_test_001',
        apartmentId: 'apt_001',
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000),
        status: 'completed',
      },
    ];
    
    sessions.forEach(session => workSessionsStorage.add(session));
  }
}

// Initialize test data on module load
initializeTestData();
