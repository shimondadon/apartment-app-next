// Shared TypeScript interfaces for Frontend and Backend

export interface Worker {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
}

export interface Apartment {
  id: number;
  name: string;
  icon: string;
  subtitle?: string;
  badges?: ApartmentBadge[];
}

export interface ApartmentBadge {
  type: 'new' | 'special';
  label: string;
}

export interface WorkSession {
  id: string;
  workerId: string;
  apartmentId: number;
  startTime: Date;
  endTime?: Date;
  location?: GeolocationCoordinates;
  status: 'working' | 'completed';
}

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface TaskCategory {
  name: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  text: string;
  hasInventory: boolean;
  completed?: boolean;
  inventory?: InventoryItem[];
}

export interface InventoryItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface InventoryLog {
  id: string;
  workSessionId: string;
  taskId: string;
  items: InventoryItem[];
  timestamp: Date;
}

export interface Issue {
  id: string;
  workSessionId: string;
  apartmentId: number;
  category: IssueCategory;
  description: string;
  images?: string[];
  timestamp: Date;
  status: 'reported' | 'resolved';
}

export type IssueCategory = 
  | 'maintenance'
  | 'cleaning'
  | 'supplies'
  | 'safety'
  | 'other';

export interface TaskCompletion {
  id: string;
  workSessionId: string;
  taskId: string;
  timestamp: Date;
}

export interface TaskWithStatus extends Task {
  categoryName: string;
}

export interface WorkSummary {
  workSessionId: string;
  worker: Worker;
  apartment: Apartment;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  tasksCompleted: number;
  totalTasks: number;
  tasks: TaskWithStatus[];
  inventoryUsed: InventoryLog[];
  issuesReported: Issue[];
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  worker?: Worker;
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  name: string;
  code: string;
}

export interface StartWorkRequest {
  workerId: string;
  apartmentId: number;
  location?: GeolocationCoordinates;
}

export interface CompleteTaskRequest {
  workSessionId: string;
  taskId: string;
  inventory?: InventoryItem[];
}

export interface ReportIssueRequest {
  workSessionId: string;
  apartmentId: number;
  category: IssueCategory;
  description: string;
  images?: File[];
}

export interface Language {
  code: 'he' | 'en';
  name: string;
  direction: 'rtl' | 'ltr';
}
