import {envReady,httpJson} from '../lib/core.js';
export default function handler(req,res){return httpJson(res,200,{status:envReady()?'configured':'pending',version:'0.2.1-oidc-test'});}
