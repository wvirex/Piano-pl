const Piano = (() => {
  const N = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const BL = new Set([1,3,6,8,10]);
  let oct = 5, start = 2;

  function build() {
    const el = document.getElementById('piano');
    el.innerHTML = '';
    const s = getComputedStyle(document.documentElement);
    const ww = parseFloat(s.getPropertyValue('--wk')) || 50;
    const bw = parseFloat(s.getPropertyValue('--bk')) || 30;
    let wi = 0;

    for (let o = start; o < start + oct; o++) {
      for (let i = 0; i < 12; i++) {
        const nn = N[i] + o;
        const black = BL.has(i);
        const k = document.createElement('div');
        k.className = 'key ' + (black ? 'b' : 'w');
        k.dataset.note = nn;
        const lb = document.createElement('span');
        lb.className = 'lbl';
        if (black) {
          lb.textContent = N[i];
          k.style.left = (wi * ww - bw / 2) + 'px';
        } else {
          lb.textContent = nn;
          wi++;
        }
        k.appendChild(lb);
        bind(k, nn);
        el.appendChild(k);
      }
    }

    const last = 'C' + (start + oct);
    const lk = document.createElement('div');
    lk.className = 'key w';
    lk.dataset.note = last;
    const ll = document.createElement('span');
    ll.className = 'lbl';
    ll.textContent = last;
    lk.appendChild(ll);
    bind(lk, last);
    el.appendChild(lk);
    wi++;

    el.style.width = (wi * ww) + 'px';
  }

  function bind(k, note) {
    const down = e => { e.preventDefault(); k.classList.add('pressed'); Audio.play(note, 0.7); };
    const up = () => k.classList.remove('pressed');
    k.addEventListener('pointerdown', down);
    k.addEventListener('pointerup', up);
    k.addEventListener('pointerleave', up);
    k.addEventListener('pointercancel', up);
  }

  function light(note, ms) {
    const k = document.querySelector('.key[data-note="' + note + '"]');
    if (!k) return;
    k.classList.add('lit');
    setTimeout(() => k.classList.remove('lit'), ms || 350);
  }

  function unlight() {
    document.querySelectorAll('.key.lit').forEach(k => k.classList.remove('lit'));
  }

  function scrollTo(note) {
    const k = document.querySelector('.key[data-note="' + note + '"]');
    const v = document.getElementById('pianoScroll');
    if (!k || !v) return;
    v.scrollTo({ left: Math.max(0, k.offsetLeft - v.offsetWidth / 2 + k.offsetWidth / 2), behavior: 'smooth' });
  }

  function setOct(n) { oct = n; build(); }
  function setStart(n) { start = n; build(); }

  function dragScroll() {
    const el = document.getElementById('pianoScroll');
    let down = false, sx, sl;
    el.addEventListener('mousedown', e => {
      if (e.target.closest('.key')) return;
      down = true; sx = e.pageX - el.offsetLeft; sl = el.scrollLeft;
    });
    el.addEventListener('mouseleave', () => down = false);
    el.addEventListener('mouseup', () => down = false);
    el.addEventListener('mousemove', e => {
      if (!down) return;
      e.preventDefault();
      el.scrollLeft = sl - (e.pageX - el.offsetLeft - sx);
    });
  }

  return { build, light, unlight, scrollTo, setOct, setStart, dragScroll };
})();
