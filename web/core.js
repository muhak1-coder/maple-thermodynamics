export const STORAGE_KEY='maple-thermo:regional-1.0:progress';
export const blankProgress=()=>({version:1,completed:[],bookmarks:[],recent:[],mastery:{},drafts:{},attempts:[],future:{}});
export function finite(value){return typeof value==='number'?Number.isFinite(value):typeof value==='string'&&/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim())&&Number.isFinite(Number(value));}
export function responseStatus(q,r={}){
 const fields=q.response_fields||[];
 const missing=[];
 if(q.choices?.length&&!q.choices.some(c=>(typeof c==='object'?c.id:c)===r.choice))missing.push('choice');
 for(const f of fields)if(!finite(r[f.id]))missing.push(f.label||f.id);
 if((q.requires_reasoning||(!fields.length&&!q.choices?.length))&&!r.reasoning?.trim())missing.push('written response');
 return {complete:missing.length===0,missing};
}
export function exportResponses(a,rs,attemptId){
 if(!a.id.startsWith('T'))return {schema_version:'maple-worksheet-response-1',assessment_id:a.id,attempt_id:attemptId,responses:rs};
 return {schema_version:'1.0.0',release:'REGIONAL WEBSITE RELEASE 1.0',assessment_id:a.id,attempt_id:attemptId,responses:a.questions.map(q=>{const r=rs[q.id]||{},out={question_id:q.id};if(r.choice)out.selected_choice_id=r.choice;if(r.reasoning)out.reasoning=r.reasoning;const numeric={};for(const f of q.response_fields||[]){if(r[f.id]?.trim()){if(!finite(r[f.id]))throw Error('Correct the numeric format for '+q.id+' / '+f.id+' before exporting. Your draft is still saved.');numeric[f.id]=Number(r[f.id]);}}if(Object.keys(numeric).length)out.numeric_values=numeric;return out;})};
}
export function validateProgress(input,data){
 const fail=message=>{throw Error(message);};
 const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&[Object.prototype,null].includes(Object.getPrototypeOf(x));
 const shape=(x,keys)=>{if(!object(x)||Object.keys(x).some(k=>!keys.includes(k)))fail('Invalid progress record shape.');};
 // Bound the entire tree, including future data; never retain arbitrary imported objects.
 const stack=[[input,0]],seen=new WeakSet();let nodes=0;
 while(stack.length){const [v,depth]=stack.pop();if(++nodes>100000||depth>16)fail('Progress data is too complex.');if(v&&typeof v==='object'){if(seen.has(v))fail('Circular progress data.');seen.add(v);for(const[k,x]of Object.entries(v)){if(['__proto__','constructor','prototype'].includes(k))fail('Unsafe import key.');stack.push([x,depth+1]);}}}
 shape(input,['version','completed','bookmarks','recent','mastery','drafts','attempts','future']);
 if(input.version!==1)fail('Unsupported progress version. Use a version 1 academy export.');
 if(JSON.stringify(input).length>5_000_000)fail('Progress exceeds the 5 MB limit.');
 const future=input.future??{};shape(future,['completed','bookmarks','recent','mastery','drafts','attempts']);
 const known=new Set(data.chapters.map(c=>c.id)),assessments=new Map(data.assessments.map(a=>[a.id,a])),p=blankProgress();
 const chapter=id=>typeof id==='string'&&/^U[1-9]\d*-C\d{2,3}$/.test(id)&&id.length<=30;
 const assessment=id=>typeof id==='string'&&/^(WS|T|D|QZ)\d{2,3}$/.test(id);
 const array=(x,max)=>{if(!Array.isArray(x)||x.length>max)fail('Invalid progress list.');return x;};
 for(const k of ['completed','bookmarks','recent']){
  const values=[...array(input[k],1000),...array(future[k]??[],1000)];if(values.some(x=>!chapter(x)))fail('Invalid chapter ID.');
  p[k]=[...new Set(values.filter(x=>known.has(x)))];const unknown=[...new Set(values.filter(x=>!known.has(x)))];if(unknown.length)p.future[k]=unknown;
 }
 function responses(id,rs){
  if(!assessment(id)||!object(rs)||Object.keys(rs).length>1000)fail('Invalid assessment responses.');
  const a=assessments.get(id),out={};
  for(const[qid,r]of Object.entries(rs)){
   if(!new RegExp('^'+id+'-Q\\d{2,3}$').test(qid)||!object(r))fail('Invalid question response.');
   const q=a?.questions.find(x=>x.id===qid);if(a&&!q)fail('Unknown question '+qid);
   const allowed=q?new Set(['choice','reasoning',...(q.response_fields||[]).map(f=>f.id)]):null;
   if(Object.keys(r).length>20)fail('Too many response fields.');out[qid]={};
   for(const[k,v]of Object.entries(r)){if((allowed?!allowed.has(k):!/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(k))||typeof v!=='string'||v.length>20000)fail('Invalid response field.');out[qid][k]=v;}
   if(r.choice&&q&&!q.choices.some(c=>(typeof c==='object'?c.id:c)===r.choice))fail('Invalid choice.');
  }return out;
 }
 for(const source of [input.drafts,future.drafts??{}]){
  if(!object(source)||Object.keys(source).length>1000)fail('Invalid drafts.');
  for(const[id,d]of Object.entries(source)){const clean=responses(id,d);if(assessments.has(id))p.drafts[id]=clean;else{p.future.drafts??={};p.future.drafts[id]=clean;}}
 }
 const attemptIds=new Set();
 for(const a of [...array(input.attempts,1000),...array(future.attempts??[],1000)]){
  shape(a,['id','assessmentId','date','responses','selfScore']);
  if(typeof a.id!=='string'||!/^\w{8}-\w{4}-4\w{3}-[89ab]\w{3}-\w{12}$/i.test(a.id)||!/^[0-9a-f-]+$/i.test(a.id))fail('Invalid attempt ID: expected a UUID v4.');
  const id=a.id.toLowerCase();if(attemptIds.has(id))fail('Duplicate attempt ID.');attemptIds.add(id);
  if(typeof a.date!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(a.date)||!Number.isFinite(Date.parse(a.date))||new Date(a.date).toISOString()!==a.date)fail('Invalid attempt timestamp.');
  const clean={id,assessmentId:a.assessmentId,date:a.date,responses:responses(a.assessmentId,a.responses)};
  if(a.selfScore!==undefined){if(typeof a.selfScore!=='number'||!Number.isFinite(a.selfScore)||a.selfScore<0||a.selfScore>(assessments.get(a.assessmentId)?.total_points??1000000))fail('Invalid self-reported score.');clean.selfScore=a.selfScore;}
  if(assessments.has(a.assessmentId))p.attempts.push(clean);else{p.future.attempts??=[];p.future.attempts.push(clean);}
 }
 for(const source of [input.mastery??{},future.mastery??{}]){
  if(!object(source)||Object.keys(source).length>1000)fail('Invalid mastery checks.');
  for(const[id,values]of Object.entries(source)){if(!chapter(id)||array(values,100).some(x=>typeof x!=='boolean'))fail('Invalid mastery checks.');if(known.has(id))p.mastery[id]=[...values];else{p.future.mastery??={};p.future.mastery[id]=[...values];}}
 }
 return p;
}
export function routeHref(route){return '#'+String(route).split('/').map(part=>{try{return encodeURIComponent(decodeURIComponent(part));}catch{return encodeURIComponent(part);}}).join('/');}
export function calculate(kind,v){
 if(Object.values(v).some(x=>!finite(x)))throw Error('Enter a finite number in every field.');
 const n=Object.fromEntries(Object.entries(v).map(([k,x])=>[k,Number(x)]));
 if(Object.values(n).some(x=>Math.abs(x)>1e100))throw Error('Input is too large for this educational calculator.');
 const positive=(...keys)=>{if(keys.some(k=>n[k]<=0))throw Error('Mass, capacity, absolute temperature and denominators must be positive.');};
 let value,unit;
 switch(kind){
 case 'temperature':if(n.c< -273.15)throw Error('Temperature cannot be below absolute zero.');return {value:n.c+273.15,unit:'K',extra:`${(n.c*9/5+32).toFixed(3)} °F`};
 case 'specific':positive('m','c');value=n.m*n.c*n.dt;unit='J';break;
 case 'capacity':positive('m','c');value=n.m*n.c;unit='J/K';break;
 case 'latent':positive('m','l');value=n.m*n.l;unit='J';break;
 case 'gas':positive('n','t','v');value=n.n*8.314462618*n.t/n.v;unit='Pa';break;
 case 'efficiency':positive('q');if(n.w<0||n.w>n.q)throw Error('For this heat-engine model, work must be between zero and heat input.');value=100*n.w/n.q;unit='%';break;
 case 'gain':value=n.final-n.initial;unit='°C change';if(n.initial< -273.15||n.final< -273.15)throw Error('Readings must be at or above absolute zero.');break;
 case 'score':positive('max','best');if(n.written<0||n.written>n.max||n.device<0||n.device>n.best||n.weight<0||n.weight>100)throw Error('Use valid scores and a weight from 0 to 100.');value=n.weight*n.written/n.max+(100-n.weight)*n.device/n.best;unit='/ 100 (illustrative)';break;
 case 'heating':positive('m','power');if(n.time<0)throw Error('Time cannot be negative.');{const q=n.power*n.time;const melt=n.m*334000,warm=n.m*4186*100,boil=n.m*2256000;if(q<=melt){value=0;unit='°C';return {value,unit,extra:`Melting ice: ${(q/melt*100).toFixed(1)}% melted`,energy:q};}if(q<=melt+warm){value=(q-melt)/(n.m*4186);unit='°C';return {value,unit,extra:'Liquid warming',energy:q};}if(q<=melt+warm+boil)return {value:100,unit:'°C',extra:`Boiling: ${((q-melt-warm)/boil*100).toFixed(1)}% vaporized`,energy:q};value=100+(q-melt-warm-boil)/(n.m*2010);unit='°C';return {value,unit,extra:'Steam warming (constant heat capacity approximation)',energy:q};}
 default:throw Error('Unknown calculator');
 }
 if(!Number.isFinite(value))throw Error('Result is outside the finite range.');return {value,unit};
}
