// Development-only R2 adapter. Isolated from live storage and excluded from Git.
import{mkdir,writeFile,readFile,readdir}from'node:fs/promises';
import path from'node:path';
const root=new URL('../.sites-runtime/evidence/',import.meta.url).pathname;
const safe=key=>path.join(root,Buffer.from(key).toString('hex'));
export const BUCKET={async put(key,bytes,meta){await mkdir(root,{recursive:true});await writeFile(safe(key),bytes);await writeFile(safe(key)+'.json',JSON.stringify({key,size:bytes.length,uploaded:new Date().toISOString(),...meta}));},async get(key){try{const meta=JSON.parse(await readFile(safe(key)+'.json','utf8'));return {...meta,body:await readFile(safe(key))}}catch{return null}},async list({prefix,limit=100}){await mkdir(root,{recursive:true});const names=(await readdir(root)).filter(f=>f.endsWith('.json')),objects=[];for(const name of names){const meta=JSON.parse(await readFile(path.join(root,name),'utf8'));if(meta.key.startsWith(prefix))objects.push(meta)}return {objects:objects.slice(0,limit),truncated:objects.length>limit}}};
