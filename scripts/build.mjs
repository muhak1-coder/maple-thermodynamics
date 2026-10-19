import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {marked} from './vendor/marked.mjs';
const root=path.resolve(import.meta.dirname,'..');
process.chdir(root);
const read=p=>fs.readFileSync('content/'+p,'utf8');
const json=p=>JSON.parse(read(p));
const index=json('release_index.json'), manifest=json('content_manifest.json');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const routes=new Map();
for(const c of index.chapters)routes.set(c.markdown_path,'#lesson/'+c.id);
for(const c of [...index.worksheets,...index.tests])routes.set(c.markdown_path,'#practice/'+c.id);
const files=fs.readdirSync('content',{recursive:true}).filter(p=>fs.statSync(path.join('content',p)).isFile()).map(p=>p.replaceAll('\\','/'));
for(const f of files.filter(p=>p.startsWith('references/')&&p.endsWith('.md')))routes.set(f,'#resource/'+encodeURIComponent(f));
const links=[];
function resolve(href,source,image=false){
 if(/^https?:\/\//i.test(href)) return href;
 if(href.startsWith('#'))return href;
 assert(!/^[a-z]+:|^\//i.test(href),'Unsafe URL '+href);
 const target=path.posix.normalize(path.posix.join(path.posix.dirname(source),href));
 assert(!target.startsWith('../'),'Path escapes content');
 assert(files.includes(target),'Missing link '+source+' → '+target);
 links.push(target);
 return !image&&routes.has(target)?routes.get(target):'content/'+target;
}
marked.use({renderer:{html({text}){return esc(text);}}});
function render(md,source){
 return marked.parse(md,{gfm:true,walkTokens(t){if(t.type==='link'||t.type==='image')t.href=resolve(t.href,source,t.type==='image');}});
}
// Only files explicitly listed in the public manifest are eligible for publication.
const allowed=new Set(['content_manifest.json','release_index.json',...manifest.resources.filter(r=>r.visibility==='public-student').map(r=>r.path)]);
for(const f of files){
 assert(allowed.has(f),'Not allowlisted: '+f);
 assert(!/private|instructor|answer.?key|secret|\.env/i.test(f),'Forbidden file '+f);
 if(f.endsWith('.json')){
   const obj=json(f);
   const check=v=>{if(v&&typeof v==='object')for(const [k,x]of Object.entries(v)){assert(!['correct_choice_id','accepted_response_specification','grading_spec','solution_explanation','numeric_answer','rubric'].includes(k),'Private field '+f+': '+k);check(x);}};
   check(obj);
 }
}
const chapters=index.chapters.map(c=>{const md=read(c.markdown_path);return {...c,title:md.split('\n')[0].replace(/^#\s+\S+\s*[-–—:]\s*/,''),text:md,html:render(md,c.markdown_path)};});
const assessments=[...index.worksheets,...index.tests,...index.diagnostics].map(c=>({...json(c.json_path),...c,unit_id:json(c.json_path).unit_id||chapters.find(x=>x.worksheet_id===c.id)?.unit_id}));
const ids=new Set();
for(const a of assessments){assert.equal(a.questions.length,a.id.startsWith('T')?24:8);assert.equal(a.questions.reduce((n,q)=>n+q.points,0),a.total_points);for(const q of a.questions){assert.equal(q.assessment_id,a.id);assert(!ids.has(q.id));ids.add(q.id);}for(const r of a.reference_materials||[a.reference_material].filter(Boolean))if(r.figure_path)resolve(r.figure_path,a.json_path,true);}
assert.equal(chapters.length,33);assert.equal(ids.size,368);assert.equal(assessments.filter(a=>a.id.startsWith('WS')).length,33);
const formulas=files.filter(f=>/^formulas\/F\d+\.json$/.test(f)).map(json);assert.equal(formulas.length,42);
const resources=files.filter(f=>(f.startsWith('references/')||f.startsWith('formulas/'))&&f.endsWith('.md')).map(f=>({id:f,title:read(f).split('\n')[0].replace(/^#+\s*/,''),html:render(read(f),f)}));
const downloads=files.filter(f=>f.startsWith('downloads/')&&f.endsWith('.pdf')).map(f=>({path:f,title:path.basename(f,'.pdf').replaceAll('_',' ')}));
const data={release:index.release,units:manifest.units,chapters,assessments,formulas,resources,downloads};
fs.mkdirSync('dist',{recursive:true});
// Never clean a computed tree; overwrite known build files and reject unexpected output.
for(const f of files){const target=path.join('dist/content',f);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join('content',f),target);}
for(const f of ['index.html','styles.css','app.js','core.js'])fs.copyFileSync('web/'+f,'dist/'+f);
fs.writeFileSync('dist/data.js','export default '+JSON.stringify(data)+';\n');
fs.writeFileSync('dist/.nojekyll','');
const outputAllowed=new Set([...files.map(f=>'content/'+f),'index.html','styles.css','app.js','core.js','data.js','.nojekyll']);
for(const f of fs.readdirSync('dist',{recursive:true}).filter(p=>fs.statSync(path.join('dist',p)).isFile()))assert(outputAllowed.has(f.replaceAll('\\','/')),'Unexpected output file '+f);
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/content-audit.json',JSON.stringify({chapters:33,worksheets:33,tests:4,diagnostics:1,questions:ids.size,formulas:42,pdfs:downloads.length,validatedLinks:links.length,files:files.map(f=>({path:f,sha256:crypto.createHash('sha256').update(fs.readFileSync('content/'+f)).digest('hex')}))},null,2));
console.log(`Built ${chapters.length} chapters, ${assessments.length} assessments, ${ids.size} questions, ${formulas.length} formulas, ${downloads.length} PDFs. Public allowlist and links passed.`);
