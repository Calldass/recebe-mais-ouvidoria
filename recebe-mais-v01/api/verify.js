import {mustBeReady,validateInvite,httpJson,httpError,isId} from '../lib/core.js';
import {readRecord,listFiles} from '../lib/repo.js';
export default async function handler(req,res){
 try{
  if(req.method!=='POST')return httpJson(res,405,{error:'Método não permitido.'});
  mustBeReady();
  const {id,invite}=req.body||{};
  if(!isId(id)||!validateInvite(invite,id)) throw Object.assign(new Error('Link de envio inválido ou expirado.'),{status:403});
  const record=await readRecord(id);
  if(!record||record.closed||record.expires<=Date.now()) throw Object.assign(new Error('Esse recebimento não está mais disponível.'),{status:410});
  const files=await listFiles(id);
  return httpJson(res,200,{expires:record.expires,remaining:Math.max(0,5-files.length),maxFileBytes:Math.max(1,Math.min(Number(process.env.MAX_FILE_MB)||1024,5120))*1048576});
 }catch(e){return httpError(res,e);}
}
