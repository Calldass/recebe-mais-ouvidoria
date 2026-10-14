import {mustBeReady,VALID_MINUTES,newId,sign,httpJson,httpError,requireSameOrigin} from '../lib/core.js';
import {requireStaff} from '../lib/auth.js';
import {saveRecord,listReceipts} from '../lib/repo.js';
export default async function handler(req,res){
 try{
  mustBeReady();requireStaff(req);
  if(req.method==='GET') return httpJson(res,200,{receipts:await listReceipts()});
  if(req.method==='POST'){
   requireSameOrigin(req);
   const ttl=Number(req.body?.ttl),ref=String(req.body?.reference||'').trim();
   if(!VALID_MINUTES.has(ttl) || ref.length>80) throw Object.assign(new Error('Dados inválidos.'),{status:400});
   const created=Date.now(),record={id:newId(),reference:ref,created,expires:created+ttl*60000,closed:false};
   await saveRecord(record);
   return httpJson(res,201,{receipt:record,invite:sign({k:'invite',id:record.id,exp:record.expires})});
  }
  return httpJson(res,405,{error:'Método não permitido.'});
 }catch(e){return httpError(res,e);}
}
