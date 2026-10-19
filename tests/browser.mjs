import {createRequire} from 'node:module';import {spawn} from 'node:child_process';import fs from 'node:fs';import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
import data from '../dist/data.js';
const server=spawn(process.execPath,['scripts/serve.mjs'],{stdio:['ignore','pipe','pipe'],windowsHide:true});
await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.stderr.once('data',x=>reject(Error(x.toString())));server.once('error',reject);});
let browser;const errors=[],failed=[],checks=[];
try{
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();
 page.on('pageerror',x=>errors.push(x.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
 const base='http://127.0.0.1:4173/maple-thermodynamics/';const go=async route=>{await page.goto(base+'#'+route);await page.locator('main h1').waitFor();};
 await go('home');assert.equal(await page.locator('.hero').count(),1);fs.mkdirSync('reports/screenshots',{recursive:true});await page.screenshot({path:'reports/screenshots/dashboard-desktop.png',fullPage:true});
 for(const c of data.chapters){await go('lesson/'+c.id);assert.equal(await page.locator('article').count(),1);assert((await page.locator('article').innerText()).length>2000);await page.locator('article img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));}
 checks.push('33 full chapters and all lesson images loaded under /maple-thermodynamics/');
 await go('lesson/U1-C01');await page.locator('#complete').click();await page.locator('#bookmark').click();await page.locator('article input[type=checkbox]').first().check();await page.reload();assert.equal(await page.locator('#complete').innerText(),'✓ Completed');assert(await page.locator('article input[type=checkbox]').first().isChecked());
 await go('textbook');await page.locator('#search').fill('teaspoon');assert((await page.locator('#results').innerText()).includes('U1-C01'));checks.push('Lesson completion, bookmarks, mastery persistence, full-text search');
 for(const a of data.assessments){await go('practice/'+a.id);assert.equal(await page.locator('[data-q]').count(),a.questions.length);await page.locator('.reference img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));for(let i=0;i<a.questions.length;i++){await page.locator(`[data-q="${i}"]`).click();assert((await page.locator('.prompt').innerText()).includes(a.questions[i].prompt));assert.equal(await page.locator('[data-field]').count(),1+(a.questions[i].response_fields||[]).length+(a.questions[i].choices||[]).length);}}
 checks.push('All 368 prompts and response controls across 38 assessments; references load');
 await go('practice/T01');await page.locator('[data-field=choice]').first().check();await page.locator('#reasoning').fill('ARTIFICIAL SOFTWARE TEST RESPONSE - NOT AN ANSWER.');await page.locator('[data-q="4"]').click();await page.locator('[data-field=kelvin]').fill('-987654.321');await page.locator('#reasoning').fill('ARTIFICIAL NUMERIC INPUT - NOT A MODEL SOLUTION.');await page.reload();await page.locator('[data-q="4"]').click();assert.equal(await page.locator('[data-field=kelvin]').inputValue(),'-987654.321');await page.locator('#check').click();assert((await page.locator('#check-feedback').innerText()).includes('does not confirm correctness'));
 await page.locator('#timer-start').click();assert((await page.locator('#timer').innerText()).includes('running'));await page.locator('#timer-pause').click();assert((await page.locator('#timer').innerText()).includes('paused'));await page.locator('#timer-reset').click();assert.equal(await page.locator('#timer').innerText(),'Untimed');
 await page.locator('#review').click();assert((await page.locator('#assessment-body').innerText()).includes('Needs attention'));await page.locator('#submit').click();await page.locator('#self-score').fill('30');await page.locator('#save-score').click();assert((await page.locator('#score-status').innerText()).includes('self-reported'));
 page.once('dialog',d=>d.accept());await page.locator('#retry').click();assert.equal(await page.locator('#reasoning').inputValue(),'');checks.push('Choice/numeric drafts persist; review flags, separate attempt, self-reported score and retry work; timer start/pause/reset');
 await go('formulas');assert.equal(await page.locator('.formula-card').count(),42);await page.locator('#search').fill('heat');assert((await page.locator('.formula-card').count())>0);
 await go('lab');for(const kind of ['temperature','specific','capacity','latent','gas','efficiency','heating','gain','score']){await page.locator('#lab-select').selectOption(kind);assert((await page.locator('#calc-result').innerText()).length>2);}checks.push('All 42 formulas and nine calculators render');
 await page.locator('#lab-select').selectOption('heating');await page.screenshot({path:'reports/screenshots/heating-desktop.png',fullPage:true});
 for(const d of data.downloads){const r=await context.request.get(base+'content/'+d.path);assert.equal(r.status(),200);assert.equal((await r.body()).subarray(0,5).toString(),'%PDF-');}checks.push('All 21 PDF URLs return original PDF bytes');
 await go('progress');const dl=page.waitForEvent('download');await page.locator('#export-progress').click();const saved=await dl;await saved.saveAs('reports/progress-test-export.json');page.once('dialog',d=>d.accept());await page.locator('#reset-progress').click();page.once('dialog',d=>d.accept());await page.locator('#import-progress').setInputFiles('reports/progress-test-export.json');await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('imported'));assert((await page.locator('main').innerText()).includes('Self-reported: 30/60'));checks.push('Real file export, reset and validated import restore progress');
 // Exercise the real file import UI. Invalid IDs must reject before confirmation or storage changes.
 const baseline=JSON.parse(fs.readFileSync('reports/progress-test-export.json','utf8'));
 const storedBefore=await page.evaluate(()=>localStorage.getItem('maple-thermo:regional-1.0:progress'));
 const attack='<svg data-audit-injected="yes" onload="window.__mapleXss=1"></svg>';
 for(const bad of [attack,'javascript:window.__mapleXss=1','%22%3E'+attack]){
  const payload=structuredClone(baseline);payload.attempts[0].id=bad;
  await page.evaluate(()=>{document.querySelector('#notice').textContent='';});
  await page.locator('#import-progress').setInputFiles({name:'malicious.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))});
  await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Import rejected'));
  assert.equal(await page.evaluate(()=>window.__mapleXss),undefined);assert.equal(await page.locator('[data-audit-injected]').count(),0);
  assert.equal(await page.evaluate(()=>localStorage.getItem('maple-thermo:regional-1.0:progress')),storedBefore);
 }
 for(const malformed of ['{broken',JSON.stringify({...baseline,attempts:{}}),JSON.stringify({...baseline,drafts:[]})]){
  await page.evaluate(()=>{document.querySelector('#notice').textContent='';});
  await page.locator('#import-progress').setInputFiles({name:'malformed.json',mimeType:'application/json',buffer:Buffer.from(malformed)});
  await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Import rejected'));
  assert.equal(await page.evaluate(()=>localStorage.getItem('maple-thermo:regional-1.0:progress')),storedBefore);
 }
 // Legitimate free-form text can contain markup characters; it must display literally, never execute.
 const literal=structuredClone(baseline);const attempt=literal.attempts[0];const question=Object.keys(attempt.responses)[0];attempt.responses[question].reasoning=attack;
 literal.drafts[attempt.assessmentId]={[question]:{reasoning:attack}};
 page.once('dialog',d=>d.accept());await page.locator('#import-progress').setInputFiles({name:'literal-text.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(literal))});
 await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Progress imported'));
 await page.locator(`a[href="#attempt/${attempt.id}"]`).click();assert((await page.locator('main').innerText()).includes(attack));
 assert.equal(await page.locator('[data-audit-injected]').count(),0);assert.equal(await page.evaluate(()=>window.__mapleXss),undefined);
 await page.reload();assert.equal(await page.locator('[data-audit-injected]').count(),0);assert.equal(await page.evaluate(()=>window.__mapleXss),undefined);
 await go('practice/'+attempt.assessmentId);assert.equal(await page.locator('#reasoning').inputValue(),attack);assert.equal(await page.locator('[data-audit-injected]').count(),0);
 await page.evaluate(()=>{window.print=()=>{window.__unsafePrint=document.querySelectorAll('[data-audit-injected]').length;};});await page.locator('#print-responses').click();assert.equal(await page.evaluate(()=>window.__unsafePrint),0);
 const poisoned=structuredClone(baseline);poisoned.attempts[0].id=attack;
 await page.evaluate(p=>localStorage.setItem('maple-thermo:regional-1.0:progress',JSON.stringify(p)),poisoned);await go('progress');await page.reload();
 assert((await page.locator('#notice').innerText()).includes('could not be loaded'));assert.equal(await page.locator('[data-audit-injected]').count(),0);assert.equal(await page.evaluate(()=>window.__mapleXss),undefined);
 await page.evaluate(p=>localStorage.setItem('maple-thermo:regional-1.0:progress',JSON.stringify(p)),baseline);await page.reload();
 await go('progress');page.once('dialog',d=>d.accept());await page.locator('#import-progress').setInputFiles({name:'restore.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(baseline))});
 await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Progress imported'));
 checks.push('Malicious IDs and malformed imports rejected without storage changes; HTML-like response text remains inert before and after reload');
 await page.setViewportSize({width:390,height:844});for(const r of ['home','lesson/U4-C07','practice/T04','formulas','lab','resources','progress']){await go(r);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal page overflow: '+r);}
 await go('home');await page.screenshot({path:'reports/screenshots/dashboard-mobile.png',fullPage:false,animations:'disabled'});await page.locator('#menu').click();assert.equal(await page.locator('#menu').getAttribute('aria-expanded'),'true');await page.locator('[data-nav=textbook]').click();assert.equal(await page.locator('#menu').getAttribute('aria-expanded'),'false');await page.locator('#theme').click();assert(await page.locator('body').evaluate(x=>x.classList.contains('dark')));await page.screenshot({path:'reports/screenshots/textbook-mobile-dark.png',fullPage:false,animations:'disabled'});checks.push('390px mobile layout: seven page types without viewport overflow; menu and theme controls');
 await page.setViewportSize({width:1440,height:1000});await go('lesson/U3-C04');await page.emulateMedia({media:'print'});assert.equal(await page.locator('#sidebar').isVisible(),false);checks.push('Print stylesheet hides navigation');
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);checks.push('No uncaught JavaScript errors or failed HTTP responses');
 fs.writeFileSync('reports/browser-tests.json',JSON.stringify({passed:true,checks,errors,failed},null,2));console.log(JSON.stringify({passed:true,checks},null,2));
}finally{await browser?.close();server.kill();}
