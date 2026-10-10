import seed from '../server/seed.json';
import {createDemoSeed, createDemoService} from './demoStore';
import type {DemoPersistence, DemoSession, DemoState} from './demoStore';

const databaseName = 'coursefar-pages-demo';
const storageError = 'ذخیره اطلاعات دمو در مرورگر انجام نشد. فضای خالی و مجوزهای مرورگر را بررسی کنید.';
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {reject(new Error(storageError)); return;}
    let request: IDBOpenDBRequest;
    try {request = indexedDB.open(databaseName, 1);} catch {reject(new Error(storageError)); return;}
    request.onupgradeneeded = () => request.result.createObjectStore('state');
    request.onerror = request.onblocked = () => reject(new Error(storageError));
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
  });
}
const persistence: DemoPersistence = {
  async load() {
    const db = await openDatabase();
    try {
      return await new Promise<DemoState | null>((resolve, reject) => {
        const transaction = db.transaction('state', 'readonly');
        const request = transaction.objectStore('state').get('platform');
        transaction.oncomplete = () => resolve(request.result ?? null);
        transaction.onerror = transaction.onabort = () => reject(new Error(storageError));
      });
    } finally {db.close();}
  },
  async save(state) {
    const db = await openDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('state', 'readwrite');
        transaction.objectStore('state').put(state, 'platform');
        transaction.oncomplete = () => resolve();
        transaction.onerror = transaction.onabort = () => reject(new Error(storageError));
      });
    } finally {db.close();}
  },
};
const session: DemoSession = {
  read() {try {return sessionStorage.getItem('coursefar-demo-user');} catch {return null;}},
  write(id) {
    try {
      if (id) sessionStorage.setItem('coursefar-demo-user', id);
      else sessionStorage.removeItem('coursefar-demo-user');
    } catch { /* Session still works in memory when browser session storage is disabled. */ }
  },
};
export const demoApi = createDemoService(createDemoSeed(seed), persistence, session);
