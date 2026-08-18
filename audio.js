// Frequencies (Hz)
const N = {
  Bb1: 58.27,  Eb2: 77.78,  E2: 82.41,  F2: 87.31,  Gb2: 92.50,  G2: 98.00,
  Bb2: 116.54, Eb3: 155.56, E3: 164.81, F3: 174.61, Gb3: 185.00, G3: 196.00,
  Bb3: 233.08, B3:  246.94, C4: 261.63, Db4: 277.18, D4: 293.66, Eb4: 311.13,
  E4:  329.63, F4:  349.23, Gb4: 369.99, G4: 392.00, Ab4: 415.30, A4: 440.00, Bb4: 466.16,
  C5:  523.25, Db5: 554.37, Eb5: 622.25, F5: 698.46
};

const PWR = {
  G5:  [N.G3, N.D4, N.G4],
  Gb5: [N.Gb3, N.Db4, N.Gb4],
  F5:  [N.F3, N.C4, N.F4],
  E5:  [N.E3, N.B3, N.E4]
};

const EbMinArp  = [N.Eb4, N.Gb4, N.Bb4, N.Eb5, N.Bb4, N.Gb4, N.Eb4, N.Gb4];
const FMajArp   = [N.F4,  N.A4,  N.C5,  N.F5,  N.C5,  N.A4,  N.F4,  N.A4];
const BbMin9Arp = [N.Bb3, N.Db4, N.F4,  N.Ab4, N.C5,  N.Ab4, N.F4,  N.Db4];

const BEAT = 60 / 90; // 0.6667s per beat

const SEQUENCE = [
  ...EbMinArp.map(note => [note, N.Eb2]),
  ...FMajArp.map(note => [note, N.F2]),
  ...EbMinArp.map(note => [note, N.Eb2]),
  ...BbMin9Arp.map(note => [note, N.Bb1]),
  [PWR.G5,  N.G2],  [PWR.G5,  N.G2],
  [PWR.Gb5, N.Gb2], [PWR.Gb5, N.Gb2],
  [PWR.F5,  N.F2],  [PWR.F5,  N.F2],
  [PWR.E5,  N.E2],  [PWR.E5,  N.E2]
];

let audioCtx = null;
let bakedBuffer = null;
let currentSource = null;

// 1. Pre-bake the track in memory using OfflineAudioContext
export async function bakeAudio() {
  if (bakedBuffer) return;

  const totalDuration = SEQUENCE.length * BEAT;
  const sampleRate = 22050; // 22.05kHz mono saves memory & CPU
  const offlineCtx = new OfflineAudioContext(1, sampleRate * totalDuration, sampleRate);

  // Render Sub-bass Drone
  const bassOsc = offlineCtx.createOscillator();
  const bassGain = offlineCtx.createGain();
  bassOsc.type = 'triangle';
  bassGain.gain.setValueAtTime(0.25, 0);
  bassOsc.connect(bassGain);
  bassGain.connect(offlineCtx.destination);
  bassOsc.start(0);

  // Schedule every note across the offline timeline
  SEQUENCE.forEach(([melodyItem, rootFreq], index) => {
    const time = index * BEAT;

    // Glide bass frequency
    bassOsc.frequency.setTargetAtTime(rootFreq, time, 0.05);

    // Schedule lead/power chord notes
    const freqs = Array.isArray(melodyItem) ? melodyItem : [melodyItem];
    const isPowerChord = freqs.length > 1;

    const gain = offlineCtx.createGain();
    const volume = isPowerChord ? 0.08 : 0.12;

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + BEAT * 0.9);
    gain.connect(offlineCtx.destination);

    freqs.forEach(freq => {
      if (!freq) return;
      const osc = offlineCtx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);
      osc.connect(gain);
      osc.start(time);
      osc.stop(time + BEAT * 0.9);
    });
  });

  // Render the audio graph into PCM memory buffer
  bakedBuffer = await offlineCtx.startRendering();
}

// 2. Play the seamless pre-baked audio loop
export async function startArpeggiator() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  // Pre-bake if not already done during title screen
  if (!bakedBuffer) {
    await bakeAudio();
  }

  if (currentSource) return;

  // Stream directly from native Web Audio buffer
  currentSource = audioCtx.createBufferSource();
  currentSource.buffer = bakedBuffer;
  currentSource.loop = true; // Flawless hardware-level looping
  currentSource.connect(audioCtx.destination);
  currentSource.start(0);
}
