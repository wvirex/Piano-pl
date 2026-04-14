/**
 * PianoPlay — Main Application Logic
 */

(function() {

  // ========== DOM refs ==========
  const searchInput    = document.getElementById('searchInput');
  const searchDropdown = document.getElementById('searchDropdown');
  const searchResults  = document.getElementById('searchResults');
  const searchHint     = document.getElementById('searchHint');

  const welcomeScreen  = document.getElementById('welcomeScreen');
  const playerEl       = document.getElementById('player');
  const noteSheet      = document.getElementById('noteSheet');
  const noteScroll     = document.getElementById('noteSheetScroll');
  const progressBar    = document.getElementById('progressBar');

  const playPauseBtn   = document.getElementById('playPauseBtn');
  const iconPlay       = playPauseBtn.querySelector('.icon-play');
  const iconPause      = playPauseBtn.querySelector('.icon-pause');
  const tempoSlider    = document.getElementById('tempoSlider');
  const tempoValue     = document.getElementById('tempoValue');

  const octaveRange    = document.getElementById('octaveRange');
  const octaveValue    = document.getElementById('octaveValue');
  const startOctaveEl  = document.getElementById('startOctave');
  const startOctValue  = document.getElementById('startOctaveValue');

  // ========== State ==========
  let currentSong   = null;
  let noteIdx       = 0;
  let isPlaying     = false;
  let isPaused      = false;
  let playTimer     = null;
  let selectedSearchIdx = -1;

  // ========== Init ==========
  Piano.build();
  Piano.initDragScroll();

  // ========== Theme toggle ==========
  document.getElementById('themeToggle').addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'light' ? '' : 'light';
    if (next) html.setAttribute('data-theme', next);
    else html.removeAttribute('data-theme');
    Piano.build();
  });

  // ========== Search ==========
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) { closeSearch(); return; }

    const results = SONGS.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q)
    );

    selectedSearchIdx = -1;

    if (!results.length) {
      searchResults.innerHTML = '<div class="search-empty">Ничего не найдено</div>';
    } else {
      searchResults.innerHTML = results.map(s => `
        <div class="search-result" data-id="${s.id}" onclick="selectSong(${s.id})">
          <div class="sr-icon">${s.icon}</div>
          <div class="sr-text">
            <h4>${highlightMatch(s.title, q)}</h4>
            <p>${s.artist}</p>
          </div>
        </div>
      `).join('');
    }
    searchDropdown.classList.add('open');
  });

  searchInput.addEventListener('keydown', e => {
    const items = searchResults.querySelectorAll('.search-result');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedSearchIdx = Math.min(selectedSearchIdx + 1, items.length - 1);
      updateSearchHighlight(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedSearchIdx = Math.max(selectedSearchIdx - 1, 0);
      updateSearchHighlight(items);
    } else if (e.key === 'Enter' && selectedSearchIdx >= 0) {
      e.preventDefault();
      items[selectedSearchIdx].click();
    } else if (e.key === 'Escape') {
      closeSearch();
      searchInput.blur();
    }
  });

  function updateSearchHighlight(items) {
    items.forEach((el, i) => el.classList.toggle('active', i === selectedSearchIdx));
    if (items[selectedSearchIdx]) items[selectedSearchIdx].scrollIntoView({ block: 'nearest' });
  }

  function highlightMatch(text, query) {
    const idx = text.toLowerCase().indexOf(query);
    if (idx < 0) return text;
    return text.slice(0, idx) + '<mark style="background:var(--accent-soft);color:var(--accent);border-radius:2px;padding:0 2px">' + text.slice(idx, idx + query.length) + '</mark>' + text.slice(idx + query.length);
  }

  function closeSearch() {
    searchDropdown.classList.remove('open');
    selectedSearchIdx = -1;
  }

  document.addEventListener('click', e => {
    if (!e.target.closest('.search-wrapper')) closeSearch();
  });

  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // ========== Song Selection ==========
  window.selectSong = function(id) {
    const song = SONGS.find(s => s.id === id);
    if (!song) return;

    closeSearch();
    searchInput.value = song.title;
    stopSong();

    currentSong = song;
    showPlayer(song);
    renderNotes(song);
    startPlayback();
  };

  function showPlayer(song) {
    welcomeScreen.classList.add('hidden');
    playerEl.classList.add('active');
    noteSheet.classList.add('active');

    document.getElementById('playerIcon').textContent = song.icon;
    document.getElementById('playerTitle').textContent = song.title;
    document.getElementById('playerArtist').textContent = song.artist;
  }

  function renderNotes(song) {
    noteScroll.innerHTML = song.notes.map((n, i) => {
      if (n.n === 'REST') return `<div class="note-chip rest" data-idx="${i}">♩</div>`;
      return `<div class="note-chip" data-idx="${i}">${n.n}</div>`;
    }).join('');
  }

  // ========== Playback ==========
  function startPlayback() {
    PianoAudio.init();
    PianoAudio.resume();
    isPlaying = true;
    isPaused = false;
    noteIdx = 0;
    setPlayIcon(false);
    playNext();
  }

  function playNext() {
    if (!isPlaying || isPaused || !currentSong) return;

    if (noteIdx >= currentSong.notes.length) {
      stopSong();
      return;
    }

    const note = currentSong.notes[noteIdx];
    const tempo = parseFloat(tempoSlider.value) || 1;
    const bpm = currentSong.bpm || 100;
    const beatMs = (60000 / bpm) / tempo;
    const durationMs = note.d * beatMs;

    const chips = document.querySelectorAll('.note-chip');
    chips.forEach(c => c.classList.remove('current'));

    const active = chips[noteIdx];
    if (active) {
      active.classList.add('current');
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    for (let i = 0; i < noteIdx; i++) {
      if (chips[i]) chips[i].classList.add('played');
    }

    progressBar.style.width = ((noteIdx + 1) / currentSong.notes.length * 100) + '%';

    if (note.n !== 'REST') {
      PianoAudio.play(note.n, durationMs / 1000 * 0.9);
      Piano.highlight(note.n, durationMs * 0.85);
      Piano.scrollTo(note.n);
    }

    noteIdx++;
    playTimer = setTimeout(playNext, durationMs);
  }

  window.togglePlayPause = function() {
    if (!currentSong) return;

    if (!isPlaying) {
      startPlayback();
      return;
    }

    if (isPaused) {
      isPaused = false;
      setPlayIcon(false);
      playNext();
    } else {
      isPaused = true;
      clearTimeout(playTimer);
      setPlayIcon(true);
    }
  };

  window.stopSong = function() {
    isPlaying = false;
    isPaused = false;
    clearTimeout(playTimer);
    Piano.clearHighlights();
    document.querySelectorAll('.note-chip').forEach(c => {
      c.classList.remove('current', 'played');
    });
    progressBar.style.width = '0%';
    setPlayIcon(true);
  };

  window.restartSong = function() {
    if (!currentSong) return;
    stopSong();
    startPlayback();
  };

  function setPlayIcon(showPlay) {
    iconPlay.style.display = showPlay ? '' : 'none';
    iconPause.style.display = showPlay ? 'none' : '';
  }

  tempoSlider.addEventListener('input', () => {
    tempoValue.textContent = parseFloat(tempoSlider.value).toFixed(1) + '×';
  });

  // ========== Octave Controls ==========
  octaveRange.addEventListener('input', () => {
    const val = parseInt(octaveRange.value);
    octaveValue.textContent = val;
    Piano.setOctaves(val);
  });

  startOctaveEl.addEventListener('input', () => {
    const val = parseInt(startOctaveEl.value);
    startOctValue.textContent = 'C' + val;
    Piano.setStartOctave(val);
  });

  // ========== Computer Keyboard ==========
  const KEY_MAP = {
    'a':'C4','w':'C#4','s':'D4','e':'D#4','d':'E4','f':'F4',
    't':'F#4','g':'G4','y':'G#4','h':'A4','u':'A#4','j':'B4',
    'k':'C5','o':'C#5','l':'D5','p':'D#5'
  };
  const pressed = new Set();

  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.repeat) return;
    const note = KEY_MAP[e.key.toLowerCase()];
    if (note && !pressed.has(e.key)) {
      pressed.add(e.key);
      PianoAudio.play(note, 0.8);
      Piano.highlight(note, 300);
      Piano.scrollTo(note);
    }
  });
  document.addEventListener('keyup', e => pressed.delete(e.key));

})();
