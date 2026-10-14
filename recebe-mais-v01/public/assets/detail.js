(() => {
 'use strict';
 const D=window.RecebeDemo;
 const id=new URLSearchParams(location.search).get('id');
 const error=document.getElementById('not-found');
 const pane=document.getElementById('session-view');
 let s=D.read(id);
 if(!s){error.hidden=false;pane.hidden=true;return;}
 const url=D.link(s);
 document.getElementById('reference-title').textContent=s.reference||'Recebimento sem referência';
 document.getElementById('receipt-id').textContent=s.id.slice(0,8);
 document.getElementById('created-at').textContent=D.when(s.created);
 document.getElementById('expires-at').textContent=D.when(s.expires);
 const status=document.getElementById('receipt-status');
 const input=document.getElementById('public-link'); input.value=url;
 const qr=document.getElementById('qr-image');
 try{qr.innerHTML=window.RecebeQR.svg(url,248);} catch(e){qr.textContent='Não foi possível gerar o QR Code.';}
 function render(){
   s=D.read(id);if(!s)return;
   const st=D.state(s);status.textContent=st;status.className='status-pill '+(st==='Ativo'?'success':'neutral');
   document.getElementById('simulate-btn').disabled=(st!=='Ativo');
   document.getElementById('close-btn').disabled=s.closed;
   const list=document.getElementById('simulated-files');list.replaceChildren();
   const docs=Array.isArray(s.simulated)?s.simulated:[];
   document.getElementById('file-count').textContent=String(docs.length);
   document.getElementById('files-empty').hidden=docs.length>0;
   docs.forEach(f=>{
     const row=D.el('div','file-row');
     row.append(D.el('div','file-type','DEMO'));
     const info=D.el('div','file-info');info.append(D.el('div','file-name',f.name),D.el('div','small-muted',`Simulação · ${D.when(f.time)}`));
     row.append(info,D.el('span','status-pill waiting','Exemplo visual'));list.append(row);
   });
 }
 document.getElementById('copy-link').addEventListener('click',async()=>{
   const ok=await D.copy(url);
   D.note(ok?'Link copiado. Pode abrir no celular, mas não recebe arquivos de verdade.':'Selecione o endereço e use Ctrl+C.');
 });
 document.getElementById('simulate-btn').addEventListener('click',()=>{
   const next=[...(s.simulated||[]),{name:`arquivo-exemplo-${(s.simulated||[]).length+1}.mp4`,time:Date.now()}];
   D.update(id,{simulated:next});render();D.note('Anexo fictício adicionado somente neste navegador.');
 });
 document.getElementById('close-btn').addEventListener('click',()=>{
   if(!confirm('Encerrar este recebimento de demonstração neste navegador?'))return;
   D.update(id,{closed:true});render();D.note('Recebimento encerrado apenas neste navegador.');
 });
 render();
})();
