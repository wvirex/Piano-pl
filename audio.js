const Audio = (() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx, master, comp, reverb;

  const S = {C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};

  function boot() {
    if (ctx) return;
    ctx = new AC();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.ratio.value = 4;
    master = ctx.createGain();
    master.gain.value = 0.65;
    comp.connect(master);
    master.connect(ctx.destination);

    const conv = ctx.createConvolver();
    const len = ctx.sampleRate * 1.2;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8);
    }
    conv.buffer = buf;
    const rg = ctx.createGain();
    rg.gain.value = 0.12;
    conv.connect(rg);
    rg.connect(master);
    reverb = conv;
  }

  function wake() { if (ctx && ctx.state === 'suspended') ctx.resume(); }

  function freq(note) {
    const m = note.match(/^([A-G]#?b?)(\d)$/i);
    if (!m) return 440;
    const name = m[1][0].toUpperCase() + m[1].slice(1);
    const st = S[name];
    if (st === undefined) return 440;
    return 440 * Math.pow(2, (st - 9 + (parseInt(m[2]) - 4) * 12) / 12);
  }

  function play(note, dur) {
    boot(); wake();
    dur = dur || 0.5;
    const f = freq(note);
    const t = ctx.currentTime;

    const o1 = ctx.createOscillator();
    o1.type = 'triangle'; o1.frequency.value = f;
    const o2 = ctx.createOscillator();
    o2.type = 'sine'; o2.frequency.value = f * 2;
    const o3 = ctx.createOscillator();
    o3.type = 'sine'; o3.frequency.value = f * 3;

    const g2 = ctx.createGain(); g2.gain.value = 0.12;
    const g3 = ctx.createGain(); g3.gain.value = 0.04;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.38, t + 0.006);
    env.gain.exponentialRampToValueAtTime(0.18, t + 0.06);
    env.gain.exponentialRampToValueAtTime(0.08, t + dur * 0.5);
    env.gain.exponentialRampToValueAtTime(0.001, t + dur);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(Math.min(f * 8, 11000), t);
    lp.frequency.exponentialRampToValueAtTime(Math.max(f * 2, 400), t + dur);

    o1.connect(lp);
    o2.connect(g2); g2.connect(lp);
    o3.connect(g3); g3.connect(lp);
    lp.connect(env);
    env.connect(comp);
    if (reverb) env.connect(reverb);

    const end = t + dur + 0.05;
    [o1, o2, o3].forEach(o => { o.start(t); o.stop(end); });
  }

  return { boot, wake, play };
})();
