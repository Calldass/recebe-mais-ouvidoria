(() => {
 'use strict';
 const D=window.RecebeDemo;
 const form=document.getElementById('new-receipt');
 const rows=document.getElementById('receipt-rows');
 const empty=document.getElementById('empty-receipts');
 const total=document.getElementById('total-receipts');
 const active=document.getElementById('active-receipts');
 function draw() {
   const list=D.load();
   rows.replaceChildren(); empty.hidden=list.length>0;
   total.textContent=list.length;
   active.textContent=list.filter(s=>D.state(s)==='Ativo').length;
   list.forEach(s=>{
     const r=D.el('tr');
     const name=D.el('td'); const b=D.el('strong','reference',s.reference||'Recebimento sem referência');
     name.append(b,D.el('div','small-muted',`Código ${s.id.slice(0,8)}`));
     r.append(name,D.el('td','date-cell',D.when(s.created)),D.el('td','date-cell',D.when(s.expires)));
     const status=D.el('td'); status.append(D.el('span','status-pill '+(D.state(s)==='Ativo'?'success':'neutral'),D.state(s)));
     const open=D.el('td'); const a=D.el('a','action-link','Ver QR Code →'); a.href=`/recebimento.html?id=${encodeURIComponent(s.id)}`;open.append(a);
     r.append(status,open); rows.append(r);
   });
 }
 form.addEventListener('submit',e=>{
   e.preventDefault();
   const ref=document.getElementById('reference').value;
   const ttl=document.getElementById('ttl').value;
   const s=D.create(ref,ttl);
   location.href=`/recebimento.html?id=${encodeURIComponent(s.id)}`;
 });
 const clear=document.getElementById('reset-demo');
 clear.addEventListener('click',()=>{
   if(!window.confirm('Apagar apenas os dados de demonstração deste navegador?')) return;
   D.save([]);draw();D.note('Histórico de demonstração limpo.');
 });
 draw();
})();
