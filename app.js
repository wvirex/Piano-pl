(function () {
  const $ = id => document.getElementById(id);

  const input     = $('search');
  const dropdown  = $('dropdown');
  const welcome   = $('welcome');
  const bar       = $('playerBar');
  const sheet     = $('sheet');
  const progBar   = $('progBar');
  const btnPlay   = $('btnPlay');
  const tempoEl   = $('tempo');
  const tempoVal  = $('tempoVal');

  let song = null, idx = 0, playing = false, paused = false, timer = null, selIdx = -1;

  Piano.build();
  Piano.dragScroll();

  // --- Search ---
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { dropdown.classList.remove('open'); return; }
    const res = SONGS.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q));
    selIdx = -1;
    if (!res.length) {
      dropdown.innerHTML = '<div class="dd-empty">Ничего не найдено</div>';
    } else {
      dropdown.innerHTML = res.map(s =>
        '<div class="dd-item" data-id="' + s.id + '" onclick="playSong(' + s.id + ')">' +
        '<span class="ico">' + s.icon + '</span>' +
        '<div><div class="name">' + s.title + '</div><div class="by">' + s.artist + '</div></div></div>'
      ).join('');
    }
    dropdown.classList.add('open');
  });

  input.addEventListener('keydown', e => {
    const items = dropdown.querySelectorAll('.dd-item');
    if (!items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); selIdx = Math.min(selIdx + 1, items.length - 1); hl(items); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); selIdx = Math.max(selIdx - 1, 0); hl(items); }
    else if (e.key === 'Enter' && selIdx >= 0) { e.preventDefault(); items[selIdx].click(); }
    else if (e.key === 'Escape') { dropdown.classList.remove('open'); input.blur(); }
  });

  function hl(items) {
    items.forEach((el, i) => el.classList.toggle('sel', i === selIdx));
    if (items[selIdx]) items[selIdx].scrollIntoView({ block: 'nearest' });
  }

  document.addEventListener('click', e => { if (!e.target.closest('.search')) dropdown.classList.remove('open'); });

  // --- Play song ---
  window.playSong = function (id) {
    const s = SONGS.find(x => x.id === id);
    if (!s) return;
    dropdown.classList.remove('open');
    input.value = s.title;
    stop();
    song = s;
    $('pIcon').textContent = s.icon;
    $('pTitle').textContent = s.title;
    $('pArtist').textContent = s.artist;
    welcome.classList.add('hidden');
    bar.classList.remove('hidden');
    sheet.classList.remove('hidden');
    sheet.innerHTML = s.notes.map((n, i) =>
      '<span class="chip' + (n.n === 'REST' ? ' rest' : '') + '" data-i="' + i + '">' +
      (n.n === 'REST' ? '♩' : n.n) + '</span>'
    ).join('');
    begin();
  };

  function begin() {
    Audio.boot(); Audio.wake();
    playing = true; paused = false; idx = 0;
    btnPlay.textContent = '⏸';
    next();
  }

  function next() {
    if (!playing || paused || !song) return;
    if (idx >= song.notes.length) { stop(); return; }

    const n = song.notes[idx];
    const tempo = parseFloat(tempoEl.value) || 1;
    const ms = n.d * (60000 / (song.bpm || 100)) / tempo;

    const chips = sheet.querySelectorAll('.chip');
    chips.forEach(c => c.classList.remove('now'));
    const cur = chips[idx];
    if (cur) { cur.classList.add('now'); cur.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); }
    for (let i = 0; i < idx; i++) if (chips[i]) chips[i].classList.add('done');

    progBar.style.width = ((idx + 1) / song.notes.length * 100) + '%';

    if (n.n !== 'REST') {
      Audio.play(n.n, ms / 1000 * 0.85);
      Piano.light(n.n, ms * 0.8);
      Piano.scrollTo(n.n);
    }

    idx++;
    timer = setTimeout(next, ms);
  }

  window.togglePlay = function () {
    if (!song) return;
    if (!playing) { begin(); return; }
    if (paused) { paused = false; btnPlay.textContent = '⏸'; next(); }
    else { paused = true; clearTimeout(timer); btnPlay.textContent = '▶'; }
  };

  window.stopSong = function () { stop(); };
  window.restartSong = function () { if (!song) return; stop(); begin(); };

  function stop() {
    playing = false; paused = false;
    clearTimeout(timer);
    Piano.unlight();
    sheet.querySelectorAll('.chip').forEach(c => c.classList.remove('now', 'done'));
    progBar.style.width = '0';
    btnPlay.textContent = '▶';
  }

  tempoEl.addEventListener('input', () => { tempoVal.textContent = parseFloat(tempoEl.value).toFixed(1) + '×'; });

  // --- Octave controls ---
  $('rngOct').addEventListener('input', function () { $('valOct').textContent = this.value; Piano.setOct(+this.value); });
  $('rngStart').addEventListener('input', function () { $('valStart').textContent = 'C' + this.value; Piano.setStart(+this.value); });

  // --- Keyboard ---
  const KM = { a:'C4',w:'C#4',s:'D4',e:'D#4',d:'E4',f:'F4',t:'F#4',g:'G4',y:'G#4',h:'A4',u:'A#4',j:'B4',k:'C5',o:'C#5',l:'D5',p:'D#5' };
  const held = new Set();
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.repeat) return;
    const n = KM[e.key.toLowerCase()];
    if (n && !held.has(e.key)) { held.add(e.key); Audio.play(n, 0.7); Piano.light(n, 280); Piano.scrollTo(n); }
  });
  document.addEventListener('keyup', e => held.delete(e.key));
})();
