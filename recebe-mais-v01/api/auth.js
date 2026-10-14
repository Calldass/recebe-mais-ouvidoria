import {mustBeReady,httpJson,httpError,requireSameOrigin} from '../lib/core.js';
import {correctPassword,loggedIn,staffCookie,clearCookie} from '../lib/auth.js';
export default async function handler(req,res){
  try{
    if(req.method==='GET') return httpJson(res,200,{authenticated:loggedIn(req),configured:!!(process.env.STAFF_PASSWORD&&process.env.APP_SECRET&&(process.env.BLOB_STORE_ID||process.env.BLOB_READ_WRITE_TOKEN))});
    requireSameOrigin(req);mustBeReady();
    if(req.method==='POST'){
      const {password}=req.body||{};
      if(!correctPassword(password)) throw Object.assign(new Error('Senha incorreta.'),{status:401});
      res.setHeader('Set-Cookie',staffCookie(req));return httpJson(res,200,{ok:true});
    }
    if(req.method==='DELETE') {res.setHeader('Set-Cookie',clearCookie(req));return httpJson(res,200,{ok:true});}
    return httpJson(res,405,{error:'Método não permitido.'});
  }catch(err){return httpError(res,err);}
}
