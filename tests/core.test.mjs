import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {calculate,finite,responseStatus,validateProgress,blankProgress,exportResponses,routeHref} from '../web/core.js';
import data from '../dist/data.js';
// Deliberately fictional assessment: never use live question solutions as test fixtures.
const fakeAssessment={id:'T99',total_points:10,questions:[
 {id:'T99-Q01',choices:[{id:'A',text:'Artificial option A'},{id:'B',text:'Artificial option B'}],response_fields:[],requires_reasoning:true},
 {id:'T99-Q02',choices:[],response_fields:[{id:'synthetic_value',label:'Synthetic value'}],requires_reasoning:true}
]};
const fakeData={chapters:[{id:'U1-C01'}],assessments:[fakeAssessment]};
const fakeId='11111111-1111-4111-8111-111111111111';
const fakeProgress=()=>({...blankProgress(),attempts:[{id:fakeId,assessmentId:'T99',date:'2026-10-18T00:00:00.000Z',responses:{'T99-Q01':{choice:'A',reasoning:'ARTIFICIAL TEST RESPONSE'}}}]});
test('malicious identifiers cannot pass import validation',()=>{
 const payloads=['x"><img src=x onerror=alert(1)>','<svg onload=alert(1)>','javascript:alert(1)','%22%3E%3Csvg','../T01','',fakeId+'"',fakeId.replace('-4','-5')];
 for(const value of payloads){const p=fakeProgress();p.attempts[0].id=value;assert.throws(()=>validateProgress(p,fakeData));}
 for(const field of ['assessmentId','date']){const p=fakeProgress();p.attempts[0][field]='"><svg onload=alert(1)>';assert.throws(()=>validateProgress(p,fakeData));}
});
test('malformed, unknown, mismatched and excessive records are rejected',()=>{
 for(const input of [null,[],{},'text',{...blankProgress(),attempts:{}},{...blankProgress(),drafts:[]},{...blankProgress(),future:[]},{...blankProgress(),completed:['<script>']},{...blankProgress(),mastery:{'bad-id':[true]}}])assert.throws(()=>validateProgress(input,fakeData));
 const mutations=[p=>p.attempts.push(structuredClone(p.attempts[0])),p=>p.attempts[0].responses={'T98-Q01':{}},p=>p.attempts[0].responses={'T99-Q01':{choice:'Z'}},p=>p.attempts[0].date='2026-02-31T00:00:00.000Z',p=>p.attempts[0].responses={'T99-Q01':{reasoning:{text:'bad'}}},p=>p.attempts[0].selfScore='3',p=>p.attempts[0].unexpected='data',p=>p.attempts[0].responses={'T99-Q01':{reasoning:'x'.repeat(20001)}}];
 for(const mutate of mutations){const p=fakeProgress();mutate(p);assert.throws(()=>validateProgress(p,fakeData));}
 const deep=blankProgress();deep.future={};let v=deep.future;for(let i=0;i<25;i++)v=v.child={};assert.throws(()=>validateProgress(deep,fakeData));
});
test('valid UUID imports preserve response text literally and isolate future assessments',()=>{
 const p=fakeProgress();const text='<img src=x onerror=alert(1)> & "quoted"';p.attempts[0].responses['T99-Q01'].reasoning=text;
 assert.equal(validateProgress(p,fakeData).attempts[0].responses['T99-Q01'].reasoning,text);
 const future=fakeProgress();future.attempts[0].assessmentId='T98';future.attempts[0].responses={'T98-Q01':{reasoning:'ARTIFICIAL FUTURE RESPONSE'}};
 const clean=validateProgress(future,fakeData);assert.equal(clean.attempts.length,0);assert.equal(clean.future.attempts.length,1);assert.deepEqual(validateProgress(clean,fakeData),clean);
 const evil=blankProgress();evil.future={attempts:[{...future.attempts[0],id:'<svg>'}]};assert.throws(()=>validateProgress(evil,fakeData));
});
test('route components cannot break HTML attributes or change URL scheme',()=>{
 const value='attempt/x"><svg onload=alert(1)>?x=1&y=2';const href=routeHref(value);assert(href.startsWith('#attempt/'));assert(!/[<>"\s]/.test(href));assert.equal(decodeURIComponent(href.slice(1)),value);
 assert.equal(routeHref('resource/references%2FU1-review.md'),'#resource/references%2FU1-review.md');assert.doesNotThrow(()=>routeHref('attempt/%broken'));
});
test('canonical inventory and IDs',()=>{assert.equal(data.chapters.length,33);assert.deepEqual(data.units.filter(x=>x.status==='complete').map(u=>data.chapters.filter(c=>c.unit_id===u.id).length),[6,7,7,8,5]);assert.equal(data.assessments.filter(a=>a.id.startsWith('WS')).length,33);assert.equal(data.assessments.filter(a=>a.id.startsWith('T')).length,4);assert.equal(data.formulas.length,42);assert.equal(new Set(data.assessments.flatMap(a=>a.questions.map(q=>q.id))).size,368);});
test('original chapter text retained byte-for-byte as UTF-8 and substantive sections rendered',()=>{for(const c of data.chapters){assert.equal(c.text,fs.readFileSync(new URL('../content/'+c.markdown_path,import.meta.url),'utf8'));assert(c.html.includes('<h2>'));assert(c.html.length>3000);}});
test('temperature and physical calculator reference cases',()=>{assert.equal(calculate('temperature',{c:0}).value,273.15);assert.equal(calculate('temperature',{c:-273.15}).value,0);assert.equal(calculate('specific',{m:2,c:4186,dt:10}).value,83720);assert.equal(calculate('specific',{m:1,c:400,dt:-10}).value,-4000);assert.equal(calculate('capacity',{m:2,c:500}).value,1000);assert.equal(calculate('latent',{m:.5,l:334000}).value,167000);assert(Math.abs(calculate('gas',{n:1,t:300,v:.025}).value-99773.551416)<1e-5);assert.equal(calculate('efficiency',{w:250,q:1000}).value,25);assert.equal(calculate('gain',{initial:20,final:35}).value,15);assert.equal(calculate('score',{written:45,max:60,device:12,best:15,weight:50}).value,77.5);});
test('heating curve transition boundaries',()=>{const v={m:1,power:1000};assert.equal(calculate('heating',{...v,time:167}).value,0);assert.equal(calculate('heating',{...v,time:334+209.3}).value,50);assert.equal(calculate('heating',{...v,time:334+418.6+100}).value,100);assert(Math.abs(calculate('heating',{...v,time:334+418.6+2256+201}).value-200)<1e-10);});
test('numeric format and invalid physical inputs rejected',()=>{for(const v of ['', 'NaN','Infinity','1/2','5 J','0x10'])assert.equal(finite(v),false);assert(finite('-1.2e3'));for(const[k,v]of [['temperature',{c:-274}],['specific',{m:0,c:2,dt:5}],['gas',{n:1,t:0,v:1}],['efficiency',{w:11,q:10}],['heating',{m:1,power:0,time:1}],['score',{max:0,best:1,device:1,written:1,weight:50}]])assert.throws(()=>calculate(k,v));});
test('response validation preserves numeric fields and reasoning',()=>{const q=fakeAssessment.questions[1];const r={synthetic_value:'-987654.321'};assert(!responseStatus(q,r).complete);r.reasoning='ARTIFICIAL TEST RESPONSE';assert(responseStatus(q,r).complete);r.synthetic_value='NaN';assert(!responseStatus(q,r).complete);});
test('progress roundtrip, unknown future IDs, and invalid imports',()=>{const p=fakeProgress();p.completed=['U1-C01','U6-C01'];p.bookmarks=['U1-C01'];p.drafts.T99={'T99-Q01':{choice:'A',reasoning:'ARTIFICIAL TEST RESPONSE'}};p.attempts[0].selfScore=3;const x=validateProgress(JSON.parse(JSON.stringify(p)),fakeData);assert.deepEqual(x.completed,['U1-C01']);assert.deepEqual(x.future.completed,['U6-C01']);assert.equal(x.attempts[0].selfScore,3);assert.deepEqual(validateProgress(x,fakeData),x);assert.throws(()=>validateProgress({...p,version:2},fakeData));assert.throws(()=>validateProgress({...p,drafts:{T99:{'T99-Q99':{reasoning:'bad'}}}},fakeData));assert.throws(()=>validateProgress({...p,attempts:[{...p.attempts[0],selfScore:11}]},fakeData));assert.throws(()=>validateProgress(JSON.parse('{"version":1,"__proto__":{}}'),fakeData));});
test('all printed resources have PDF signatures and original filenames',()=>{assert.equal(data.downloads.length,21);for(const d of data.downloads)assert.equal(fs.readFileSync(new URL('../dist/content/'+d.path,import.meta.url)).subarray(0,5).toString(),'%PDF-');});
test('test exports preserve canonical choice and numeric field IDs with schema-compatible shapes',()=>{const x=exportResponses(fakeAssessment,{'T99-Q01':{choice:'A',reasoning:'ARTIFICIAL TEST RESPONSE'},'T99-Q02':{synthetic_value:'-987654.321',reasoning:'ARTIFICIAL TEST RESPONSE'}},fakeId);assert.deepEqual(Object.keys(x).sort(),['schema_version','release','assessment_id','attempt_id','responses'].sort());assert.equal(x.responses.length,2);assert.equal(x.responses[0].selected_choice_id,'A');assert.equal(x.responses[1].numeric_values.synthetic_value,-987654.321);assert.throws(()=>exportResponses(fakeAssessment,{'T99-Q02':{synthetic_value:'invalid'}},fakeId));});
