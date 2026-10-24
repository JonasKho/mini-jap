import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';import{readFile,readdir}from'node:fs/promises';
const db=new DatabaseSync(':memory:');for(const file of(await readdir(new URL('../drizzle/',import.meta.url))).filter(f=>f.endsWith('.sql')))db.exec(await readFile(new URL('../drizzle/'+file,import.meta.url),'utf8'));
function binding(database){return{prepare(sql){let args=[];return{bind(...x){args=x;return this},async first(){return database.prepare(sql).get(...args)||null},async all(){return{results:database.prepare(sql).all(...args)}},async run(){return database.prepare(sql).run(...args)}}}}}
const source=await readFile(new URL('../worker/api.js',import.meta.url),'utf8'),{handleApi}=await import('data:text/javascript;base64,'+Buffer.from(source+'\nexport {handleApi};').toString('base64'));
const env={LOGIN_EMAIL:'fixture@example.test',DB:binding(db)},base='https://example.test';
async function call(path,body,who=env){const response=await handleApi(new Request(base+'/api'+path,{method:body?'PUT':'GET',headers:body?{Origin:base,'Content-Type':'application/json'}:{},...(body?{body:JSON.stringify(body)}:{})}),who);return{status:response.status,value:await response.json()}}
assert.equal((await call('/config')).value.translationReady,false);
const id='11111111-1111-4111-8111-111111111111',payload={common:{customer:'ABC客户',order:'PO%_01',product:'彩盒'},mail:{original:'测试客诉'},report:{},drafts:{mail:{subject:'クレーム－ABC',body:'原始草稿',warnings:[]}},files:['photo.jpg'],checks:{}};
let r=await call('/cases/'+id,{version:0,status:'draft',payload});assert.equal(r.status,200);assert.equal(r.value.version,1);
r=await call('/cases?q=ABC');assert.equal(r.value.items.length,1);assert.equal((await call('/cases?q=%25_')).value.items.length,1);assert.equal((await call('/cases?q=doesnotexist')).value.items.length,0);
r=await call('/cases/'+id);assert.equal(r.value.payload.drafts.mail.body,'原始草稿');assert.deepEqual(r.value.payload.files,['photo.jpg']);assert.equal((await call('/cases/'+id,undefined,{...env,LOGIN_EMAIL:'other@example.test'})).status,404);
assert.equal((await call('/cases/'+id,{version:1,status:'in_progress',payload})).status,200);assert.equal((await call('/cases/'+id,{version:1,status:'draft',payload})).status,409);assert.equal((await call('/cases/'+id,{version:2,status:'closed',payload})).status,422);
r=await call('/settings',{version:0,terms:[{zh:'彩盒',ja:'化粧箱',approved:true}],reference:'関係各位'});assert.equal(r.status,200);assert.equal((await call('/settings')).value.terms[0].ja,'化粧箱');assert.equal((await call('/settings',{version:0,terms:[]})).status,409);
const translate=await handleApi(new Request(base+'/api/translate',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({source:'补货200个'})}),env);assert.equal(translate.status,503);
const cross=await handleApi(new Request(base+'/api/cases/'+id,{method:'PUT',headers:{Origin:'https://evil.test','Content-Type':'application/json'},body:'{}'}),env);assert.equal(cross.status,403);
const loaded=await call('/cases/'+id);assert.equal(loaded.value.version,2);assert.equal(loaded.value.status,'in_progress');
console.log('API checks passed: schema migrations, case search including literal wildcards, durable payloads, account isolation, optimistic conflicts, closure guards, glossary versions, missing AI and CSRF.');
