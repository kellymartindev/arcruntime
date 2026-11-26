import {createBus,playSignature} from './audio.js';
const ui=document.querySelector('[data-audio-controls]');
const seal=document.querySelector('[data-seal]');
const svg=seal.querySelector('svg');
const soundButton=ui.querySelector('[data-sound-toggle]');
const musicButton=ui.querySelector('[data-music-toggle]');
const volume=ui.querySelector('input');
const status=ui.querySelector('[role=status]');
const menu=ui.querySelector('details');
menu.addEventListener('keydown',event=>{if(event.key==='Escape'){menu.open=false;menu.querySelector('summary').focus();}});
document.addEventListener('click',event=>{if(menu.open&&!menu.contains(event.target))menu.open=false;});
const hint=document.querySelector('[data-seal-hint]');
const AC=window.AudioContext||window.webkitAudioContext;
let enabled=false,playing=false,busy=false,epoch=0,lastSignature=-Infinity;
let effects=null,music=null;
const contexts=new Set();
function paint(){
  soundButton.textContent=enabled?soundButton.dataset.on:soundButton.dataset.off;
  soundButton.setAttribute('aria-pressed',String(enabled));
  hint.textContent=enabled?hint.dataset.on:hint.dataset.off;
  if(musicButton){musicButton.textContent=playing?musicButton.dataset.pause:musicButton.dataset.play;musicButton.setAttribute('aria-pressed',String(playing));musicButton.setAttribute('aria-busy',String(busy));}
}
function replay(){
  svg.classList.remove('seal-drawing');void svg.getBoundingClientRect();svg.classList.add('seal-drawing');
}
function makeSession(){
  const context=new AC();contexts.add(context);
  return {context,bus:createBus(context,Number(volume.value)/100*0.65)};
}
function reportError(){status.textContent=ui.dataset.error;menu.open=true;}
function resumeContext(context){
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(Error('Audio start timed out')),4000);
    context.resume().then(()=>{clearTimeout(timer);resolve();},error=>{clearTimeout(timer);reject(error);});
  });
}
function stopAll(){
  epoch++;enabled=false;playing=false;busy=false;lastSignature=-Infinity;
  music?.score?.dispose();music=null;effects=null;
  for(const context of contexts)if(context.state!=='closed')context.close().catch(()=>{});
  contexts.clear();paint();
}
async function signature(){
  if(!enabled||document.hidden||performance.now()-lastSignature<850)return;
  lastSignature=performance.now();const operation=epoch;
  try{
    effects??=makeSession();const session=effects;
    await resumeContext(session.context);
    if(operation!==epoch||!enabled||document.hidden)return;
    if(session.context.state!=='running')throw Error('Audio unavailable');
    playSignature(session.context,session.bus);
  }catch{if(operation===epoch){stopAll();reportError();}}
}
seal.disabled=false;
seal.addEventListener('click',()=>{replay();signature();});
if(AC){
  ui.hidden=false;paint();
  soundButton.addEventListener('click',()=>{
    status.textContent='';
    if(enabled){stopAll();return;}
    enabled=true;paint();signature();
  });
  musicButton?.addEventListener('click',async()=>{
    if(busy)return;
    status.textContent='';busy=true;paint();const operation=epoch;
    try{
      if(playing){
        const session=music;
        session.score.pause();session.bus.setVolume(0);
        await new Promise(resolve=>setTimeout(resolve,160));
        if(operation!==epoch)return;
        await session.context.suspend();
        if(operation!==epoch)return;
        playing=false;
      }else{
        enabled=true;
        music??=makeSession();const session=music;
        // Resume synchronously from the gesture, before the optional module loads.
        const resumed=resumeContext(session.context);
        const [module]=await Promise.all([import('./ambient.js'),resumed]);
        if(operation!==epoch||document.hidden)return;
        if(session.context.state!=='running')throw Error('Audio unavailable');
        session.score??=module.createAmbient(session.context,session.bus);
        session.bus.setVolume(Number(volume.value)/100*0.65);session.score.resume();playing=true;
      }
    }catch{if(operation===epoch){stopAll();reportError();}}
    finally{if(operation===epoch){busy=false;paint();}}
  });
  volume.addEventListener('input',()=>{
    const value=Number(volume.value)/100*0.65;
    effects?.bus.setVolume(value);music?.bus.setVolume(value);
    volume.setAttribute('aria-valuetext',volume.value+'%');
  });
}else{hint.textContent=hint.dataset.unavailable;}
// Returning never restarts sound; the next explicit gesture creates fresh audio.
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();});
window.addEventListener('pagehide',stopAll);
