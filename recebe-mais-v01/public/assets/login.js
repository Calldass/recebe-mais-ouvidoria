(async()=>{
'use strict';const R=window.Recebe;
try{const st=await R.api('/api/auth');if(st.authenticated){location.replace('/');return;}if(!st.configured)R.msg('A configuração de armazenamento e senhas ainda não foi concluída na Vercel.','warning');}catch{}
const f=document.getElementById('login');f.addEventListener('submit',async e=>{
e.preventDefault();const b=f.querySelector('button');b.disabled=true;R.msg('');
try{await R.api('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:document.getElementById('password').value})});location.replace('/');}
catch(err){R.msg(err.message,'danger');b.disabled=false;}
});
})();
