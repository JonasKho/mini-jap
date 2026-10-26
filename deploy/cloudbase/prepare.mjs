import{readFile,writeFile,mkdir}from'node:fs/promises';
const base=new URL('../../',import.meta.url),out=new URL('./runtime/',import.meta.url);await mkdir(out,{recursive:true});
const source=await readFile(new URL('worker/api.js',base),'utf8');await writeFile(new URL('helpers.mjs',out),source+'\nexport {apiPayload,apiCanClose,apiSettings,apiReadJson,apiError,apiJson,apiText};\n');
const artwork=(await readFile(new URL('ui/assets/official-twinkle-avatar.png',base))).toString('base64');
const auth=(await readFile(new URL('worker/auth.js',base),'utf8')).replaceAll('__TWINKLE_AVATAR_DATA__','data:image/png;base64,'+artwork);await writeFile(new URL('auth.mjs',out),"import {handleApi} from '../api.mjs';import {apiError} from './helpers.mjs';\n"+auth);
console.log('Prepared CloudBase runtime; no credentials or production data included.');
