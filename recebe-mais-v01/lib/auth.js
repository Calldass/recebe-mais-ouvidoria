import crypto from 'node:crypto';
import {sign,verify} from './core.js';
const NAME='recebep_staff';
export function correctPassword(input){
  if(typeof input!=='string' || input.length>200) return false;
  const a=crypto.createHash('sha256').update(input).digest();
  const b=crypto.createHash('sha256').update(process.env.STAFF_PASSWORD).digest();
  return crypto.timingSafeEqual(a,b);
}
export function loggedIn(req){
  const cookies=String(req.headers.cookie||'').split(';').map(t=>t.trim());
  const cookie=cookies.find(x=>x.startsWith(NAME+'='));
  const token=cookie?.slice(NAME.length+1);
  const data=verify(token);return Boolean(data && data.k==='staff');
}
export function requireStaff(req){if(!loggedIn(req)) throw Object.assign(new Error('Entre com a senha do atendente.'),{status:401});}
export function staffCookie(req){
  const production=Boolean(process.env.VERCEL) || !String(req.headers.host||'').startsWith('localhost');
  const token=sign({k:'staff',exp:Date.now()+8*3600000});
  return `${NAME}=${token}; Path=/; Max-Age=28800; HttpOnly; SameSite=Strict${production?'; Secure':''}`;
}
export function clearCookie(req){
  const production=Boolean(process.env.VERCEL) || !String(req.headers.host||'').startsWith('localhost');
  return `${NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict${production?'; Secure':''}`;
}
