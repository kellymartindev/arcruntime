// OPTIONAL MUSIC: set backgroundMusic:false in site.config.json and rebuild.
// The build then omits this module and its controls. The seal still works.
import {bell,voice} from './audio.js';
export const beat = 60 / 72;
export const barLength = 8 * beat;
// Open, closely related voicings: Amaj9, F#m9, Dmaj9, E6/9.
const chords = [
  {bass:45,notes:[57,64,68,71],melody:[[0,76],[1.5,83],[3,81],[6.5,76]]},
  {bass:42,notes:[57,61,64,68],melody:[[1,73],[3.5,76],[6,80]]},
  {bass:38,notes:[57,61,64,66],melody:[[0.5,78],[3,76],[6,73]]},
  {bass:40,notes:[56,61,66,71],melody:[[1,71],[4,76],[6.5,78]]}
];
export function scheduleBar(context,bus,time,index) {
  const chord=chords[index%4],pass=Math.floor(index/4);
  voice(context,bus,{time,midi:chord.bass,duration:barLength+1,level:0.13,attack:0.65,hold:3,partials:[[1,1],[2,0.08]]});
  chord.notes.forEach((midi,i)=>voice(context,bus,{time:time+i*0.065,midi,duration:barLength+2.2,level:0.044,attack:1.1+i*0.06,hold:barLength-1.2,pan:(i-1.5)*0.23,partials:[[1,1],[2.002,0.14],[0.999,0.12]]}));
  for(const [offset,midi] of chord.melody) {
    // Alternate phrases leave more space; variation stays composed and in-key.
    if(pass%2===1&&offset>6)continue;
    bell(context,bus,time+offset*beat,midi,0.105+(offset===0?0.015:0),offset<3?-0.18:0.2);
  }
  if(pass%3===2&&index%4===2)bell(context,bus,time+5*beat,81,0.065,0);
}
export function createAmbient(context,bus) {
  let next=context.currentTime+0.08,index=0,timer=null;
  bus.fadeIn(4*beat,next);
  const tick=()=>{if(context.state!=='running')return;while(next<context.currentTime+0.6){scheduleBar(context,bus,next,index++);next+=barLength;}};
  return {
    resume(){if(timer!==null)return;tick();timer=setInterval(tick,200);},
    pause(){clearInterval(timer);timer=null;},
    dispose(){clearInterval(timer);timer=null;}
  };
}
