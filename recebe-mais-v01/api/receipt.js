import {mustBeReady,isId,sign,httpJson,httpError,requireSameOrigin} from '../lib/core.js';
import {requireStaff} from '../lib/auth.js';
import {readRecord,saveRecord,listFiles} from '../lib/repo.js';
export default async function handler(req,res){
 try{
  mustBeReady();requireStaff(req);
  const id=String(req.query?.id||'');
  if(!isId(id)) throw Object.assign(new Error('Identificador inválido.'),{status:400});
  const rec=await readRecord(id);
  if(!rec) throw Object.assign(new Error('Recebimento não encontrado.'),{status:404});
  if(req.method==='GET') return httpJson(res,200,{receipt:rec,invite:sign({k:'invite',id:rec.id,exp:rec.expires}),files:await listFiles(id)});
  if(req.method==='POST'){
   requireSameOrigin(req);
   if(req.body?.action!=='close') throw Object.assign(new Error('Ação inválida.'),{status:400});
   rec.closed=true;
   await saveRecord(rec);
   return httpJson(res,200,{receipt:rec});
  }
  return httpJson(res,405,{error:'Método não permitido.'});
 }catch(e){return httpError(res,e);}
}
