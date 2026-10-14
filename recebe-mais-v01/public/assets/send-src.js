import {upload} from '@vercel/blob/client';
(async()=>{
'use strict';const R=window.Recebe;
const invite=new URLSearchParams(location.search).get('convite');
const invalid=document.getElementById('invalid-link'),area=document.getElementById('preview-upload'),btn=document.getElementById('send-files'),progress=document.getElementById('progress');
let id=null,files=[],max=0,remaining=0;
function fail(message){invalid.hidden=false;invalid.querySelector('p').textContent=message;area.hidden=true;}
if(!invite || invite.length>2500){fail('Link ausente. Solicite ao atendente um novo QR Code.');return;}
try{
 const raw=invite.split('.')[0];const parsed=JSON.parse(atob(raw.replace(/-/g,'+').replace(/_/g,'/')));
 id=parsed.id;
 const st=await R.api('/api/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,invite})});
 document.getElementById('deadline').textContent=R.fmtDate(st.expires);
 max=st.maxFileBytes;remaining=st.remaining;
 if(remaining===0){fail('O limite de arquivos deste recebimento foi atingido.');return;}
 document.getElementById('limit').textContent=`Até ${R.bytes(max)} por arquivo · até ${remaining} arquivo(s) neste recebimento`;
}catch(err){fail(err.message||'Link inválido ou expirado.');return;}
const input=document.getElementById('file-input'),drop=document.getElementById('drop-zone'),items=document.getElementById('selected-files');
const exts=new Set(['mp4','mov','m4v','webm','avi','jpg','jpeg','png','heic','heif','mp3','m4a','wav','ogg','pdf']);
function change(selected){
 files=Array.from(selected||[]).slice(0,remaining);items.replaceChildren();
 for(const file of files){const n=R.el('div','selected-item');n.append(R.el('span','',file.name),R.el('small','',R.bytes(file.size)));items.append(n);}
 btn.disabled=!files.length;
}
input.addEventListener('change',()=>change(input.files));
drop.addEventListener('click',e=>{if(e.target!==input)input.click();});
drop.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.click();}});
drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('dragging');});
drop.addEventListener('dragleave',()=>drop.classList.remove('dragging'));
drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('dragging');change(e.dataTransfer.files);});
btn.addEventListener('click',async()=>{
 btn.disabled=true;let completed=0;
 for(const file of files){
  const ext=(file.name.split('.').pop()||'').toLowerCase();
  if(!exts.has(ext) || file.size<1 || file.size>max){R.msg(`Arquivo ${file.name}: formato ou tamanho não permitido.`,'danger','result');break;}
  const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(-125);
  const pathname=`uploads/${id}/${crypto.randomUUID()}/${safeName}`;
  try{
    document.getElementById('current-file').textContent=`Enviando: ${file.name}`;
    progress.value=0;progress.hidden=false;
    await upload(pathname,file,{
      access:'private',multipart:true,contentType:file.type||'application/octet-stream',handleUploadUrl:'/api/upload',
      clientPayload:JSON.stringify({id,invite,size:file.size}),onUploadProgress:e=>{progress.value=Math.round(e.percentage);document.getElementById('progress-label').textContent=`${Math.round(e.percentage)}%`;}
    });
    completed++;R.msg(`${completed} arquivo(s) enviado(s) com sucesso.`, 'info','result');
  }catch(err){R.msg(`Não foi possível enviar ${file.name}: ${err.message}. Tente novamente enquanto o link estiver válido.`, 'danger','result');break;}
 }
 if(completed===files.length && completed>0){document.getElementById('current-file').textContent='Envio concluído. O atendente já pode consultar os anexos.';}
 files=[];input.value='';btn.disabled=true;items.replaceChildren();
});
})();
