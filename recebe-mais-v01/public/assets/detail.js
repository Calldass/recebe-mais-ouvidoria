(async()=>{
'use strict';const R=window.Recebe;if(!await R.staff())return;
document.getElementById('logout').addEventListener('click',R.logout);
const id=new URLSearchParams(location.search).get('id');if(!id){R.msg('Código de recebimento ausente.','warning');return;}
const list=document.getElementById('received-files');let refreshTimer;
async function refresh(){
try{
 const {receipt:r,invite,files}=await R.api(`/api/receipt?id=${encodeURIComponent(id)}`);
 const link=R.publicLink(invite);
 document.getElementById('reference-title').textContent=r.reference||'Sem referência';
 document.getElementById('receipt-id').textContent=r.id.slice(0,8);
 document.getElementById('created-at').textContent=R.fmtDate(r.created);
 document.getElementById('expires-at').textContent=R.fmtDate(r.expires);
 document.getElementById('public-link').value=link;
 const status=R.state(r),s=document.getElementById('receipt-status');s.textContent=status;s.className=`status-pill ${status==='Ativo'?'success':'neutral'}`;
 document.getElementById('close-btn').disabled=Boolean(r.closed);
 try{document.getElementById('qr-image').innerHTML=window.RecebeQR.svg(link,248);}catch{document.getElementById('qr-image').textContent='QR Code indisponível.';}
 document.getElementById('copy-link').onclick=async()=>R.msg(await R.copy(link)?'Link público copiado.':'Selecione o link e copie manualmente.');
 document.getElementById('file-count').textContent=files.length;list.replaceChildren();
 document.getElementById('files-empty').hidden=files.length>0;
 for(const f of files){const row=R.el('div','file-row');row.append(R.el('div','file-type','ARQ'));
 const info=R.el('div','file-info');info.append(R.el('div','file-name',f.name),R.el('div','small-muted',`${R.bytes(f.size)} · ${R.fmtDate(f.uploadedAt)}`));row.append(info);
 const button=R.el('button','btn btn-download','Baixar');button.type='button';button.onclick=async()=>{
 button.disabled=true;const tab=window.open('about:blank','_blank');try{const data=await R.api(`/api/download?id=${encodeURIComponent(id)}&path=${encodeURIComponent(f.pathname)}`);if(tab){tab.opener=null;tab.location.replace(data.url);}else{location.assign(data.url);}}
 catch(err){if(tab)tab.close();R.msg('Falha no download: '+err.message,'danger');}finally{button.disabled=false;}
 };row.append(button);list.append(row);
 }
}catch(err){R.msg(err.message,'danger');}
}
document.getElementById('close-btn').addEventListener('click',async()=>{
if(!confirm('Encerrar este link de recebimento? Novos envios não serão autorizados.'))return;
try{await R.api(`/api/receipt?id=${encodeURIComponent(id)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'close'})});await refresh();R.msg('Link encerrado.');}catch(err){R.msg(err.message,'danger');}
});
document.getElementById('refresh').addEventListener('click',refresh);
await refresh();refreshTimer=setInterval(()=>{if(!document.hidden)refresh();},15000);
window.addEventListener('pagehide',()=>clearInterval(refreshTimer));
})();
