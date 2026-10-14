import test from 'node:test';
import assert from 'node:assert/strict';
import {sign,verify,validateInvite,filePathParts,fileNameAllowed,isId,VALID_MINUTES} from '../lib/core.js';
process.env.APP_SECRET='not-a-production-secret-for-testing-only-123456';
const id='2a5b3a30-c200-4d4a-a8b6-e236ad17babc';
test('Gera convite assinado e rejeita adulteração',()=>{
 const token=sign({k:'invite',id,exp:Date.now()+120000});
 assert.equal(validateInvite(token,id),true);
 assert.equal(validateInvite(token,id.replace('2a','3a')),false);
 assert.equal(validateInvite(token.slice(0,-3)+'abc',id),false);
});
test('Não aceita links vencidos',()=>{
 const token=sign({k:'invite',id,exp:Date.now()-1000});
 assert.equal(verify(token),null);
});
test('Rejeita nomes de arquivo perigosos e caminhos fora do escopo',()=>{
 const valid=`uploads/${id}/f72c3eac-6109-4262-9b9d-d6c9630f411c/video.mp4`;
 assert.deepEqual(filePathParts(valid),{id,name:'video.mp4'});
 assert.equal(filePathParts(`uploads/${id}/f72c3eac-6109-4262-9b9d-d6c9630f411c/../../private.txt`),null);
 assert.equal(fileNameAllowed('arquivo.exe'),false);
 assert.equal(fileNameAllowed('video.mp4'),true);
 assert.equal(isId(id),true);
 assert.equal(VALID_MINUTES.has(120),true);
});
