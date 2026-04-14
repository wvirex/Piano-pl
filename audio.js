/**
 * PianoPlay — Audio Engine
 * Realistic piano synthesis via Web Audio API
 */

const PianoAudio = (() => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let ctx = null;
  let masterGain = null;
  let compressor = null;
  let reverb = null;

  const NOTE_SEMITONES = {
    C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,
    F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,
    A:9,'A#':10,Bb:10,B:11
  };

  function init() {
    if (ctx) return;
    ctx = new AudioCtx();

    compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 4;

    masterGain = ctx.createGain();
    masterGain.gain.value = 0.7;

    compressor.connect(masterGain);
    masterGain.connect(ctx.destination);

    createReverb();
  }

  function createReverb() {
    const convolver = ctx.createConvolver();
    const rate = ctx.sampleRate;
    const length = rate * 1.5;
    const buffer = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    convolver.buffer = buffer;

    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.15;
    convolver.connect(reverbGain);
    reverbGain.connect(masterGain);
    reverb = convolver;
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  function noteToFreq(note) {
    const match = note.match(/^([A-Ga-g]#?b?)(\d)$/);
    if (!match) return 440;
    const name = match[1].charAt(0).toUpperCase() + match[1].slice(1);
    const semitone = NOTE_SEMITONES[name];
    if (semitone === undefined) return 440;
    const octave = parseInt(match[2]);
    return 440 * Math.pow(2, (semitone - 9 + (octave - 4) * 12) / 12);
  }

  function play(note, duration = 0.5) {
    init();
    resume();
    const freq = noteToFreq(note);
    const now = ctx.currentTime;

    const fundamental = ctx.createOscillator();
    fundamental.type = 'triangle';
    fundamental.frequency.value = freq;

    const harmonic2 = ctx.createOscillator();
    harmonic2.type = 'sine';
    harmonic2.frequency.value = freq * 2;

    const harmonic3 = ctx.createOscillator();
    harmonic3.type = 'sine';
    harmonic3.frequency.value = freq * 3;

    const h2Gain = ctx.createGain();
    h2Gain.gain.value = 0.15;
    const h3Gain = ctx.createGain();
    h3Gain.gain.value = 0.05;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.4, now + 0.008);
    env.gain.exponentialRampToValueAtTime(0.2, now + 0.08);
    env.gain.exponentialRampToValueAtTime(0.1, now + duration * 0.5);
    env.gain.exponentialRampToValueAtTime(0.001, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(freq * 8, 12000), now);
    filter.frequency.exponentialRampToValueAtTime(Math.max(freq * 2, 400), now + duration);
    filter.Q.value = 1;

    fundamental.connect(filter);
    harmonic2.connect(h2Gain).connect(filter);
    harmonic3.connect(h3Gain).connect(filter);
    filter.connect(env);
    env.connect(compressor);
    if (reverb) env.connect(reverb);

    const endTime = now + duration + 0.05;
    fundamental.start(now);
    harmonic2.start(now);
    harmonic3.start(now);
    fundamental.stop(endTime);
    harmonic2.stop(endTime);
    harmonic3.stop(endTime);
  }

  return { init, resume, play, noteToFreq };
})();
