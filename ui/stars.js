(function(root){
const messages=[
{ja:'お疲れ様です。少し休憩しませんか。',zh:'辛苦啦，要不要稍微休息一下？'},
{ja:'応援しています。ご自分のペースで進めてくださいね。',zh:'星星在为你加油，按自己的节奏慢慢来吧。'},
{ja:'お疲れ様です。お水を飲んで、ひと息つきませんか。',zh:'辛苦啦，喝点水，歇口气吧。'},
{ja:'今日もよく頑張っていますね。どうぞご無理なさらないでください。',zh:'今天也很努力呢，请不要太勉强自己。'},
{ja:'一つずつ進めていきましょう。いつも応援しています。',zh:'一件一件慢慢完成，星星一直为你加油。'}
];
function createProgress(saved={},random=Math.random){
const safe=Number.isSafeInteger(saved.total)&&saved.total>=0?saved.total:0;
const gap=()=>random()<.5?2:3;
let state={total:safe,remaining:[1,2,3].includes(saved.remaining)?saved.remaining:gap(),muted:saved.muted===true};
const seen=new Set();
return {getState:()=>({...state}),mute(value){state.muted=!!value;},record(key,{eligible=true,sample=false}={}){if(!eligible||sample||!key||seen.has(key))return {counted:false,celebrate:false,...state};seen.add(key);state.total++;state.remaining--;const celebrate=state.remaining===0&&!state.muted;if(state.remaining===0)state.remaining=gap();return {counted:true,celebrate,...state};}};
}
root.StarCompanion={messages,createProgress};if(typeof module!=='undefined')module.exports={messages,createProgress};
})(typeof window!=='undefined'?window:globalThis);
