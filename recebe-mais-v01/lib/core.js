import crypto from 'node:crypto';

export const MAX_FILE_BYTES = Math.max(1, Math.min(Number(process.env.MAX_FILE_MB) || 1024, 5120)) * 1024 * 1024;
export const VALID_MINUTES = new Set([30,120,480,1440]);
export const MAX_FILES_PER_RECEIPT = 5;
export const ALLOWED_EXTENSIONS = new Set(['mp4','mov','m4v','webm','avi','jpg','jpeg','png','heic','heif','mp3','m4a','wav','ogg','pdf']);
export const ALLOWED_MIMES = ['video/*','audio/*','image/*','application/pdf','application/octet-stream'];
const UID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function envReady(){
  return Boolean(process.env.APP_SECRET && process.env.APP_SECRET.length>=32 && process.env.STAFF_PASSWORD && process.env.STAFF_PASSWORD.length>=16 && (process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN));
}
export function mustBeReady(){ if (!envReady()) throw Object.assign(new Error('Configuração pendente no painel da Vercel.'), {status:503}); }
export const isId = val => UID.test(String(val || ''));
export const newId = () => crypto.randomUUID();
export function sign(data){
  const json=Buffer.from(JSON.stringify(data)).toString('base64url');
  const sig=crypto.createHmac('sha256',process.env.APP_SECRET).update(json).digest('base64url');
  return `${json}.${sig}`;
}
export function verify(token){
  if(!process.env.APP_SECRET || typeof token!=='string' || token.length>2500 || !token.includes('.')) return null;
  const [body,sig,...extra]=token.split('.');
  if(extra.length || !body || !sig) return null;
  const expected=crypto.createHmac('sha256',process.env.APP_SECRET).update(body).digest();
  let actual;
  try {actual=Buffer.from(sig,'base64url');}catch{return null;}
  if(actual.length!==expected.length || !crypto.timingSafeEqual(actual,expected)) return null;
  try {const decoded=JSON.parse(Buffer.from(body,'base64url').toString('utf8')); return Number.isSafeInteger(decoded.exp) && decoded.exp>Date.now() ? decoded : null;}
  catch{return null;}
}
export function validateInvite(token,id){
  const p=verify(token); return Boolean(p && p.k==='invite' && isId(p.id) && p.id===id);
}
export function fileNameAllowed(name){
  if(typeof name!=='string' || name.length>160 || name.includes('/') || name.includes('\\') || /[\x00-\x1f]/.test(name)) return false;
  return ALLOWED_EXTENSIONS.has((name.split('.').pop()||'').toLowerCase());
}
export function filePathParts(path){
  if(typeof path!=='string' || path.length>400) return null;
  const parts=path.split('/');
  if(parts.length!==4 || parts[0]!=='uploads' || !isId(parts[1]) || !isId(parts[2]) || !fileNameAllowed(parts[3])) return null;
  return {id:parts[1],name:parts[3]};
}
export function fileNameFromPath(path){return String(path).split('/').at(-1) || 'arquivo';}
export function httpJson(res,status,data){
  res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');
  res.status(status).json(data);
}
export function httpError(res,error){
  const status=Number.isInteger(error?.status)?error.status:500;
  if(status>=500) console.error('Erro interno:',error?.name,error?.message);
  return httpJson(res,status,{error:status>=500?'Não foi possível processar esta solicitação.':error.message});
}
export function requireSameOrigin(req){
  const origin=req.headers.origin;
  const host=req.headers['x-forwarded-host']||req.headers.host;
  if(origin && new URL(origin).host!==host) throw Object.assign(new Error('Origem não permitida.'),{status:403});
}
