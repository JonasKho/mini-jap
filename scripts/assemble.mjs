import {readFile,writeFile} from 'node:fs/promises';
const assets={};for(const [file,type]of Object.entries({'index.html':'text/html; charset=utf-8','style.css':'text/css; charset=utf-8','core.js':'text/javascript; charset=utf-8','app.js':'text/javascript; charset=utf-8','stars.js':'text/javascript; charset=utf-8','exports.js':'text/javascript; charset=utf-8','workspace.js':'text/javascript; charset=utf-8'})){assets['/'+file]={body:await readFile(new URL('../ui/'+file,import.meta.url),'utf8'),type};}
const artwork=(await readFile(new URL('../ui/assets/official-twinkle-avatar.png',import.meta.url))).toString('base64');
assets['/twinkle.png']={body:artwork,type:'image/png',encoding:'base64'};
const api=await readFile(new URL('../worker/api.js',import.meta.url),'utf8');
const auth=(await readFile(new URL('../worker/auth.js',import.meta.url),'utf8')).replace('export default function createWorker','function createWorker').replaceAll('__TWINKLE_AVATAR_DATA__','data:image/png;base64,'+artwork);await writeFile(new URL('../worker/index.js',import.meta.url),api+'\n'+auth+'\nexport default createWorker('+JSON.stringify(assets)+');\n');
console.log('Assembled protected Worker application.');
