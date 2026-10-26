import{createHash}from'node:crypto';
const accountId=a=>createHash('sha256').update(a).digest('hex');
const C={cases:'meilin_cases',versions:'meilin_versions',settings:'meilin_settings',evidence:'meilin_evidence'};
const first=r=>Array.isArray(r.data)?r.data[0]||null:r.data||null;
export function cloudStore(db){
const get=async(c,id,context=db)=>first(await context.collection(C[c]).doc(id).get());
async function list(c,account,extra={}){const rows=[];for(let offset=0;offset<1000;offset+=100){let q=db.collection(C[c]).where({account,...extra});if(c==='cases')q=q.field({payload:false});const r=await q.orderBy('updatedAt','desc').skip(offset).limit(100).get();rows.push(...r.data);if(r.data.length<100)break;}return rows;}
return {
 async getCase(id,account){const r=await get('cases',id);return r?.account===account?r:null},
 listCases:account=>list('cases',account),
 async saveCase(id,account,version,value){return db.runTransaction(async tx=>{const old=await get('cases',id,tx);if(old?(old.account!==account||old.version!==version):version!==0)return null;const now=new Date().toISOString(),next={...value,id,account,version:version+1,createdAt:old?.createdAt||now,updatedAt:now,evidenceCount:old?.evidenceCount||0};await tx.collection(C.cases).doc(id).set(next);await tx.collection(C.versions).doc(id+'_'+next.version).set({caseId:id,account,version:next.version,status:next.status,payload:next.payload,actor:next.payload.common.editorName||'未填写',createdAt:now,updatedAt:now});return next;})},
 async versions(id,account){return (await list('versions',account,{caseId:id})).sort((a,b)=>b.version-a.version).slice(0,50)},
 async getSettings(account){return await get('settings',accountId(account))||{terms:[],reference:'',version:0}},
 async saveSettings(account,version,value){return db.runTransaction(async tx=>{const old=await get('settings',accountId(account),tx);if((old?.version||0)!==version)return null;const next={...value,account,version:version+1,updatedAt:new Date().toISOString()};await tx.collection(C.settings).doc(accountId(account)).set(next);return next;})},
 async listEvidence(id,account){return list('evidence',account,{caseId:id})},
 async getEvidence(id,account){const r=await get('evidence',id);return r?.account===account?r:null},
 async reserveEvidence(id,account,delta){return db.runTransaction(async tx=>{const old=await get('cases',id,tx);if(!old||old.account!==account||(delta>0&&(old.evidenceCount||0)>=30))return false;await tx.collection(C.cases).doc(id).update({evidenceCount:Math.max(0,(old.evidenceCount||0)+delta)});return true;})},
 async putEvidence(value){await db.collection(C.evidence).doc(value.id).set(value)},
};}
