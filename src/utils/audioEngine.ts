/**
 * Studio Audio Engine for Abu Mohammed Voiceover Production
 * Handles 120-second timeline stitching, sample-accurate positioning,
 * -16 LUFS loudness normalization, peak limiting, and Linear PCM WAV export.
 */

// Helper to get or create an AudioContext
let audioCtxInstance: AudioContext | null = null;
export function getAudioContext(): AudioContext {
  if (!audioCtxInstance) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtxInstance = new AudioContextClass({ sampleRate: 48000 });
  }
  if (audioCtxInstance.state === 'suspended') {
    audioCtxInstance.resume();
  }
  return audioCtxInstance;
}

/**
 * Decodes base64 WAV string into AudioBuffer
 */
export async function decodeBase64ToAudioBuffer(base64Data: string): Promise<AudioBuffer> {
  const ctx = getAudioContext();
  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const arrayBuffer = bytes.buffer;
  return await ctx.decodeAudioData(arrayBuffer);
}

/**
 * Calculates RMS and applies gentle studio compression + -16 LUFS target normalization
 * Peak limited to <= -1.0 dBTP (~0.891 amplitude)
 */
export function normalizeAudioBuffer(buffer: AudioBuffer, targetLUFS: number = -16, peakLimitDb: number = -1.0): AudioBuffer {
  const ctx = getAudioContext();
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length;
  const sampleRate = buffer.sampleRate;

  const normalizedBuffer = ctx.createBuffer(numChannels, length, sampleRate);

  // Measure RMS
  let sumSquares = 0;
  let totalSamples = 0;

  for (let ch = 0; ch < numChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      const val = data[i];
      sumSquares += val * val;
      totalSamples++;
    }
  }

  const rms = Math.sqrt(sumSquares / Math.max(1, totalSamples));
  // Approximate LUFS from RMS (AES17 / BS.1770 approximation for speech)
  const currentLUFS = rms > 0.00001 ? 20 * Math.log10(rms) - 0.69 : -90;
  
  // Calculate gain to hit target LUFS
  let gain = 1.0;
  if (currentLUFS > -80) {
    const diff = targetLUFS - currentLUFS;
    gain = Math.pow(10, diff / 20);
  }

  const maxPeak = Math.pow(10, peakLimitDb / 20); // ~0.8912

  // Apply gain with soft-knee limiter to prevent clipping
  for (let ch = 0; ch < numChannels; ch++) {
    const inputData = buffer.getChannelData(ch);
    const outputData = normalizedBuffer.getChannelData(ch);

    for (let i = 0; i < length; i++) {
      let sample = inputData[i] * gain;

      // Soft limiter curve
      if (Math.abs(sample) > maxPeak) {
        if (sample > 0) {
          sample = maxPeak + (1 - maxPeak) * Math.tanh((sample - maxPeak) / (1 - maxPeak));
        } else {
          sample = -maxPeak - (1 - maxPeak) * Math.tanh((-sample - maxPeak) / (1 - maxPeak));
        }
      }

      // Hard clamp safety
      outputData[i] = Math.max(-maxPeak, Math.min(maxPeak, sample));
    }
  }

  return normalizedBuffer;
}

/**
 * Stitches 8 scenes into a sample-accurate 120.000s AudioBuffer
 */
export function assembleMasterTimeline(
  sceneBuffers: Array<{ buffer: AudioBuffer | null; preBreakMs: number }>,
  targetDurationSec: number = 120.0,
  sampleRate: number = 48000
): AudioBuffer {
  const ctx = getAudioContext();
  const totalSamples = Math.round(targetDurationSec * sampleRate);
  // Stereo buffer
  const masterBuffer = ctx.createBuffer(2, totalSamples, sampleRate);
  const leftOut = masterBuffer.getChannelData(0);
  const rightOut = masterBuffer.getChannelData(1);

  // Each scene occupies exactly 15.000s
  const sceneSlotDurationSec = 15.0;

  sceneBuffers.forEach((scene, index) => {
    if (!scene.buffer) return;

    const slotStartSec = index * sceneSlotDurationSec;
    const speechStartSec = slotStartSec + scene.preBreakMs / 1000.0;
    const insertSample = Math.round(speechStartSec * sampleRate);

    // Limit maximum speech end to 12.5s into the 15s slot to guarantee safe boundary
    const maxSpeechEndSample = Math.round((slotStartSec + 13.0) * sampleRate);

    const sceneNumChannels = scene.buffer.numberOfChannels;
    const sceneLeft = scene.buffer.getChannelData(0);
    const sceneRight = sceneNumChannels > 1 ? scene.buffer.getChannelData(1) : sceneLeft;
    const sceneLen = scene.buffer.length;

    // Resample/copy samples
    const ratio = scene.buffer.sampleRate / sampleRate;
    const targetLength = Math.min(
      Math.round(sceneLen / ratio),
      maxSpeechEndSample - insertSample,
      totalSamples - insertSample
    );

    for (let i = 0; i < targetLength; i++) {
      const srcIdx = Math.floor(i * ratio);
      if (srcIdx < sceneLen) {
        // Subtle room tone crossfade (10ms)
        let fade = 1.0;
        if (i < 480) fade = i / 480;
        else if (i > targetLength - 480) fade = (targetLength - i) / 480;

        leftOut[insertSample + i] += sceneLeft[srcIdx] * fade;
        rightOut[insertSample + i] += sceneRight[srcIdx] * fade;
      }
    }
  });

  return normalizeAudioBuffer(masterBuffer, -16, -1.0);
}

/**
 * Encodes an AudioBuffer into Linear PCM WAV (RIFF format)
 */
export function audioBufferToWav(buffer: AudioBuffer, bitDepth: 16 | 24 = 16): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  // RIFF Chunk Descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // ChunkSize
  writeString(view, 8, 'WAVE');

  // "fmt " Sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // "data" Sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write audio samples
  let offset = 44;
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  if (bitDepth === 16) {
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        let sample = channels[ch][i];
        sample = Math.max(-1, Math.min(1, sample));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }
  } else if (bitDepth === 24) {
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        let sample = channels[ch][i];
        sample = Math.max(-1, Math.min(1, sample));
        const intSample = Math.round(sample * 8388607);
        view.setUint8(offset, intSample & 0xff);
        view.setUint8(offset + 1, (intSample >> 8) & 0xff);
        view.setUint8(offset + 2, (intSample >> 16) & 0xff);
        offset += 3;
      }
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Generate a high-fidelity synthetic preview if API key is not ready or for instant testing
 */
export async function generateSyntheticPreviewAudio(text: string, sceneNumber: number): Promise<AudioBuffer> {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;
  // Compute approximate natural speaking length (approx 13 words = 6.5s)
  const words = text.split(/\s+/).filter(Boolean).length;
  const duration = Math.min(9.0, Math.max(4.5, words * 0.48));
  const numSamples = Math.round(duration * sampleRate);
  const buffer = ctx.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);

  // Generate warm voice formant harmonics (Fundamental F0 ~ 115Hz for baritone male)
  const f0 = 110 + (sceneNumber % 3) * 5;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Word cadence envelope
    const wordRate = (words / duration) * 2 * Math.PI;
    const cadence = 0.5 + 0.5 * Math.sin(t * wordRate);
    const envelope = Math.sin((Math.PI * i) / numSamples);

    // Warm baritone harmonics (F0, F1, F2 formant simulation)
    const h1 = Math.sin(2 * Math.PI * f0 * t) * 0.4;
    const h2 = Math.sin(2 * Math.PI * f0 * 2 * t) * 0.25;
    const h3 = Math.sin(2 * Math.PI * f0 * 3 * t) * 0.15;
    const formant = Math.sin(2 * Math.PI * 650 * t) * 0.1; // chest resonance

    data[i] = (h1 + h2 + h3 + formant) * cadence * envelope * 0.35;
  }

  return buffer;
}
