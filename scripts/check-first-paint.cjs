const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const {chromium,firefox,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),local=!process.argv[2],bases=local?['http://127.0.0.1:14330']:process.argv.slice(2),results=[];
(async()=>{let server;
if(local){server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,env:{...process.env,PORT:'14330'},stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',()=>reject(Error('Preview failed')))});}
try{for(const [engineName,engine] of [['firefox',firefox],['chromium',chromium],['webkit',webkit]]){const browser=await engine.launch();try{for(const base of bases)for(const lang of ['en','ja'])for(const mode of ['dark','light','no-js']){
 const context=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:mode!=='no-js'}),p=await context.newPage();let cssRequests=0,held=[],errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/*.css',route=>{cssRequests++;return route.abort()});
 await p.route('**/site.js',route=>new Promise(resolve=>held.push(async()=>{await route.continue();resolve()})));
 if(mode!=='no-js')await p.addInitScript(theme=>{localStorage.setItem('arc-theme',theme);window.__paintStates=[];window.__cspViolations=[];document.addEventListener('securitypolicyviolation',e=>window.__cspViolations.push(e.violatedDirective));let count=0;const sample=()=>{if(document.querySelector('h1')){const h=document.querySelector('h1');window.__paintStates.push({t:performance.now(),theme:document.documentElement.dataset.theme,bg:getComputedStyle(document.body).backgroundColor,font:getComputedStyle(h).fontSize});count++;}if(count<100)requestAnimationFrame(sample)};requestAnimationFrame(sample)},mode);
 for(const navigation of ['cold','reload']){
  const response=navigation==='cold'?await p.goto(base+(lang==='ja'?'/ja/':'/'),{waitUntil:'commit'}):await p.reload({waitUntil:'commit'});
  assert.equal(response.status(),200);const html=await response.text(),csp=response.headers()['content-security-policy'];
  for(const [tag,attr] of [['style','data-initial-styles'],['script','data-initial-theme']]){const text=html.match(new RegExp(`<${tag} ${attr}>([\\s\\S]*?)<\\/${tag}>`))?.[1];assert(text,attr);const hash=crypto.createHash('sha256').update(text).digest('base64');assert(csp.includes(`'sha256-${hash}'`),attr+' exact CSP hash');}
  assert(!csp.includes('unsafe-inline'));assert(!/<link[^>]+rel="stylesheet"/.test(html));
  await p.waitForSelector('h1',{state:'attached'});await p.waitForTimeout(100);
  const early=await p.evaluate(()=>({theme:document.documentElement.dataset.theme,bg:getComputedStyle(document.body).backgroundColor,font:getComputedStyle(document.querySelector('h1')).fontSize,visibility:getComputedStyle(document.body).visibility,opacity:getComputedStyle(document.body).opacity,themeButtonHidden:document.querySelector('[data-theme-toggle]').hidden,cssLinks:document.querySelectorAll('link[rel="stylesheet"]').length,samples:window.__paintStates||[],violations:window.__cspViolations||[]}));
  const expectedTheme=mode==='light'?'light':'dark',bg=mode==='light'?'rgb(244, 236, 219)':'rgb(20, 17, 15)',font=lang==='en'?'44px':'38px';
  assert.equal(early.theme,expectedTheme);assert.equal(early.bg,bg);assert.equal(early.font,font);assert.equal(early.visibility,'visible');assert.equal(early.opacity,'1');assert.equal(early.themeButtonHidden,true,'snapshot must precede deferred interaction script');assert.equal(early.cssLinks,0);assert.equal(cssRequests,0);assert.deepEqual(early.violations,[]);
  if(mode!=='no-js'){assert(early.samples.length>0,'captured initial rendering frames');for(const frame of early.samples){assert.equal(frame.bg,bg);assert.equal(frame.font,font);assert.equal(frame.theme,expectedTheme);}}
  if(engineName==='firefox'&&navigation==='cold')await p.screenshot({path:path.join(root,`review/first-paint-fixed-${new URL(base).hostname}-${lang}-${mode}.png`)});
  for(const release of held.splice(0))await release();await p.waitForLoadState('load');
  assert.deepEqual(errors,[]);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(mode==='no-js'){await p.locator('details.case-notes summary').first().click();assert(await p.locator('details.case-notes').first().evaluate(d=>d.open));}
  else {assert.equal(await p.locator('html').getAttribute('data-theme'),expectedTheme);assert(!await p.locator('[data-theme-toggle]').evaluate(e=>e.hidden));}
  results.push({engine:engineName,base,lang,mode,navigation,initialTheme:early.theme,initialBackground:early.bg,initialFont:early.font,initialFramesChecked:early.samples.length,externalStylesheetRequests:cssRequests,visibleBeforeInteractionScript:true,passed:true});
 }
 await context.close();
 }}finally{await browser.close()}}
 const out=path.join(root,`review/first-paint-${local?'local':'live'}-checks.json`);fs.writeFileSync(out,JSON.stringify({checks:results},null,2));console.log(JSON.stringify({passed:results.length,evidence:out,engines:['firefox','chromium','webkit'],bases},null,2));
}finally{if(server)server.kill()}
})().catch(e=>{console.error(e);process.exitCode=1});
