import crypto from 'node:crypto';
import {deleteExpired} from '../lib/repo.js';
import {httpJson,httpError,mustBeReady} from '../lib/core.js';
export default async function handler(req,res){
 try{
  if(req.method!=='GET') return httpJson(res,405,{error:'Método não permitido.'});
  mustBeReady();
  const token=String(process.env.CRON_SECRET||'');
  const supplied=String(req.headers.authorization||'');
  if(token.length<16 || supplied.length!==token.length+7 || !crypto.timingSafeEqual(Buffer.from(supplied),Buffer.from('Bearer '+token)))return httpJson(res,401,{error:'Não autorizado.'});
  const days=Math.max(1,Math.min(30,Number(process.env.RETENTION_DAYS||3)));
  return httpJson(res,200,{deleted:await deleteExpired(days)});
 }catch(e){return httpError(res,e);}
}
