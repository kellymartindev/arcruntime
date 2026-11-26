const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base='http://127.0.0.1:4328',out=path.resolve(__dirname,'../review');
(async()=>{const results=[];
for(const [name,type] of [['chromium',chromium],['webkit',webkit]]){
 const b=await type.launch();
 try{
 const context=await b.newContext({viewport:{width:390,height:844}});
 await context.addInitScript(()=>{
  const Original=window.AudioContext||window.webkitAudioContext;
  window.__audioContexts=[];
  window.AudioContext=class extends Original{constructor(...args){super(...args);window.__audioContexts.push(this)}};
 });
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const clickMusic=async()=>{if(!await p.locator('.audio-menu').getAttribute('open')){if(!await p.locator('.audio-menu').evaluate(e=>e.open))await p.locator('.audio-menu summary').click();}await p.locator('[data-music-toggle]').click();};
 await p.goto(base+'/?revision=3');await p.locator('[data-audio-controls]').waitFor({state:'visible'});
 assert.equal(await p.evaluate(()=>__audioContexts.length),0,'No audio context before gesture');
 await p.locator('[data-seal]').click();assert.equal(await p.evaluate(()=>__audioContexts.length),0,'Silent seal stays silent');
 await p.emulateMedia({reducedMotion:'reduce'});await p.locator('[data-seal]').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('.seal-arc').evaluate(e=>getComputedStyle(e).animationName),'none');
 await p.emulateMedia({reducedMotion:'no-preference'});await p.locator('[data-seal]').click();assert.equal(await p.locator('.seal-arc').evaluate(e=>getComputedStyle(e).animationName),'seal-draw');
 await p.locator('[data-sound-toggle]').click();await p.waitForFunction(()=>__audioContexts[0]?.state==='running');assert.equal(await p.locator('[data-sound-toggle]').getAttribute('aria-pressed'),'true');
 await clickMusic();await p.waitForFunction(()=>document.querySelector('[data-music-toggle]').getAttribute('aria-pressed')==='true');
 assert.equal(await p.evaluate(()=>__audioContexts.length),2);assert(await p.evaluate(()=>__audioContexts.every(c=>c.state==='running')));
 await p.locator('input[type=range]').fill('30');assert.equal(await p.locator('input[type=range]').getAttribute('aria-valuetext'),'30%');
 await clickMusic();await p.waitForFunction(()=>__audioContexts[1].state==='suspended');assert.equal(await p.locator('[data-music-toggle]').getAttribute('aria-pressed'),'false');
 const t=await p.evaluate(()=>__audioContexts[1].currentTime);await p.waitForTimeout(220);assert.equal(await p.evaluate(()=>__audioContexts[1].currentTime),t,'Paused playhead stays fixed');
 await clickMusic();await p.waitForFunction(()=>__audioContexts[1].state==='running');assert(await p.evaluate(t=>__audioContexts[1].currentTime>=t,t));
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))});
 await p.waitForFunction(()=>__audioContexts.every(c=>c.state==='closed'));assert.equal(await p.locator('[data-sound-toggle]').getAttribute('aria-pressed'),'false');assert.equal(await p.locator('[data-music-toggle]').getAttribute('aria-pressed'),'false');
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'))});await p.waitForTimeout(150);assert(await p.evaluate(()=>__audioContexts.every(c=>c.state==='closed')),'Return stays silent');
 await clickMusic();await p.waitForFunction(()=>document.querySelector('[data-music-toggle]').getAttribute('aria-pressed')==='true');assert.equal(await p.evaluate(()=>__audioContexts.length),3);
 await p.locator('[data-sound-toggle]').click();await p.waitForFunction(()=>__audioContexts.every(c=>c.state==='closed'));await p.reload();await p.locator('[data-audio-controls]').waitFor({state:'visible'});assert.equal(await p.evaluate(()=>__audioContexts.length),0);
 // A slow optional-module load must not restart music after the visitor muted it.
 let release;const hold=new Promise(resolve=>release=resolve);
 await p.route('**/ambient.js',async route=>{await hold;await route.continue()});
 await clickMusic();await p.waitForFunction(()=>__audioContexts.length===1);await p.locator('[data-sound-toggle]').click();release();await p.waitForTimeout(400);
 assert(await p.evaluate(()=>__audioContexts.every(c=>c.state==='closed')));assert.equal(await p.locator('[data-music-toggle]').getAttribute('aria-pressed'),'false');
 // A refused start reports an error and remains retryable, rather than showing success.
 await p.evaluate(()=>{window.__originalResume=AudioContext.prototype.resume;AudioContext.prototype.resume=function(){return Promise.reject(Error('Test: blocked audio'));}});
 await p.locator('[data-sound-toggle]').click();await p.waitForFunction(()=>document.querySelector('.audio-status').textContent.length>0);assert.equal(await p.locator('[data-sound-toggle]').getAttribute('aria-pressed'),'false');
 await p.evaluate(()=>{AudioContext.prototype.resume=window.__originalResume});
 await p.locator('[data-sound-toggle]').click();await p.waitForFunction(()=>__audioContexts.at(-1).state==='running');assert.equal(await p.locator('.audio-status').innerText(),'');
 await p.locator('[data-sound-toggle]').click();
 await p.evaluate(()=>{AudioContext.prototype.resume=function(){return new Promise(()=>{});}});
 await clickMusic();await p.waitForFunction(()=>document.querySelector('.audio-status').textContent.length>0,{},{timeout:6500});assert.equal(await p.locator('[data-music-toggle]').getAttribute('aria-busy'),'false');assert(await p.evaluate(()=>__audioContexts.every(c=>c.state==='closed')));
 await p.evaluate(()=>{AudioContext.prototype.resume=window.__originalResume});
 assert.deepEqual(errors,[]);results.push({engine:name,checks:'no autoplay, silent/keyboard/reduced-motion seal, signature, play/pause/resume, volume, hidden/return, mute, reload canceled-start race, refused-start recovery, and startup timeout passed',errors});
 // Original composition rendered offline for objective headroom and a review-only WAV.
 if(name==='chromium'){
  const stats=await p.evaluate(async()=>{
   const {createBus,playSignature}=await import('/audio.js');const {scheduleBar,barLength,beat}=await import('/ambient.js');
   const rate=22050,duration=60,c=new OfflineAudioContext(2,rate*duration,rate),bus=createBus(c,.65);
   bus.fadeIn(4*beat,.05);
   for(let i=0;i<Math.ceil(duration/barLength);i++)scheduleBar(c,bus,.05+i*barLength,i);
   const buffer=await c.startRendering();let peak=0,squares=0,step=0;const left=buffer.getChannelData(0),right=buffer.getChannelData(1);
   for(let i=0;i<left.length;i++){peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));squares+=left[i]**2+right[i]**2;if(i)step=Math.max(step,Math.abs(left[i]-left[i-1]),Math.abs(right[i]-right[i-1]));}
   const referenceContext=new OfflineAudioContext(2,rate*6,rate),referenceBus=createBus(referenceContext,.65);
   scheduleBar(referenceContext,referenceBus,.05,0);const reference=await referenceContext.startRendering();
   const rmsWindow=(samples,start,end)=>{let sum=0;for(let i=Math.floor(start*rate);i<end*rate;i++)sum+=samples[i]**2;return Math.sqrt(sum/((end-start)*rate));};
   const onsetRatio=rmsWindow(left,.05,.55)/rmsWindow(reference.getChannelData(0),.05,.55);
   const settledRatio=rmsWindow(left,3.6,5.6)/rmsWindow(reference.getChannelData(0),3.6,5.6);
   // Export the first 42 seconds at the actual default volume, with a final fade.
   const frames=42*rate,bytes=new Uint8Array(44+frames*4),view=new DataView(bytes.buffer);const text=(at,s)=>[...s].forEach((v,i)=>view.setUint8(at+i,v.charCodeAt(0)));
   text(0,'RIFF');view.setUint32(4,36+frames*4,true);text(8,'WAVE');text(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,2,true);view.setUint32(24,rate,true);view.setUint32(28,rate*4,true);view.setUint16(32,4,true);view.setUint16(34,16,true);text(36,'data');view.setUint32(40,frames*4,true);
   for(let i=0;i<frames;i++){const fade=Math.min(1,(frames-i)/(rate*2));view.setInt16(44+i*4,Math.round(left[i]*.5*fade*32767),true);view.setInt16(46+i*4,Math.round(right[i]*.5*fade*32767),true);}
   let binary='';for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));
   return {onsetRatio,settledRatio,fadeSeconds:4*beat,peak,rms:Math.sqrt(squares/(left.length*2)),maxAdjacentSampleStep:step,duration,base64:btoa(binary)};
  });
  fs.writeFileSync(path.join(out,'ambient-sketch.wav'),Buffer.from(stats.base64,'base64'));delete stats.base64;assert(stats.onsetRatio<.08);assert(Math.abs(stats.settledRatio-1)<.001);assert(stats.peak<.9);assert(stats.rms>.005);results.push({offlineRender:stats});
 }
 await context.close();
 }finally{await b.close()}
}
fs.writeFileSync(path.join(out,'audio-checks.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
