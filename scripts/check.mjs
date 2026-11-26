import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {render,validateConfig} from './build.mjs';
const require=createRequire(import.meta.url);
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=new URL('../',import.meta.url),review=new URL('review/',root);
await mkdir(review,{recursive:true});
const checks=[];
const closed=render('en',{betaFormUrl:'',contactEmail:''});
assert(!closed.includes('<form')&&!closed.includes('mailto:')&&!closed.includes('type="email"'));
for(const lang of ['en','ja']){
 const configured=render(lang,{betaSection:'full',showBetaCta:true,betaFormUrl:'https://subscribepage.io/test-fixture',contactEmail:'verified-test@arcruntime.com'});
 assert(configured.includes('href="https://subscribepage.io/test-fixture"'));
 assert(configured.includes('mailto:verified-test@arcruntime.com'));
 assert(!configured.includes('Beta signup is not open yet.')&&!configured.includes('登録は準備中です。'));
}
for(const u of ['javascript:alert(1)','https://example.com/','http://subscribepage.io/test','https://evil.subscribepage.io/test','https://user:pass@subscribepage.io/test'])assert.throws(()=>validateConfig({betaFormUrl:u}));
assert.throws(()=>validateConfig({contactEmail:'person@example.com'}));
checks.push('Closed signup collects nothing; configured EN/JA hosted-link branch and invalid configuration guards pass. No provider submission performed.');
assert(!render('en',{backgroundMusic:false}).includes('data-music-toggle'));
assert(render('en',{backgroundMusic:false}).includes('data-seal'));
assert(!render('en',{backgroundMusic:true}).includes('data-audio-controls'));
assert(!render('en').includes('noindex'));
assert(render('ja').includes('https://arcruntime.com/ja/'));
const allowed=['index.html','ja/index.html','site.css','site.js','robots.txt','sitemap.xml','assets/seal.svg','assets/narelog.png','assets/lodestone.png','assets/plink.png','assets/arc-runtime-social-2026-10-09-v1.png'];
async function walk(dir,prefix=''){let files=[];for(const item of await readdir(dir,{withFileTypes:true})){const p=prefix+item.name;if(item.isDirectory())files.push(...await walk(new URL(item.name+'/',dir),p+'/'));else files.push(p)}return files}
assert.deepEqual((await walk(new URL('dist/',root))).sort(),allowed.sort());
for(const file of allowed.filter(f=>!/\.png$/.test(f))){const s=await readFile(new URL('dist/'+file,root),'utf8');assert(!/kelly|martin|alpha\.narelog|interview|job.?hunt|braid|0ctobyte|hello@|mailto:|api[_-]?key|password\s*[:=]|practise|言葉の森|App Store|AI music|Genre Radar|Setlist Review/i.test(s),file+' privacy or claim scan');}
checks.push('Output allowlist and prohibited identifiers/claims scan pass across all compiled text assets.');
const port=14328,base='http://127.0.0.1:'+port;
const server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});
await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(Error('Server exited '+code)));});
const variants=[];
try{
 for(const file of ['/README.md','/.git/config','/site.config.json','/src/content.mjs','/review/preview-provenance.json'])assert.equal((await fetch(base+file)).status,404,file);
 checks.push('Preview refuses repository README, Git metadata, configuration, source and review evidence.');
 for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch({headless:true});
 try{
 const context=await browser.newContext(),p=await context.newPage();let errors=[],external=[],bad=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(new URL(r.url()).origin!==base)external.push(r.url())});p.on('response',r=>{if(r.status()>=400)bad.push(r.url())});
 for(const lang of ['en','ja'])for(const width of [320,390,768,1024,1440])for(const theme of ['dark','light']){
 await p.setViewportSize({width,height:900});await p.goto(base+(lang==='ja'?'/ja/':'/'));
 await p.evaluate(t=>{localStorage.setItem('arc-theme',t)},theme);await p.reload();
 for(const img of await p.locator('.project img').all()){await img.scrollIntoViewIfNeeded();await p.waitForFunction(el=>el.complete&&el.naturalWidth>0,await img.elementHandle());}await p.evaluate(()=>scrollTo(0,0));
 assert.equal(await p.locator('html').getAttribute('lang'),lang);assert.equal(await p.locator('html').getAttribute('data-theme'),theme);
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.equal(await p.locator('.project details.case-notes').count(),3);assert.equal(await p.locator('.project details[open]').count(),0);
 await p.locator('.project details.case-notes').evaluateAll(ds=>ds.forEach(d=>{d.open=true}));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.locator('.project details.case-notes').evaluateAll(ds=>ds.forEach(d=>{d.open=false}));
 await p.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
 assert.equal(await p.locator('[data-audio-controls]').count(),0);assert.equal(await p.locator('.hero [data-audio-controls]').count(),0);assert.equal(await p.locator('h1').count(),1);assert.equal(await p.locator('.hero a[href="#join"]').count(),0);assert.equal(await p.locator('#join .signup-panel').count(),0);assert.equal(await p.locator('#join h2').innerText(),lang==='en'?'Coming soon.':'準備中です。');assert.equal(await p.locator('form,input,iframe,audio').count(),0);
 for(const link of await p.locator('a[href^="#"]').evaluateAll(as=>as.map(a=>a.hash)))assert(await p.locator(link).count());
 variants.push({engine:name,lang,width,theme,overflow:false,images:true});
 if(name==='chromium'&&[390,1440].includes(width)&&theme==='dark')await p.screenshot({path:new URL(`${lang}-${width}.png`,review).pathname,fullPage:true,animations:'disabled'});
 }
 await p.goto(base);await p.evaluate(()=>{document.activeElement.blur();window.scrollTo(0,0)});await p.keyboard.press(name==='webkit'?'Alt+Tab':'Tab');assert.equal(await p.evaluate(()=>document.activeElement.className),'skip');await p.keyboard.press('Enter');
 assert.equal(await p.evaluate(()=>location.hash),'#main');
 await p.locator('[data-theme-toggle]').focus();await p.keyboard.press('Space');const switched=await p.locator('html').getAttribute('data-theme');await p.reload();assert.equal(await p.locator('html').getAttribute('data-theme'),switched);
 await p.goto(base+'/#work');await p.locator('[data-language]').click();assert.equal(await p.locator('html').getAttribute('lang'),'ja');assert.equal(await p.evaluate(()=>location.hash),'#work');
 await p.locator('[data-seal]').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('.seal-arc').evaluate(e=>getComputedStyle(e).animationName),'seal-draw');
 const lodestoneNotes=p.locator('article:has(#lodestone-title) details.case-notes');assert((await lodestoneNotes.locator('summary').textContent()).includes('Lodestone'));await lodestoneNotes.locator('summary').focus();await p.keyboard.press('Enter');assert(await lodestoneNotes.evaluate(d=>d.open));assert.equal(await p.locator('article:has(#plink-title) a.project-link').getAttribute('href'),'https://plink-arcruntime.netlify.app/');assert.equal(await p.locator('article:has(#plink-title) a.project-link').textContent(),'Plinkを試す↗');
 await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await p.locator('.hero-mark svg').evaluate(e=>getComputedStyle(e).animationName),'none');assert.equal(await p.locator('html').evaluate(e=>getComputedStyle(e).scrollBehavior),'auto');
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(bad,[]);
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),plain=await nojs.newPage();await plain.goto(base+'/ja/');assert(await plain.locator('h1').isVisible());assert(!await plain.locator('[data-theme-toggle]').isVisible());await plain.locator('details.case-notes summary').first().click();assert(await plain.locator('details.case-notes dd').first().isVisible());await plain.locator('[data-language]').click();assert.equal(await plain.locator('html').getAttribute('lang'),'en');await nojs.close();
 checks.push(name+': case notes start closed, open from the keyboard and without JavaScript, use the verified Plink demo link, and cause no overflow when all are open.');
 checks.push(name+': keyboard skip/theme (WebKit uses macOS Option-Tab link navigation), theme persistence, language anchor, reduced motion, no-JS navigation, no external requests or browser errors pass.');
 await context.close();
 }finally{await browser.close()}
 }
 const result={checkedAt:new Date().toISOString(),checks,variants};await writeFile(new URL('checks.json',review),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}finally{server.kill()}
