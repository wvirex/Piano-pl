/**
 * PianoPlay — Piano Keyboard Renderer
 */

const Piano = (() => {
  const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const BLACK_INDICES = new Set([1, 3, 6, 8, 10]);

  let numOctaves = 5;
  let startOct = 2;
  let onNotePlay = null;

  function setCallback(fn) { onNotePlay = fn; }

  function build() {
    const piano = document.getElementById('piano');
    piano.innerHTML = '';

    const root = document.documentElement;
    const style = getComputedStyle(root);
    const wkW = parseFloat(style.getPropertyValue('--wk-w')) || 52;
    const bkW = parseFloat(style.getPropertyValue('--bk-w')) || 32;

    let whiteIdx = 0;

    for (let oct = startOct; oct < startOct + numOctaves; oct++) {
      for (let n = 0; n < 12; n++) {
        const noteName = NOTES[n] + oct;
        const isBlack = BLACK_INDICES.has(n);

        const key = document.createElement('div');
        key.className = 'key ' + (isBlack ? 'black' : 'white');
        key.dataset.note = noteName;

        const lbl = document.createElement('span');
        lbl.className = 'key-label';

        if (isBlack) {
          lbl.textContent = NOTES[n];
          key.style.left = (whiteIdx * wkW - bkW / 2) + 'px';
        } else {
          lbl.textContent = noteName;
          whiteIdx++;
        }

        key.appendChild(lbl);
        addTouchHandlers(key, noteName);
        piano.appendChild(key);
      }
    }

    const lastNote = 'C' + (startOct + numOctaves);
    const lastKey = document.createElement('div');
    lastKey.className = 'key white';
    lastKey.dataset.note = lastNote;
    const ll = document.createElement('span');
    ll.className = 'key-label';
    ll.textContent = lastNote;
    lastKey.appendChild(ll);
    addTouchHandlers(lastKey, lastNote);
    piano.appendChild(lastKey);
    whiteIdx++;

    piano.style.width = (whiteIdx * wkW) + 'px';
  }

  function addTouchHandlers(key, note) {
    const start = (e) => {
      e.preventDefault();
      key.classList.add('pressed');
      if (onNotePlay) onNotePlay(note);
      PianoAudio.play(note, 0.8);
    };
    const end = () => key.classList.remove('pressed');

    key.addEventListener('pointerdown', start);
    key.addEventListener('pointerup', end);
    key.addEventListener('pointerleave', end);
    key.addEventListener('pointercancel', end);
  }

  function highlight(note, durationMs = 400) {
    const key = document.querySelector(`.key[data-note="${note}"]`);
    if (!key) return;
    key.classList.add('highlight');
    setTimeout(() => key.classList.remove('highlight'), durationMs);
  }

  function clearHighlights() {
    document.querySelectorAll('.key.highlight').forEach(k => k.classList.remove('highlight'));
  }

  function scrollTo(note) {
    const key = document.querySelector(`.key[data-note="${note}"]`);
    const viewport = document.getElementById('pianoViewport');
    if (!key || !viewport) return;
    const offset = key.offsetLeft - viewport.offsetWidth / 2 + key.offsetWidth / 2;
    viewport.scrollTo({ left: Math.max(0, offset), behavior: 'smooth' });
  }

  function setOctaves(n) { numOctaves = n; build(); }
  function setStartOctave(n) { startOct = n; build(); }
  function getStartOctave() { return startOct; }
  function getNumOctaves() { return numOctaves; }

  function initDragScroll() {
    const el = document.getElementById('pianoViewport');
    let isDown = false, startX, scrollLeft;

    el.addEventListener('mousedown', e => {
      if (e.target.closest('.key')) return;
      isDown = true;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      el.style.cursor = 'grabbing';
    });
    el.addEventListener('mouseleave', () => { isDown = false; el.style.cursor = 'grab'; });
    el.addEventListener('mouseup', () => { isDown = false; el.style.cursor = 'grab'; });
    el.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX);
    });
  }

  return {
    build, highlight, clearHighlights, scrollTo,
    setOctaves, setStartOctave, getStartOctave, getNumOctaves,
    setCallback, initDragScroll,
  };
})();
