/* Recebe+ Ouvidoria v0.1: demonstração estática, SEM upload ou autenticação. */
window.RecebeDemo = (() => {
  'use strict';
  const KEY = 'recebe+demo-v01';
  const MAX_SESSIONS = 30;
  const allowedMinutes = new Set([30,120,480,1440]);
  function randomId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    const bytes = new Uint8Array(16); window.crypto.getRandomValues(bytes);
    return Array.from(bytes, a => a.toString(16).padStart(2, '0')).join('');
  }
  function load() {
    try {
      const val = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(val) ? val.filter(x => x && typeof x === 'object' && typeof x.id === 'string') : [];
    } catch { return []; }
  }
  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data.slice(0,MAX_SESSIONS))); return true; }
    catch { return false; }
  }
  function create(ref, minutes) {
    const expiry = allowedMinutes.has(Number(minutes)) ? Number(minutes) : 120;
    const list = load();
    const s = {id: randomId(), reference: String(ref || '').trim().slice(0,80), created: Date.now(), expires: Date.now() + expiry*60000, closed: false, simulated: []};
    list.unshift(s); save(list);
    return s;
  }
  function read(id) { return load().find(s => s.id === id) || null; }
  function update(id, change) {
    const list=load(); const i=list.findIndex(s=>s.id===id);
    if (i<0) return null;
    list[i]={...list[i],...change}; save(list); return list[i];
  }
  function state(s) { return s.closed ? 'Encerrado' : s.expires < Date.now() ? 'Expirado' : 'Ativo'; }
  function when(ts) { return new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(ts)); }
  function bytes(n) {
    if (!Number.isFinite(n)) return 'Tamanho indisponível';
    if(n<1024) return `${n} B`;
    let u=0; let x=n;
    while(x>=1024&&u<4){x/=1024;u++;}
    return `${x.toFixed(x>=10?0:1)} ${['B','KB','MB','GB','TB'][u]}`;
  }
  function link(s) {return `${location.origin}/enviar.html?demo=${encodeURIComponent(s.id)}&ate=${encodeURIComponent(s.expires)}`;}
  function el(tag,cls,text) {const n=document.createElement(tag); if(cls) n.className=cls; if(text!==undefined) n.textContent=text; return n;}
  function note(message, id='notice') { const n=document.getElementById(id); if(n){n.textContent=message;n.hidden=!message;} }
  async function copy(text) {
    try {await navigator.clipboard.writeText(text);return true;}
    catch { const ta=el('textarea'); ta.value=text; document.body.append(ta); ta.select(); const ok=document.execCommand('copy'); ta.remove(); return ok; }
  }
  return {load,save,create,read,update,state,when,bytes,link,el,note,copy,randomId};
})();
