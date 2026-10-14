(() => {
 'use strict';
 const D=window.RecebeDemo;
 const qs=new URLSearchParams(location.search);
 const id=qs.get('demo'), expires=Number(qs.get('ate'));
 const invalid=!(id && /^[0-9a-f-]{20,50}$/i.test(id) && Number.isSafeInteger(expires) && expires>Date.now());
 const unavailable=document.getElementById('invalid-link');
 const form=document.getElementById('preview-upload');
 const welcome=document.getElementById('upload-welcome');
 if(invalid){form.hidden=true;welcome.hidden=true;unavailable.hidden=false;return;}
 const date=new Date(expires);
 document.getElementById('deadline').textContent=D.when(date.getTime());
 const input=document.getElementById('file-input');
 const drop=document.getElementById('drop-zone');
 const items=document.getElementById('selected-files');
 const send=document.getElementById('simulate-send');
 const result=document.getElementById('simulation-result');
 let files=[];
 function change(next){
   files=Array.from(next||[]).slice(0,10);
   items.replaceChildren();
   files.forEach(f=>{
     const r=D.el('div','selected-item');r.append(D.el('span','',f.name),D.el('small','',D.bytes(f.size)));items.append(r);
   });
   send.disabled=files.length===0;result.hidden=true;
 }
 drop.addEventListener('click',e=>{if(e.target!==input)input.click();});
 drop.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.click();}});
 input.addEventListener('change',()=>change(input.files));
 drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('dragging');});
 drop.addEventListener('dragleave',()=>drop.classList.remove('dragging'));
 drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('dragging');change(e.dataTransfer.files);});
 send.addEventListener('click',()=>{
   if(!files.length)return;
   if(expires<=Date.now()) {result.hidden=false;result.textContent='O prazo deste link terminou. Solicite outro link para continuar o teste.';send.disabled=true;return;}
   result.hidden=false;
   result.textContent=`Simulação concluída: ${files.length} arquivo(s) selecionado(s). Nenhum arquivo foi enviado, transmitido ou armazenado.`;
   result.className='alert info small-alert';
   // Intencionalmente NÃO usamos FileReader, FormData, fetch, XMLHttpRequest ou upload.
 });
})();
