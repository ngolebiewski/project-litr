// Frequencies (Hz)
const N = {
  // Bass Drone Roots
  Bb1: 58.27,  Eb2: 77.78,  E2: 82.41,  F2: 87.31,  Gb2: 92.50,  G2: 98.00,
  
  // Mid / Highs
  Bb2: 116.54, Eb3: 155.56, E3: 164.81, F3: 174.61, Gb3: 185.00, G3: 196.00,
  Bb3: 233.08, B3:  246.94, C4: 261.63, Db4: 277.18, D4: 293.66, Eb4: 311.13,
  E4:  329.63, F4:  349.23, Gb4: 369.99, G4: 392.00, Ab4: 415.30, A4: 440.00, Bb4: 466.16,
  C5:  523.25, Db5: 554.37, Eb5: 622.25, F5: 698.46
};

// Power Chords for the turnaround
const PWR = {
  G5:  [N.G3,  N.D4,  N.G4],
  Gb5: [N.Gb3, N.Db4, N.Gb4],
  F5:  [N.F3,  N.C4,  N.F4],
  E5:  [N.E3,  N.B3,  N.E4] // E4 is now defined!
};

// Arpeggios (8 quarter notes each)
const EbMinArp  = [N.Eb4, N.Gb4, N.Bb4, N.Eb5, N.Bb4, N.Gb4, N.Eb4, N.Gb4];
const FMajArp   = [N.F4,  N.A4,  N.C5,  N.F5,  N.C5,  N.A4,  N.F4,  N.A4];
const BbMin9Arp = [N.Bb3, N.Db4, N.F4,  N.Ab4, N.C5,  N.Ab4, N.F4,  N.Db4];

const BEAT = 60 / 90; // 90 BPM

// Sequence pairs: [Melody/Chord Item, Bass Root Frequency]
const SEQUENCE = [
  // Measures 1-2: Eb min -> Root: Eb2
  ...EbMinArp.map(note => [note, N.Eb2]),
  // Measures 3-4: F maj -> Root: F2
  ...FMajArp.map(note => [note, N.F2]),
  // Measures 5-6: Eb min -> Root: Eb2
  ...EbMinArp.map(note => [note, N.Eb2]),
  // Measures 7-8: Bb min9 -> Root: Bb1
  ...BbMin9Arp.map(note => [note, N.Bb1]),
  
  // Measures 9-10: Turnaround -> Root follows power chord bases
  [PWR.G5,  N.G2],  [PWR.G5,  N.G2],
  [PWR.Gb5, N.Gb2], [PWR.Gb5, N.Gb2],
  [PWR.F5,  N.F2],  [PWR.F5,  N.F2],
  [PWR.E5,  N.E2],  [PWR.E5,  N.E2]
];

let audioCtx = null;
let bassOsc = null;
let bassGain = null;
let isPlaying = false;

export function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  bassOsc = audioCtx.createOscillator();
  bassGain = audioCtx.createGain();

  bassOsc.type = 'triangle';
  bassGain.gain.setValueAtTime(0.25, audioCtx.currentTime);

  bassOsc.connect(bassGain);
  bassGain.connect(audioCtx.destination);
  bassOsc.start();
}

function updateBassDrone(rootFreq) {
  if (!bassOsc || !rootFreq) return;
  bassOsc.frequency.setTargetAtTime(rootFreq, audioCtx.currentTime, 0.05);
}

function playStep(item, duration) {
  if (!audioCtx) return;

  const freqs = Array.isArray(item) ? item : [item];
  const isPowerChord = freqs.length > 1;

  const gain = audioCtx.createGain();
  const volume = isPowerChord ? 0.08 : 0.12;

  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration * 0.9);
  gain.connect(audioCtx.destination);

  freqs.forEach(freq => {
    if (!freq) return; // Guard against missing frequencies
    const osc = audioCtx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.connect(gain);
    osc.start();
    osc.stop(audioCtx.currentTime + duration * 0.9);
  });
}

export function startArpeggiator() {
  initAudio();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  if (isPlaying) return;
  isPlaying = true;

  let step = 0;

  function tick() {
    if (!isPlaying) return;

    const [melodyItem, rootFreq] = SEQUENCE[step];

    updateBassDrone(rootFreq);
    playStep(melodyItem, BEAT);

    step = (step + 1) % SEQUENCE.length;
    setTimeout(tick, BEAT * 1000);
  }

  tick();
}
