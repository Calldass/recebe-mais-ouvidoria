(async()=>{
'use strict';const R=window.Recebe;if(!await R.staff())return;
document.getElementById('logout').addEventListener('click',R.logout);
const rows=document.getElementById('receipt-rows'),empty=document.getElementById('empty-receipts');
async function draw(){
 try{const list=(await R.api('/api/receipts')).receipts;
 rows.replaceChildren();empty.hidden=list.length>0;
 document.getElementById('total-receipts').textContent=list.length;
 document.getElementById('active-receipts').textContent=list.filter(s=>R.state(s)==='Ativo').length;
 list.forEach(s=>{
 const tr=R.el('tr');const name=R.el('td');name.append(R.el('strong','',s.reference||'Sem referência'),R.el('div','small-muted',`Código ${s.id.slice(0,8)}`));
 tr.append(name,R.el('td','date-cell',R.fmtDate(s.created)),R.el('td','date-cell',R.fmtDate(s.expires)));
 const st=R.state(s),td=R.el('td');td.append(R.el('span',`status-pill ${st==='Ativo'?'success':'neutral'}`,st));tr.append(td);
 const tdLink=R.el('td'),a=R.el('a','action-link','Ver recebimento →');a.href=`/recebimento.html?id=${encodeURIComponent(s.id)}`;tdLink.append(a);tr.append(tdLink);rows.append(tr);
 });
 }catch(err){R.msg('Não foi possível carregar os recebimentos: '+err.message,'danger');}
}
document.getElementById('new-receipt').addEventListener('submit',async e=>{
 e.preventDefault();const submit=e.target.querySelector('button[type=submit]');submit.disabled=true;
 try{const data=await R.api('/api/receipts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reference:document.getElementById('reference').value,ttl:Number(document.getElementById('ttl').value)})});location.href=`/recebimento.html?id=${data.receipt.id}`;}
 catch(err){R.msg(err.message,'danger');submit.disabled=false;}
});
await draw();
})();
