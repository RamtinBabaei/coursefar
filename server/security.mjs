import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import {promisify} from 'node:util';
const derive=promisify(scrypt);
export const digest=(s)=>createHash('sha256').update(s).digest('hex');
export const token=()=>randomBytes(32).toString('hex');
export async function hashPassword(password){const salt=randomBytes(16).toString('hex'); const key=await derive(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});return `${salt}:${key.toString('hex')}`;}
export async function checkPassword(password,hash){const [salt,encoded]=hash.split(':');if(!salt||!encoded)return false;const expected=Buffer.from(encoded,'hex');const key=await derive(password,salt,expected.length,{N:32768,r:8,p:1,maxmem:64*1024*1024});return key.length===expected.length&&timingSafeEqual(key,expected);}
