import {handleUploadPresigned} from '@vercel/blob/client';
import {issueSignedToken} from '@vercel/blob';
import {mustBeReady,isId,validateInvite,ALLOWED_MIMES,MAX_FILE_BYTES,MAX_FILES_PER_RECEIPT,filePathParts,httpJson,httpError} from '../lib/core.js';
import {readRecord,listFiles} from '../lib/repo.js';
export default async function handler(req,res){
 try{
  if(req.method!=='POST')return httpJson(res,405,{error:'Método não permitido.'});
  mustBeReady();
  const reply=await handleUploadPresigned({
   body:req.body,request:req,
   getSignedToken:async(pathname,clientPayload)=>{
     let data;
     try{data=JSON.parse(clientPayload||'{}');}catch{throw new Error('Dados do convite inválidos.');}
     const parts=filePathParts(pathname);
     if(!parts || !validateInvite(data.invite,parts.id)||!isId(data.id)||data.id!==parts.id)throw new Error('Link de envio inválido.');
     const rec=await readRecord(parts.id);
     if(!rec || rec.closed || rec.expires<Date.now())throw new Error('Recebimento encerrado ou expirado.');
     if(!Number.isSafeInteger(data.size)||data.size<=0||data.size>MAX_FILE_BYTES)throw new Error('Arquivo excede o limite permitido.');
     const files=await listFiles(parts.id);
     if(files.length>=MAX_FILES_PER_RECEIPT)throw new Error('Limite de arquivos deste recebimento atingido.');
     const validUntil=Math.min(Date.now()+60*60000,rec.expires);
     const token=await issueSignedToken({
       pathname,operations:['put'],allowedContentTypes:ALLOWED_MIMES,
       maximumSizeInBytes:MAX_FILE_BYTES,validUntil
     });
     return {token,urlOptions:{
       allowedContentTypes:ALLOWED_MIMES,maximumSizeInBytes:MAX_FILE_BYTES,
       validUntil,addRandomSuffix:false,allowOverwrite:false
     }};
   },
   onUploadCompleted:async()=>{ // O arquivo já foi persistido pelo Blob e será listado pelo prefixo.
   }
  });
  return httpJson(res,200,reply);
 }catch(e){
  console.error('Falha no recebimento:',e?.message);
  return httpJson(res,400,{error:'Não foi possível autorizar esse envio. Verifique o link, o tipo ou o tamanho do arquivo.'});
 }
}
