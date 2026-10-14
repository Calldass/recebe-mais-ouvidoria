import {put,get,list,del} from '@vercel/blob';
import {isId} from './core.js';
const path=id=>`receipts/${id}.json`;
export async function readRecord(id){
  if(!isId(id)) return null;
  const result=await get(path(id),{access:'private'});
  if(!result || result.statusCode!==200 || !result.stream) return null;
  const value=await new Response(result.stream).json();
  return value;
}
export async function saveRecord(record){
  await put(path(record.id),JSON.stringify(record),{access:'private',contentType:'application/json',allowOverwrite:true});
}
export async function listFiles(id){
  const found=[];let cursor;
  do{
    const result=await list({prefix:`uploads/${id}/`,limit:100,cursor});
    found.push(...result.blobs.map(b=>({pathname:b.pathname,name:b.pathname.split('/').pop(),size:b.size,uploadedAt:b.uploadedAt})));
    cursor=result.hasMore?result.cursor:undefined;
  }while(cursor && found.length<500);
  return found;
}
export async function listReceipts(){
  const result=await list({prefix:'receipts/',limit:120});
  const sorted=result.blobs.sort((a,b)=>String(b.pathname).localeCompare(String(a.pathname))).slice(0,75);
  const out=[];
  for(let i=0;i<sorted.length;i+=8){
    const group=await Promise.all(sorted.slice(i,i+8).map(async b=>{
      const id=b.pathname.split('/').at(-1)?.replace(/\.json$/,'');return await readRecord(id);
    }));out.push(...group.filter(Boolean));
  }
  return out.sort((a,b)=>b.created-a.created);
}
export async function deleteExpired(retentionDays=3){
  const threshold=Date.now()-retentionDays*86400000;
  let cursor;let removed=0;
  do{
    const batch=await list({prefix:'receipts/',limit:100,cursor});
    cursor=batch.hasMore?batch.cursor:undefined;
    for(const blob of batch.blobs){
      const id=blob.pathname.split('/').at(-1)?.replace(/\.json$/,'');
      const rec=await readRecord(id);
      if(!rec || rec.expires>=threshold) continue;
      const files=await listFiles(id);
      if(files.length) await del(files.map(f=>f.pathname));
      await del(blob.pathname);
      removed++;
    }
  }while(cursor && removed<500);
  return removed;
}
