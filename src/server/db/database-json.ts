import { join } from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

// Data directory
const dataDir = join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// File paths
const usersFile = join(dataDir, 'users.json');
const productsFile = join(dataDir, 'products-db.json');
const sessionsFile = join(dataDir, 'sessions.json');

// Type definitions
interface UserData {
  id: string;
  username: string;
  password_hash: string;
  email: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface ProductData {
  id: string;
  slug: string;
  name_ru: string;
  name_uz: string | null;
  description_ru: string | null;
  description_uz: string | null;
  price: number;
  old_price: number | null;
  category: string;
  images: string;
  specs: string;
  in_stock: number;
  featured: number;
  is_new: number;
  related_products: string | null;
  created_at: string;
  updated_at: string;
}

interface SessionData {
  sid: string;
  user_id: string;
  created_at: string;
  expires_at: string;
}

interface DataStore {
  users: UserData[];
  products: ProductData[];
  sessions: SessionData[];
}

// Initialize data files if they don't exist
function initFile<T>(filePath: string, defaultData: T): void {
  if (!existsSync(filePath)) {
    writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

// Read JSON file
function readJson<T>(filePath: string, defaultData: T): T {
  if (!existsSync(filePath)) {
    return defaultData;
  }
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return defaultData;
  }
}

// Write JSON file
function writeJson<T>(filePath: string, data: T): void {
  writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Database-like interface
export const db = {
  users: {
    all: (): UserData[] => readJson<UserData[]>(usersFile, []),
    find: (predicate: (u: UserData) => boolean): UserData | undefined => 
      readJson<UserData[]>(usersFile, []).find(predicate),
    insert: (user: UserData): void => {
      const users = readJson<UserData[]>(usersFile, []);
      users.push(user);
      writeJson(usersFile, users);
    },
    update: (id: string, updates: Partial<UserData>): void => {
      const users = readJson<UserData[]>(usersFile, []);
      const index = users.findIndex(u => u.id === id);
      if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        writeJson(usersFile, users);
      }
    },
    count: (): number => readJson<UserData[]>(usersFile, []).length,
  },
  products: {
    all: (): ProductData[] => readJson<ProductData[]>(productsFile, []),
    find: (predicate: (p: ProductData) => boolean): ProductData | undefined =>
      readJson<ProductData[]>(productsFile, []).find(predicate),
    filter: (predicate: (p: ProductData) => boolean): ProductData[] =>
      readJson<ProductData[]>(productsFile, []).filter(predicate),
    insert: (product: ProductData): void => {
      const products = readJson<ProductData[]>(productsFile, []);
      products.push(product);
      writeJson(productsFile, products);
    },
    insertMany: (newProducts: ProductData[]): void => {
      const products = readJson<ProductData[]>(productsFile, []);
      products.push(...newProducts);
      writeJson(productsFile, products);
    },
    update: (id: string, updates: Partial<ProductData>): void => {
      const products = readJson<ProductData[]>(productsFile, []);
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        products[index] = { ...products[index], ...updates };
        writeJson(productsFile, products);
      }
    },
    delete: (id: string): boolean => {
      const products = readJson<ProductData[]>(productsFile, []);
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        products.splice(index, 1);
        writeJson(productsFile, products);
        return true;
      }
      return false;
    },
    count: (): number => readJson<ProductData[]>(productsFile, []).length,
  },
  sessions: {
    all: (): SessionData[] => readJson<SessionData[]>(sessionsFile, []),
    find: (predicate: (s: SessionData) => boolean): SessionData | undefined =>
      readJson<SessionData[]>(sessionsFile, []).find(predicate),
    insert: (session: SessionData): void => {
      const sessions = readJson<SessionData[]>(sessionsFile, []);
      sessions.push(session);
      writeJson(sessionsFile, sessions);
    },
    delete: (sid: string): boolean => {
      const sessions = readJson<SessionData[]>(sessionsFile, []);
      const index = sessions.findIndex(s => s.sid === sid);
      if (index !== -1) {
        sessions.splice(index, 1);
        writeJson(sessionsFile, sessions);
        return true;
      }
      return false;
    },
    deleteExpired: (): number => {
      const sessions = readJson<SessionData[]>(sessionsFile, []);
      const now = new Date().toISOString();
      const validSessions = sessions.filter(s => s.expires_at > now);
      const deleted = sessions.length - validSessions.length;
      writeJson(sessionsFile, validSessions);
      return deleted;
    },
  },
};

// Initialize schema (create files if they don't exist)
export function initializeDatabase(): void {
  initFile(usersFile, []);
  initFile(productsFile, []);
  initFile(sessionsFile, []);
  console.log('Database initialized successfully');
}

// For compatibility with existing code
export function getDb() {
  return db;
}

export default db;
