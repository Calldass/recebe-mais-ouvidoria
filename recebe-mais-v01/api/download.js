import {issueSignedToken,presignUrl,head} from '@vercel/blob';
import {mustBeReady,httpJson,httpError,isId,filePathParts} from '../lib/core.js';
import {requireStaff} from '../lib/auth.js';
export default async function handler(req,res){
 try{
  mustBeReady();requireStaff(req);
  if(req.method!=='GET')return httpJson(res,405,{error:'Método não permitido.'});
  const id=String(req.query?.id||''),pathname=String(req.query?.path||'');
  const parts=filePathParts(pathname);
  if(!isId(id)||!parts||parts.id!==id)throw Object.assign(new Error('Arquivo inválido.'),{status:400});
  await head(pathname);
  const expires=Date.now()+5*60000;
  const delegation=await issueSignedToken({pathname,operations:['get'],validUntil:expires});
  const {presignedUrl}=await presignUrl(delegation,{pathname,operation:'get',validUntil:expires});
  return httpJson(res,200,{url:presignedUrl});
 }catch(e){return httpError(res,e);}
}
