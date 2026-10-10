// Profile photos stay in this browser. No credentials or image data go into localStorage.
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const DB_NAME = 'coursefar-local';
const STORE_NAME = 'avatars';
const AVATAR_EVENT = 'coursefar:avatar-updated';
export type AvatarRecord = {userId:string;blob:Blob|null;updatedAt:number;type:string};
const storageMessage = 'ذخیره‌سازی تصویر در مرورگر ناموفق بود. فضای خالی و مجوزهای مرورگر را بررسی کنید و دوباره تلاش کنید.';

function openAvatarDb():Promise<IDBDatabase> {
  return new Promise((resolve,reject) => {
    if (typeof indexedDB === 'undefined') {reject(new Error(storageMessage));return;}
    let request:IDBOpenDBRequest;
    try {request = indexedDB.open(DB_NAME,1);} catch {reject(new Error(storageMessage));return;}
    request.onerror = () => reject(new Error(storageMessage));
    request.onblocked = () => reject(new Error('فضای ذخیره‌سازی توسط تب دیگری اشغال شده است. تب دیگر را ببندید و دوباره تلاش کنید.'));
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME,{keyPath:'userId'});
    };
    request.onsuccess = () => {request.result.onversionchange=()=>request.result.close();resolve(request.result);};
  });
}

export function avatarKeys(userId:string,profileId?:string|null) {
  return [...new Set([userId,profileId].filter((key):key is string=>Boolean(key)))];
}

export async function getLocalAvatar(keys:string[]):Promise<AvatarRecord|null> {
  if (!keys.length) return null;
  const db = await openAvatarDb();
  try {
    return await new Promise((resolve,reject) => {
      const tx=db.transaction(STORE_NAME,'readonly');
      const records:AvatarRecord[]=[];
      for (const key of keys) {
        const request=tx.objectStore(STORE_NAME).get(key);
        request.onsuccess=()=>{if(request.result) records.push(request.result as AvatarRecord);};
      }
      tx.oncomplete=()=>resolve(records.sort((a,b)=>b.updatedAt-a.updatedAt)[0]??null);
      tx.onerror=tx.onabort=()=>reject(new Error(storageMessage));
    });
  } finally {db.close();}
}

const channel=typeof BroadcastChannel!=='undefined'?new BroadcastChannel(AVATAR_EVENT):null;
function broadcast(keys:string[]) {
  window.dispatchEvent(new CustomEvent(AVATAR_EVENT,{detail:{keys}}));
  channel?.postMessage({keys});
}
if (channel) channel.onmessage=event=>{
  if(Array.isArray(event.data?.keys)) window.dispatchEvent(new CustomEvent(AVATAR_EVENT,{detail:event.data}));
};

// One transaction commits both the account ID and instructor profile ID together.
async function writeAvatar(keys:string[],blob:Blob|null) {
  if(!keys.length) throw new Error('شناسه کاربر برای ذخیره تصویر پیدا نشد.');
  const db=await openAvatarDb();
  try {
    await new Promise<void>((resolve,reject)=>{
      const tx=db.transaction(STORE_NAME,'readwrite');
      const updatedAt=Date.now();
      for(const key of keys) tx.objectStore(STORE_NAME).put({userId:key,blob,updatedAt,type:blob?.type??''} satisfies AvatarRecord);
      tx.oncomplete=()=>resolve();
      tx.onerror=tx.onabort=()=>reject(new Error(storageMessage));
    });
  } catch {throw new Error(storageMessage);} finally {db.close();}
  broadcast(keys);
}
export const saveLocalAvatar=(keys:string[],file:Blob)=>writeAvatar(keys,file);
// A null override hides a pre-existing seeded/server photo as well as a local photo.
export const removeLocalAvatar=(keys:string[])=>writeAvatar(keys,null);

export function subscribeAvatarChanges(callback:(keys:string[])=>void) {
  const listener=(event:Event)=>{
    const detail=(event as CustomEvent<{keys:string[]}>).detail;
    if(detail?.keys) callback(detail.keys);
  };
  window.addEventListener(AVATAR_EVENT,listener);
  return ()=>window.removeEventListener(AVATAR_EVENT,listener);
}

export async function validateAvatarFile(file:File) {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('فرمت تصویر باید JPG، PNG یا WebP باشد.');
  if(file.size>AVATAR_MAX_BYTES) throw new Error('حجم تصویر باید حداکثر ۲ مگابایت باشد.');
  if(!file.size) throw new Error('فایل تصویر خالی است.');
  const url=URL.createObjectURL(file);
  try {
    await new Promise<void>((resolve,reject)=>{
      const image=new Image();
      image.onload=()=>image.naturalWidth&&image.naturalHeight?resolve():reject(new Error());
      image.onerror=()=>reject(new Error());
      image.src=url;
    });
  } catch {throw new Error('فایل تصویر خراب یا غیرقابل خواندن است.');} finally {URL.revokeObjectURL(url);}
  return file;
}
