/* Recebe+ v0.2: interface de teste. Dados e credenciais não são guardados no navegador. */
window.Recebe = (()=>{
'use strict';
const PROD='https://recebe-mais-ouvidoria.vercel.app';
const origin=()=>location.hostname.endsWith('.vercel.app')?PROD:location.origin;
const publicLink=(invite)=>`${origin()}/enviar.html?convite=${encodeURIComponent(invite)}`;
const fmtDate=n=>new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(n));
function bytes(n){let unit=0,x=n;while(x>=1024&&unit<4){x/=1024;unit++;}return `${x.toFixed(x>=10?0:1)} ${['B','KB','MB','GB','TB'][unit]}`;}
function el(tag,cls,content){const t=document.createElement(tag);if(cls)t.className=cls;if(content!==undefined)t.textContent=content;return t;}
async function api(path,options={}){
 const response=await fetch(path,{credentials:'same-origin',cache:'no-store',...options});
 let data;try{data=await response.json();}catch{throw new Error('Resposta inesperada do servidor.');}
 if(!response.ok){const err=new Error(data.error||`Falha HTTP ${response.status}`);err.status=response.status;throw err;}
 return data;
}
function msg(value,kind='info',target='notice') {const n=document.getElementById(target);if(!n)return;n.hidden=!value;n.className=`alert ${kind}`;n.textContent=value;}
async function staff(){try{const r=await api('/api/auth');if(!r.authenticated) location.replace('/entrar.html');return r.authenticated;}catch{location.replace('/entrar.html');return false;}}
function state(s){return s.closed?'Encerrado':s.expires<=Date.now()?'Expirado':'Ativo';}
async function copy(value){try{await navigator.clipboard.writeText(value);return true;}catch{return false;}}
async function logout(){await api('/api/auth',{method:'DELETE'});location.replace('/entrar.html');}
return {origin,publicLink,fmtDate,bytes,el,api,msg,staff,state,copy,logout};
})();
