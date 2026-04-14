/* ===== SOLF.AI PIANO PLAYER ===== */

(function () {
    'use strict';

    // ── Note helpers ──
    const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const NOTE_NAMES_RU = ['До', 'До#', 'Ре', 'Ре#', 'Ми', 'Фа', 'Фа#', 'Соль', 'Соль#', 'Ля', 'Ля#', 'Си'];

    function midiToFreq(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }
    function midiNoteName(midi) {
        return NOTE_NAMES[midi % 12] + Math.floor(midi / 12 - 1);
    }
    function midiNoteNameRu(midi) {
        return NOTE_NAMES_RU[midi % 12];
    }
    function isBlackKey(midi) {
        return [1, 3, 6, 8, 10].includes(midi % 12);
    }

    // ── Song database ──
    // Each note: [midi, startBeat, durationBeats]
    const SONGS = [
        {
            title: 'Twinkle Twinkle Little Star',
            artist: 'Детская',
            difficulty: 'Легко',
            bpm: 110,
            notes: [
                [60,0,1],[60,1,1],[67,2,1],[67,3,1],[69,4,1],[69,5,1],[67,6,2],
                [65,8,1],[65,9,1],[64,10,1],[64,11,1],[62,12,1],[62,13,1],[60,14,2],
                [67,16,1],[67,17,1],[65,18,1],[65,19,1],[64,20,1],[64,21,1],[62,22,2],
                [67,24,1],[67,25,1],[65,26,1],[65,27,1],[64,28,1],[64,29,1],[62,30,2],
                [60,32,1],[60,33,1],[67,34,1],[67,35,1],[69,36,1],[69,37,1],[67,38,2],
                [65,40,1],[65,41,1],[64,42,1],[64,43,1],[62,44,1],[62,45,1],[60,46,2]
            ]
        },
        {
            title: 'Happy Birthday',
            artist: 'Традиционная',
            difficulty: 'Легко',
            bpm: 100,
            notes: [
                [55,0,0.75],[55,0.75,0.25],[57,1,1],[55,2,1],[60,3,1],[59,4,2],
                [55,6,0.75],[55,6.75,0.25],[57,7,1],[55,8,1],[62,9,1],[60,10,2],
                [55,12,0.75],[55,12.75,0.25],[67,13,1],[64,14,1],[60,15,1],[59,16,1],[57,17,1],
                [65,18,0.75],[65,18.75,0.25],[64,19,1],[60,20,1],[62,21,1],[60,22,2]
            ]
        },
        {
            title: 'Für Elise',
            artist: 'Л. Бетховен',
            difficulty: 'Средне',
            bpm: 130,
            notes: [
                [76,0,0.5],[75,0.5,0.5],[76,1,0.5],[75,1.5,0.5],[76,2,0.5],[71,2.5,0.5],[74,3,0.5],[72,3.5,0.5],
                [69,4,1],[48,4,0.5],[52,4.5,0.5],[57,5,0.5],[69,5.5,0.5],
                [71,6,1],[52,6,0.5],[56,6.5,0.5],[60,7,0.5],[71,7.5,0.5],
                [72,8,1],[52,8,0.5],[56,8.5,0.5],[64,9,0.5],[76,9.5,0.5],
                [75,10,0.5],[76,10.5,0.5],[75,11,0.5],[76,11.5,0.5],
                [71,12,0.5],[74,12.5,0.5],[72,13,0.5],
                [69,13.5,1],[48,13.5,0.5],[52,14,0.5],[57,14.5,0.5],[69,15,0.5],
                [71,15.5,1],[52,15.5,0.5],[56,16,0.5],[60,16.5,0.5],[71,17,0.5],
                [72,17.5,1.5]
            ]
        },
        {
            title: 'Ode to Joy',
            artist: 'Л. Бетховен',
            difficulty: 'Легко',
            bpm: 108,
            notes: [
                [64,0,1],[64,1,1],[65,2,1],[67,3,1],[67,4,1],[65,5,1],[64,6,1],[62,7,1],
                [60,8,1],[60,9,1],[62,10,1],[64,11,1],[64,12,1.5],[62,13.5,0.5],[62,14,2],
                [64,16,1],[64,17,1],[65,18,1],[67,19,1],[67,20,1],[65,21,1],[64,22,1],[62,23,1],
                [60,24,1],[60,25,1],[62,26,1],[64,27,1],[62,28,1.5],[60,29.5,0.5],[60,30,2]
            ]
        },
        {
            title: 'Jingle Bells',
            artist: 'Рождественская',
            difficulty: 'Легко',
            bpm: 120,
            notes: [
                [64,0,1],[64,1,1],[64,2,2],[64,4,1],[64,5,1],[64,6,2],
                [64,8,1],[67,9,1],[60,10,1.5],[62,11.5,0.5],[64,12,4],
                [65,16,1],[65,17,1],[65,18,1.5],[65,19.5,0.5],[65,20,1],[64,21,1],[64,22,0.5],[64,22.5,0.5],
                [64,23,1],[62,24,1],[62,25,1],[64,26,1],[62,27,2],[67,29,2],
                [64,32,1],[64,33,1],[64,34,2],[64,36,1],[64,37,1],[64,38,2],
                [64,40,1],[67,41,1],[60,42,1.5],[62,43.5,0.5],[64,44,4],
                [65,48,1],[65,49,1],[65,50,1.5],[65,51.5,0.5],[65,52,1],[64,53,1],[64,54,0.5],[64,54.5,0.5],
                [67,55,1],[67,56,1],[65,57,1],[62,58,1],[60,59,4]
            ]
        },
        {
            title: 'Mary Had a Little Lamb',
            artist: 'Детская',
            difficulty: 'Легко',
            bpm: 110,
            notes: [
                [64,0,1],[62,1,1],[60,2,1],[62,3,1],[64,4,1],[64,5,1],[64,6,2],
                [62,8,1],[62,9,1],[62,10,2],[64,12,1],[67,13,1],[67,14,2],
                [64,16,1],[62,17,1],[60,18,1],[62,19,1],[64,20,1],[64,21,1],[64,22,1],[64,23,1],
                [62,24,1],[62,25,1],[64,26,1],[62,27,1],[60,28,4]
            ]
        },
        {
            title: 'Canon in D',
            artist: 'И. Пахельбель',
            difficulty: 'Средне',
            bpm: 72,
            notes: [
                [78,0,2],[76,2,2],[74,4,2],[73,6,2],
                [71,8,2],[69,10,2],[71,12,2],[73,14,2],
                [78,16,1],[74,17,1],[76,18,1],[73,19,1],[74,20,1],[71,21,1],[73,22,1],[69,23,1],
                [67,24,1],[71,25,1],[69,26,1],[73,27,1],[71,28,1],[74,29,1],[73,30,1],[76,31,1],
                [78,32,1],[74,33,1],[76,34,1],[73,35,1],[74,36,1],[71,37,1],[73,38,1],[69,39,1],
                [67,40,1],[71,41,1],[69,42,1],[73,43,1],[71,44,1],[74,45,1],[73,46,1],[76,47,1]
            ]
        },
        {
            title: 'Лунная соната',
            artist: 'Л. Бетховен',
            difficulty: 'Средне',
            bpm: 56,
            notes: [
                [49,0,0.33],[56,0.33,0.33],[61,0.67,0.33],
                [49,1,0.33],[56,1.33,0.33],[61,1.67,0.33],
                [49,2,0.33],[56,2.33,0.33],[61,2.67,0.33],
                [49,3,0.33],[56,3.33,0.33],[61,3.67,0.33],
                [49,4,0.33],[56,4.33,0.33],[61,4.67,0.33],
                [49,5,0.33],[56,5.33,0.33],[61,5.67,0.33],
                [49,6,0.33],[56,6.33,0.33],[61,6.67,0.33],
                [49,7,0.33],[56,7.33,0.33],[61,7.67,0.33],
                [44,8,0.33],[56,8.33,0.33],[61,8.67,0.33],
                [44,9,0.33],[56,9.33,0.33],[61,9.67,0.33],
                [44,10,0.33],[56,10.33,0.33],[61,10.67,0.33],
                [44,11,0.33],[56,11.33,0.33],[61,11.67,0.33],
                [45,12,0.33],[57,12.33,0.33],[61,12.67,0.33],
                [45,13,0.33],[57,13.33,0.33],[61,13.67,0.33],
                [45,14,0.33],[57,14.33,0.33],[61,14.67,0.33],
                [45,15,0.33],[57,15.33,0.33],[61,15.67,0.33]
            ]
        },
        {
            title: 'River Flows in You',
            artist: 'Yiruma',
            difficulty: 'Средне',
            bpm: 68,
            notes: [
                [69,0,0.5],[71,0.5,0.5],[76,1,1],[74,2,0.5],[76,2.5,0.5],[74,3,0.5],[71,3.5,0.5],
                [69,4,0.5],[71,4.5,0.5],[76,5,1],[74,6,0.5],[76,6.5,0.5],[74,7,0.5],[71,7.5,0.5],
                [69,8,0.5],[71,8.5,0.5],[76,9,1],[78,10,0.5],[76,10.5,0.5],[74,11,0.5],[71,11.5,0.5],
                [69,12,1],[66,13,0.5],[69,13.5,0.5],[71,14,2],
                [69,16,0.5],[71,16.5,0.5],[76,17,1],[74,18,0.5],[76,18.5,0.5],[74,19,0.5],[71,19.5,0.5],
                [69,20,0.5],[71,20.5,0.5],[76,21,1],[74,22,0.5],[76,22.5,0.5],[78,23,0.5],[81,23.5,0.5],
                [78,24,1],[76,25,1],[74,26,1],[71,27,0.5],[69,27.5,0.5],
                [69,28,4]
            ]
        },
        {
            title: 'Comptine d\'un autre été',
            artist: 'Yann Tiersen',
            difficulty: 'Средне',
            bpm: 100,
            notes: [
                [64,0,0.5],[67,0.5,0.5],[71,1,0.5],[72,1.5,0.5],[76,2,1],[72,3,0.5],[71,3.5,0.5],
                [64,4,0.5],[67,4.5,0.5],[71,5,0.5],[72,5.5,0.5],[76,6,1],[72,7,0.5],[71,7.5,0.5],
                [64,8,0.5],[69,8.5,0.5],[72,9,0.5],[74,9.5,0.5],[76,10,1],[74,11,0.5],[72,11.5,0.5],
                [64,12,0.5],[69,12.5,0.5],[72,13,0.5],[74,13.5,0.5],[76,14,1],[74,15,0.5],[72,15.5,0.5],
                [64,16,0.5],[67,16.5,0.5],[71,17,0.5],[72,17.5,0.5],[76,18,1],[72,19,0.5],[71,19.5,0.5],
                [64,20,0.5],[67,20.5,0.5],[71,21,0.5],[72,21.5,0.5],[76,22,1],[72,23,0.5],[71,23.5,0.5],
                [62,24,0.5],[66,24.5,0.5],[69,25,0.5],[72,25.5,0.5],[76,26,1],[72,27,0.5],[69,27.5,0.5],
                [60,28,0.5],[64,28.5,0.5],[67,29,0.5],[72,29.5,0.5],[71,30,2]
            ]
        },
        {
            title: 'Hedwig\'s Theme',
            artist: 'Гарри Поттер',
            difficulty: 'Средне',
            bpm: 78,
            notes: [
                [71,0,1],[76,1,1.5],[78,2.5,0.5],[77,3,1],[76,4,2],[81,6,1],[80,7,3],
                [77,10,3],
                [76,13,1.5],[78,14.5,0.5],[77,15,1],[75,16,2],[76,18,1],[71,19,3],
                [71,22,1],[76,23,1.5],[78,24.5,0.5],[77,25,1],[76,26,2],[81,28,1],
                [83,29,2],[82,31,1],[79,32,2],[80,34,1],[76,35,3]
            ]
        },
        {
            title: 'Star Wars Theme',
            artist: 'Дж. Уильямс',
            difficulty: 'Средне',
            bpm: 108,
            notes: [
                [55,0,0.5],[55,0.5,0.5],[55,1,0.5],[60,1.5,2],
                [67,3.5,2],[65,5.5,0.5],[64,6,0.5],[62,6.5,0.5],[72,7,2],[67,9,1],
                [65,10,0.5],[64,10.5,0.5],[62,11,0.5],[72,11.5,2],[67,13.5,1],
                [65,14.5,0.5],[64,15,0.5],[65,15.5,0.5],[62,16,2],
                [55,18,0.5],[55,18.5,0.5],[55,19,0.5],[60,19.5,2],
                [67,21.5,2],[65,23.5,0.5],[64,24,0.5],[62,24.5,0.5],[72,25,2],[67,27,1],
                [65,28,0.5],[64,28.5,0.5],[62,29,0.5],[72,29.5,2],[67,31.5,1],
                [65,32.5,0.5],[64,33,0.5],[65,33.5,0.5],[62,34,2]
            ]
        },
        {
            title: 'Game of Thrones',
            artist: 'Р. Джавади',
            difficulty: 'Средне',
            bpm: 85,
            notes: [
                [55,0,2],[58,2,2],[60,4,1],[62,5,1],[58,6,2],[53,8,2],[55,10,1],[53,11,1],
                [55,12,2],[58,14,2],[60,16,1],[62,17,1],[58,18,2],[53,20,2],[55,22,1],[58,23,1],
                [60,24,2],[62,26,2],[63,28,1],[65,29,1],[62,30,2],[58,32,2],[60,34,1],[58,35,1],
                [55,36,2],[53,38,2],[55,40,4]
            ]
        },
        {
            title: 'Pirates of the Caribbean',
            artist: 'Х. Циммер',
            difficulty: 'Средне',
            bpm: 120,
            notes: [
                [62,0,0.5],[64,0.5,0.5],[65,1,1],[65,2,0.5],[64,2.5,0.5],[65,3,0.5],[67,3.5,0.5],
                [69,4,1],[69,5,0.5],[67,5.5,0.5],[69,6,0.5],[71,6.5,0.5],
                [72,7,1.5],[71,8.5,0.5],[69,9,0.5],[71,9.5,0.5],[69,10,0.5],[67,10.5,0.5],[65,11,1],[62,12,0.5],[64,12.5,0.5],
                [65,13,1],[65,14,0.5],[64,14.5,0.5],[65,15,0.5],[67,15.5,0.5],
                [69,16,1],[69,17,0.5],[67,17.5,0.5],[69,18,0.5],[71,18.5,0.5],
                [72,19,1.5],[71,20.5,0.5],[69,21,0.5],[71,21.5,0.5],[69,22,0.5],[67,22.5,0.5],
                [65,23,2]
            ]
        },
        {
            title: 'Interstellar Theme',
            artist: 'Х. Циммер',
            difficulty: 'Средне',
            bpm: 70,
            notes: [
                [69,0,2],[72,2,2],[76,4,2],[81,6,2],
                [79,8,2],[76,10,2],[72,12,2],[69,14,2],
                [69,16,2],[72,18,2],[74,20,2],[79,22,2],
                [76,24,2],[74,26,2],[72,28,2],[69,30,2],
                [69,32,2],[72,34,2],[76,36,2],[81,38,2],
                [84,40,4],[81,44,4],
                [76,48,2],[72,50,2],[69,52,4]
            ]
        }
    ];

    // ── Piano App ──
    const FIRST_MIDI = 21;  // A0
    const LAST_MIDI = 108;  // C8
    const TOTAL_KEYS = LAST_MIDI - FIRST_MIDI + 1;

    let audioCtx = null;
    let pianoKeys = {};            // midi -> DOM element
    let minimapKeys = {};          // midi -> DOM element
    let activeOscillators = {};    // midi -> { osc[], gain }

    let currentSong = null;
    let isPlaying = false;
    let playbackStartTime = 0;
    let playbackOffset = 0;        // how far into the song (in seconds)
    let playSpeed = 1;
    let scheduledTimeouts = [];
    let animFrameId = null;

    // DOM refs
    const $ = id => document.getElementById(id);
    const searchInput = $('searchInput');
    const clearBtn = $('clearSearch');
    const resultsEl = $('searchResults');
    const nowPlayingEl = $('nowPlaying');
    const npTitle = $('npTitle');
    const npArtist = $('npArtist');
    const playBtn = $('playBtn');
    const stopBtn = $('stopBtn');
    const restartBtn = $('restartBtn');
    const progressBar = $('progressBar');
    const timeElapsed = $('timeElapsed');
    const timeDuration = $('timeDuration');
    const noteNameEl = $('currentNoteName');
    const noteOctaveEl = $('currentNoteOctave');
    const pianoViewport = $('pianoViewport');
    const pianoKeyboard = $('pianoKeyboard');
    const octaveSlider = $('octaveSlider');
    const octaveLeftBtn = $('octaveLeft');
    const octaveRightBtn = $('octaveRight');
    const minimapEl = $('pianoMinimap');
    const minimapKeysEl = $('minimapKeys');
    const minimapViewportEl = $('minimapViewport');
    const waterfallCanvas = $('waterfallCanvas');
    const waterfallContainer = $('waterfallContainer');
    const themeToggle = $('themeToggle');

    // ── Audio engine ──
    function ensureAudio() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }

    function playMidiNote(midi, duration) {
        ensureAudio();
        const freq = midiToFreq(midi);
        const now = audioCtx.currentTime;

        const masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(0.25, now + 0.01);
        masterGain.gain.exponentialRampToValueAtTime(0.15, now + 0.1);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.5);
        masterGain.connect(audioCtx.destination);

        const harmonics = [
            { type: 'sine', mult: 1, vol: 1 },
            { type: 'sine', mult: 2, vol: 0.4 },
            { type: 'sine', mult: 3, vol: 0.15 },
            { type: 'triangle', mult: 4, vol: 0.06 },
        ];

        const oscs = harmonics.map(h => {
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.type = h.type;
            osc.frequency.setValueAtTime(freq * h.mult, now);
            g.gain.setValueAtTime(h.vol, now);
            osc.connect(g);
            g.connect(masterGain);
            osc.start(now);
            osc.stop(now + duration + 0.6);
            return osc;
        });

        if (activeOscillators[midi]) {
            try { activeOscillators[midi].gain.gain.cancelScheduledValues(now); activeOscillators[midi].gain.gain.setValueAtTime(0.001, now); } catch (_) {}
        }
        activeOscillators[midi] = { oscs, gain: masterGain };
        setTimeout(() => { delete activeOscillators[midi]; }, (duration + 0.7) * 1000);
    }

    // ── Build piano keyboard ──
    function buildPiano() {
        pianoKeyboard.innerHTML = '';
        pianoKeys = {};
        minimapKeysEl.innerHTML = '';
        minimapKeys = {};

        for (let m = FIRST_MIDI; m <= LAST_MIDI; m++) {
            const black = isBlackKey(m);
            const key = document.createElement('div');
            key.className = 'key ' + (black ? 'key-black' : 'key-white');
            key.dataset.midi = m;

            const label = document.createElement('span');
            label.className = 'key-label';
            label.textContent = NOTE_NAMES[m % 12] + (Math.floor(m / 12 - 1));
            key.appendChild(label);

            pianoKeyboard.appendChild(key);
            pianoKeys[m] = key;

            // minimap
            const mm = document.createElement('div');
            const whiteW = minimapEl.clientWidth / 52;
            mm.style.width = whiteW + 'px';
            if (black) {
                mm.className = 'minimap-key-b';
                mm.style.width = (whiteW * 0.6) + 'px';
            } else {
                mm.className = 'minimap-key-w';
            }
            minimapKeysEl.appendChild(mm);
            minimapKeys[m] = mm;

            // Touch / click
            const onDown = e => {
                e.preventDefault();
                ensureAudio();
                highlightKey(m, true);
                playMidiNote(m, 0.8);
                showNote(m);
            };
            const onUp = e => {
                e.preventDefault();
                highlightKey(m, false);
            };
            key.addEventListener('pointerdown', onDown);
            key.addEventListener('pointerup', onUp);
            key.addEventListener('pointerleave', onUp);
        }

        updateMinimapSize();
    }

    function highlightKey(midi, on) {
        const k = pianoKeys[midi];
        if (!k) return;
        if (on) { k.classList.add('active'); } else { k.classList.remove('active'); }
        const mm = minimapKeys[midi];
        if (mm) { if (on) mm.classList.add('mm-active'); else mm.classList.remove('mm-active'); }
    }

    function showNote(midi) {
        noteNameEl.textContent = midiNoteNameRu(midi);
        noteOctaveEl.textContent = Math.floor(midi / 12 - 1);
        noteNameEl.classList.add('pop');
        setTimeout(() => noteNameEl.classList.remove('pop'), 200);
    }

    // ── Scroll / Octave slider ──
    function syncSliderToScroll() {
        const vp = pianoViewport;
        const maxScroll = vp.scrollWidth - vp.clientWidth;
        if (maxScroll <= 0) { octaveSlider.value = 0; return; }
        octaveSlider.value = (vp.scrollLeft / maxScroll) * 100;
        updateMinimapViewport();
    }

    function syncScrollToSlider() {
        const vp = pianoViewport;
        const maxScroll = vp.scrollWidth - vp.clientWidth;
        vp.scrollLeft = (octaveSlider.value / 100) * maxScroll;
        updateMinimapViewport();
    }

    function scrollToMidi(midi) {
        const key = pianoKeys[midi];
        if (!key) return;
        const vp = pianoViewport;
        const keyCenter = key.offsetLeft + key.offsetWidth / 2;
        const vpCenter = vp.clientWidth / 2;
        vp.scrollTo({ left: keyCenter - vpCenter, behavior: 'smooth' });
    }

    function updateMinimapViewport() {
        const vp = pianoViewport;
        const totalW = vp.scrollWidth;
        const viewW = vp.clientWidth;
        if (totalW <= 0) return;
        const mmW = minimapEl.clientWidth;
        const left = (vp.scrollLeft / totalW) * mmW;
        const width = (viewW / totalW) * mmW;
        minimapViewportEl.style.left = left + 'px';
        minimapViewportEl.style.width = width + 'px';
    }

    function updateMinimapSize() {
        const whiteCount = Object.values(pianoKeys).filter(k => k.classList.contains('key-white')).length;
        const mmW = minimapEl.clientWidth || 300;
        const ww = mmW / whiteCount;
        let idx = 0;
        for (let m = FIRST_MIDI; m <= LAST_MIDI; m++) {
            const mm = minimapKeys[m];
            if (!mm) continue;
            if (isBlackKey(m)) {
                mm.style.width = Math.max(ww * 0.6, 2) + 'px';
            } else {
                mm.style.width = Math.max(ww, 2) + 'px';
                idx++;
            }
        }
        updateMinimapViewport();
    }

    // ── Search ──
    function setupSearch() {
        searchInput.addEventListener('input', () => {
            const q = searchInput.value.trim().toLowerCase();
            clearBtn.classList.toggle('hidden', !q);
            if (!q) { resultsEl.classList.add('hidden'); return; }

            const matches = SONGS.filter(s =>
                s.title.toLowerCase().includes(q) ||
                s.artist.toLowerCase().includes(q)
            );

            if (matches.length === 0) {
                resultsEl.innerHTML = '<div class="search-item"><div class="search-item-info"><div class="search-item-title">Ничего не найдено</div></div></div>';
            } else {
                resultsEl.innerHTML = matches.map((s, i) => `
                    <div class="search-item" data-song-idx="${SONGS.indexOf(s)}">
                        <div class="search-item-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                        </div>
                        <div class="search-item-info">
                            <div class="search-item-title">${s.title}</div>
                            <div class="search-item-artist">${s.artist}</div>
                        </div>
                        <div class="search-item-diff">${s.difficulty}</div>
                    </div>
                `).join('');
            }
            resultsEl.classList.remove('hidden');
        });

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.classList.add('hidden');
            resultsEl.classList.add('hidden');
        });

        resultsEl.addEventListener('click', e => {
            const item = e.target.closest('.search-item');
            if (!item || item.dataset.songIdx == null) return;
            const song = SONGS[+item.dataset.songIdx];
            if (song) loadSong(song);
            resultsEl.classList.add('hidden');
            searchInput.value = '';
            clearBtn.classList.add('hidden');
        });

        document.addEventListener('click', e => {
            if (!e.target.closest('.search-section')) resultsEl.classList.add('hidden');
        });
    }

    // ── Playback ──
    function loadSong(song) {
        stopSong();
        currentSong = song;
        nowPlayingEl.classList.remove('hidden');
        npTitle.textContent = song.title;
        npArtist.textContent = song.artist;
        const dur = songDuration(song);
        timeDuration.textContent = fmtTime(dur);
        timeElapsed.textContent = '0:00';
        progressBar.value = 0;
        playSong();
    }

    function songDuration(song) {
        let maxEnd = 0;
        for (const n of song.notes) {
            const end = (n[1] + n[2]) * (60 / song.bpm);
            if (end > maxEnd) maxEnd = end;
        }
        return maxEnd;
    }

    function playSong() {
        if (!currentSong) return;
        ensureAudio();
        isPlaying = true;
        updatePlayIcon();
        const song = currentSong;
        const beatLen = (60 / song.bpm) / playSpeed;
        const dur = songDuration(song) / playSpeed;

        playbackStartTime = performance.now() - (playbackOffset / playSpeed) * 1000;

        clearScheduled();
        for (const n of song.notes) {
            const noteStart = n[1] * beatLen - (playbackOffset / playSpeed);
            const noteDur = n[2] * beatLen;
            const midi = n[0];
            if (noteStart < -noteDur) continue;

            const startMs = Math.max(noteStart, 0) * 1000;
            const t = setTimeout(() => {
                playMidiNote(midi, noteDur);
                highlightKey(midi, true);
                showNote(midi);
                scrollToMidi(midi);
                setTimeout(() => highlightKey(midi, false), noteDur * 1000);
            }, startMs);
            scheduledTimeouts.push(t);
        }

        const endT = setTimeout(() => {
            stopSong();
            playbackOffset = 0;
            progressBar.value = 0;
            timeElapsed.textContent = '0:00';
        }, (dur - playbackOffset / playSpeed) * 1000 + 200);
        scheduledTimeouts.push(endT);

        startWaterfallLoop();
    }

    function pauseSong() {
        isPlaying = false;
        updatePlayIcon();
        const elapsed = (performance.now() - playbackStartTime) / 1000 * playSpeed;
        playbackOffset = elapsed;
        clearScheduled();
        cancelAnimationFrame(animFrameId);
    }

    function stopSong() {
        isPlaying = false;
        playbackOffset = 0;
        updatePlayIcon();
        clearScheduled();
        cancelAnimationFrame(animFrameId);
        clearAllKeys();
        noteNameEl.textContent = '—';
        noteOctaveEl.textContent = '';
    }

    function clearScheduled() {
        scheduledTimeouts.forEach(t => clearTimeout(t));
        scheduledTimeouts = [];
    }

    function clearAllKeys() {
        for (let m = FIRST_MIDI; m <= LAST_MIDI; m++) highlightKey(m, false);
    }

    function updatePlayIcon() {
        const play = playBtn.querySelector('.play-icon');
        const pause = playBtn.querySelector('.pause-icon');
        play.style.display = isPlaying ? 'none' : '';
        pause.style.display = isPlaying ? '' : 'none';
    }

    function fmtTime(sec) {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return m + ':' + String(s).padStart(2, '0');
    }

    function setupControls() {
        playBtn.addEventListener('click', () => {
            ensureAudio();
            if (isPlaying) pauseSong(); else playSong();
        });
        stopBtn.addEventListener('click', () => {
            stopSong();
            progressBar.value = 0;
            timeElapsed.textContent = '0:00';
        });
        restartBtn.addEventListener('click', () => {
            stopSong();
            playbackOffset = 0;
            progressBar.value = 0;
            timeElapsed.textContent = '0:00';
            playSong();
        });

        progressBar.addEventListener('input', () => {
            if (!currentSong) return;
            const dur = songDuration(currentSong);
            playbackOffset = (progressBar.value / 100) * dur;
            timeElapsed.textContent = fmtTime(playbackOffset);
            if (isPlaying) {
                clearScheduled();
                cancelAnimationFrame(animFrameId);
                clearAllKeys();
                playSong();
            }
        });

        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                playSpeed = +btn.dataset.speed;
                if (isPlaying && currentSong) {
                    const dur = songDuration(currentSong);
                    const elapsed = (performance.now() - playbackStartTime) / 1000 * (60 / currentSong.bpm);
                    playbackOffset = Math.min((performance.now() - playbackStartTime) / 1000 * playSpeed, dur);
                    clearScheduled();
                    cancelAnimationFrame(animFrameId);
                    clearAllKeys();
                    playSong();
                }
            });
        });
    }

    // ── Progress update loop ──
    function startProgressLoop() {
        (function tick() {
            if (isPlaying && currentSong) {
                const dur = songDuration(currentSong);
                const elapsed = (performance.now() - playbackStartTime) / 1000 * playSpeed;
                const clamped = Math.min(elapsed, dur);
                progressBar.value = (clamped / dur) * 100;
                timeElapsed.textContent = fmtTime(clamped);
            }
            requestAnimationFrame(tick);
        })();
    }

    // ── Waterfall (falling notes) ──
    const WATERFALL_LOOKAHEAD = 3; // seconds

    function startWaterfallLoop() {
        cancelAnimationFrame(animFrameId);
        drawWaterfall();
    }

    function drawWaterfall() {
        if (!currentSong) { animFrameId = requestAnimationFrame(drawWaterfall); return; }

        const canvas = waterfallCanvas;
        const rect = waterfallContainer.getBoundingClientRect();
        canvas.width = rect.width * (window.devicePixelRatio || 1);
        canvas.height = rect.height * (window.devicePixelRatio || 1);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
        const W = rect.width;
        const H = rect.height;

        ctx.clearRect(0, 0, W, H);

        const song = currentSong;
        const beatLen = 60 / song.bpm;
        const now = isPlaying
            ? (performance.now() - playbackStartTime) / 1000 * playSpeed
            : playbackOffset;

        const vpScrollLeft = pianoViewport.scrollLeft;
        const vpWidth = pianoViewport.clientWidth;
        const kbWidth = pianoViewport.scrollWidth;

        for (const n of song.notes) {
            const midi = n[0];
            const noteStartSec = n[1] * beatLen;
            const noteDurSec = n[2] * beatLen;
            const noteEndSec = noteStartSec + noteDurSec;

            const dt = noteStartSec - now;
            if (dt > WATERFALL_LOOKAHEAD || noteEndSec < now - 0.1) continue;

            const keyEl = pianoKeys[midi];
            if (!keyEl) continue;

            const keyLeft = keyEl.offsetLeft;
            const keyWidth = keyEl.offsetWidth;

            const xRatio = (keyLeft - vpScrollLeft) / vpWidth;
            const wRatio = keyWidth / vpWidth;
            const x = xRatio * W;
            const w = wRatio * W;

            if (x + w < -10 || x > W + 10) continue;

            const yBottom = H;
            const pxPerSec = H / WATERFALL_LOOKAHEAD;
            const y = yBottom - (dt + noteDurSec) * pxPerSec;
            const h = noteDurSec * pxPerSec;

            const isBlk = isBlackKey(midi);
            const alpha = dt < 0 ? Math.max(0.3, 1 + dt / noteDurSec) : 0.85;

            if (isBlk) {
                ctx.fillStyle = `rgba(124, 58, 237, ${alpha})`;
            } else {
                ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
            }
            const r = 4;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.fill();

            if (dt <= 0 && dt > -noteDurSec) {
                ctx.shadowColor = 'rgba(139,92,246,0.6)';
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        // Strike line
        ctx.strokeStyle = 'rgba(139,92,246,0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(0, H - 1);
        ctx.lineTo(W, H - 1);
        ctx.stroke();
        ctx.setLineDash([]);

        if (isPlaying) {
            animFrameId = requestAnimationFrame(drawWaterfall);
        }
    }

    // ── Theme ──
    function setupTheme() {
        themeToggle.addEventListener('click', () => {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            if (isLight) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.removeItem('solfai_theme');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('solfai_theme', 'light');
            }
        });
    }

    // ── Octave nav buttons ──
    function setupOctaveNav() {
        pianoViewport.addEventListener('scroll', syncSliderToScroll);
        octaveSlider.addEventListener('input', syncScrollToSlider);

        octaveLeftBtn.addEventListener('click', () => {
            pianoViewport.scrollBy({ left: -200, behavior: 'smooth' });
        });
        octaveRightBtn.addEventListener('click', () => {
            pianoViewport.scrollBy({ left: 200, behavior: 'smooth' });
        });

        // Minimap click to scroll
        minimapEl.addEventListener('click', e => {
            const rect = minimapEl.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            const maxScroll = pianoViewport.scrollWidth - pianoViewport.clientWidth;
            pianoViewport.scrollTo({ left: ratio * maxScroll, behavior: 'smooth' });
        });

        // Octave labels
        const labelsEl = $('octaveLabels');
        for (let o = 0; o <= 8; o++) {
            const sp = document.createElement('span');
            sp.className = 'octave-mark';
            sp.textContent = 'C' + o;
            labelsEl.appendChild(sp);
        }
    }

    // ── Keyboard shortcuts ──
    function setupKeyboard() {
        const keyMap = {
            'a': 60, 'w': 61, 's': 62, 'e': 63, 'd': 64, 'f': 65,
            't': 66, 'g': 67, 'y': 68, 'h': 69, 'u': 70, 'j': 71,
            'k': 72, 'o': 73, 'l': 74, 'p': 75,
        };
        const held = {};
        document.addEventListener('keydown', e => {
            if (e.target.tagName === 'INPUT') return;
            const midi = keyMap[e.key.toLowerCase()];
            if (midi && !held[midi]) {
                held[midi] = true;
                ensureAudio();
                highlightKey(midi, true);
                playMidiNote(midi, 1.0);
                showNote(midi);
            }
            if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                if (currentSong) { if (isPlaying) pauseSong(); else playSong(); }
            }
        });
        document.addEventListener('keyup', e => {
            const midi = keyMap[e.key.toLowerCase()];
            if (midi) {
                held[midi] = false;
                highlightKey(midi, false);
            }
        });
    }

    // ── Resize handler ──
    function setupResize() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                updateMinimapSize();
                if (!isPlaying && currentSong) drawWaterfall();
            }, 150);
        });
    }

    // ── Init ──
    function init() {
        buildPiano();
        setupSearch();
        setupControls();
        setupOctaveNav();
        setupTheme();
        setupKeyboard();
        setupResize();
        startProgressLoop();

        // Initial scroll to middle C area
        setTimeout(() => {
            scrollToMidi(60);
            syncSliderToScroll();
        }, 100);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
