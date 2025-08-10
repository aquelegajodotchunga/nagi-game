let audioContext: AudioContext | null = null;

/**
 * Initializes the AudioContext. Must be called as a result of a user gesture (e.g., a click).
 */
export const initAudio = () => {
  if (typeof window !== 'undefined' && !audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser.");
    }
  }
};

/**
 * Plays a synthesized crash sound.
 */
export const playCrashSound = () => {
  if (!audioContext) return;

  const noiseSource = audioContext.createBufferSource();
  const bufferSize = audioContext.sampleRate * 0.5; // 0.5 second buffer
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  noiseSource.buffer = buffer;

  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

  noiseSource.connect(gainNode);
  gainNode.connect(audioContext.destination);
  noiseSource.start();
  noiseSource.stop(audioContext.currentTime + 0.5);
};

/**
 * Plays a synthesized score sound.
 */
export const playScoreSound = () => {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.15);
};

/**
 * Plays a synthesized level up sound.
 */
export const playLevelUpSound = () => {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
  oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.3); // A5

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.4);
};