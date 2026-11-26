// Shared, original synthesis for the seal and optional ambient sketch. No samples.
export const frequency = midi => 440 * 2 ** ((midi - 69) / 12);
export function createBus(context, volume = 0.35) {
  const input = context.createGain(); input.gain.value = 2.4;
  const dry = context.createGain(); dry.gain.value = 0.82;
  const wet = context.createGain(); wet.gain.value = 0.2;
  const reverb = context.createConvolver();
  const length = Math.ceil(context.sampleRate * 2.8);
  const impulse = context.createBuffer(2, length, context.sampleRate);
  // Fixed seed keeps the room consistent between visits and offline checks.
  let seed = 91271;
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      data[i] = (seed / 2147483648 - 1) * (1 - i / length) ** 3 * Math.min(1, i / (context.sampleRate * 0.012));
    }
  }
  reverb.buffer = impulse;
  const warmth = context.createBiquadFilter(); warmth.type = 'lowpass'; warmth.frequency.value = 5200; warmth.Q.value = 0.2;
  const master = context.createGain(); master.gain.value = volume;
  input.connect(dry).connect(warmth);
  input.connect(reverb).connect(wet).connect(warmth);
  const entrance=context.createGain();
  warmth.connect(entrance).connect(master).connect(context.destination);
  return {input, master, fadeIn(seconds,start=context.currentTime){
    // Independent from the volume slider, so adjustments cannot cancel the entrance.
    const curve=Float32Array.from({length:65},(_,i)=>{const x=i/64;return x*x*(3-2*x);});
    entrance.gain.cancelScheduledValues(start);
    entrance.gain.setValueCurveAtTime(curve,start,seconds);
  }, setVolume(value) {master.gain.setTargetAtTime(Math.max(0,Math.min(0.65,value)),context.currentTime,0.08);}};
}
export function voice(context, bus, {time, midi, duration, level, attack=0.02, hold=0, pan=0, partials=[[1,1],[2,0.12]]}) {
  const envelope=context.createGain(), stereo=context.createStereoPanner();
  stereo.pan.value=pan;
  envelope.gain.setValueAtTime(0,time);
  envelope.gain.linearRampToValueAtTime(level,time+attack);
  if(hold>0)envelope.gain.setValueAtTime(level,time+attack+hold);
  envelope.gain.exponentialRampToValueAtTime(0.00001,time+duration);
  envelope.gain.linearRampToValueAtTime(0,time+duration+0.08);
  envelope.connect(stereo).connect(bus.input);
  let remaining=partials.length;
  for(const [ratio,amplitude] of partials) {
    const osc=context.createOscillator(),gain=context.createGain();
    osc.type='sine'; osc.frequency.value=frequency(midi)*ratio;gain.gain.value=amplitude;
    osc.connect(gain).connect(envelope);osc.start(time);osc.stop(time+duration+0.1);
    osc.onended=()=>{osc.disconnect();gain.disconnect();if(--remaining===0){envelope.disconnect();stereo.disconnect();}};
  }
}
export function bell(context,bus,time,midi,level=0.16,pan=0) {
  voice(context,bus,{time,midi,level,pan,duration:2.7,attack:0.009,partials:[[1,1],[2,0.19],[3,0.035]]});
}
export function playSignature(context,bus) {
  // Rise, then settle: E–B–A. The same phrase appears in the ambient piece.
  const start=context.currentTime+0.025;
  [76,83,81].forEach((note,i)=>bell(context,bus,start+[0,0.23,0.57][i],note,[0.16,0.12,0.14][i],[-0.1,0.12,0][i]));
}
