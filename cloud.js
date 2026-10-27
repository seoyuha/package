(function(){
const cfg=()=>window.HUB_CLOUD_CONFIG||{};
const configured=()=>/^https:\/\//.test(cfg().url||'') && !!cfg().anonKey;
let token=null;
function headers(extra={}){return {'apikey':cfg().anonKey,...(token?.access_token?{'Authorization':'Bearer '+token.access_token}:{}),...extra}}
async function call(path,method='GET',body,extraHeaders={}){
const r=await fetch(cfg().url.replace(/\/$/,'')+path,{method,headers:headers({...body?{'Content-Type':'application/json'}:{},...extraHeaders}),body:body?JSON.stringify(body):undefined});
if(!r.ok){let e=await r.text();throw Error(e.slice(0,300))}if(r.status===204)return null;let s=await r.text();return s?JSON.parse(s):null}
function toGame(r){return {id:r.id,name:r.name,desc:r.description||'',category:r.category,unit:r.unit,url:r.student_url,teacher:r.teacher_url||'',img:r.image_url||''}}
function toRow(g,i){return {id:g.id,position:i,name:g.name,description:g.desc||'',category:g.category||'종합',unit:g.unit||'전단원',student_url:g.url,teacher_url:g.teacher||'',image_url:g.img||''}}
async function login(email,password){token=await call('/auth/v1/token?grant_type=password','POST',{email,password});return token}
async function load(){return (await call('/rest/v1/hub_games?select=*&order=position.asc')).map(toGame)}
async function uploadData(data){let b=await(await fetch(data)).blob();if(b.size>4194304)throw Error('이미지가 4MB를 초과합니다');let name='hub-'+Date.now()+'-'+Math.random().toString(36).slice(2)+'.webp';let base=cfg().url.replace(/\/$/,'');let resp=await fetch(base+'/storage/v1/object/hub-images/'+name,{method:'POST',headers:headers({'Content-Type':'image/webp'}),body:b});if(!resp.ok)throw Error(await resp.text());return base+'/storage/v1/object/public/hub-images/'+name}
async function replaceAll(items){if(!token)throw Error('관리자 로그인 필요');let original=await load(), desired=new Set(items.map(g=>g.id));let prepared=[];
for(let i=0;i<items.length;i++){let g={...items[i]};if(g.img?.startsWith('data:'))g.img=await uploadData(g.img);prepared.push(toRow(g,i))}
if(prepared.length)await call('/rest/v1/hub_games?on_conflict=id','POST',prepared,{'Prefer':'resolution=merge-duplicates,return=minimal'});
for(const old of original){if(!desired.has(old.id))await call('/rest/v1/hub_games?id=eq.'+encodeURIComponent(old.id),'DELETE')}
return prepared.map(toGame)}
window.HubCloud={configured,login,load,replaceAll,session:()=>!!token,logout:()=>{token=null}};
})();