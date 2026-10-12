export interface SceneData {
  id: number;
  sceneNumber: number;
  startTime: number; // e.g. 0.0, 15.0, 30.0...
  endTime: number;   // e.g. 15.0, 30.0, 45.0...
  targetDuration: number; // exactly 15.000s
  targetWords: number; // 13 or 14
  spokenText: string;
  visualTitle: string;
  visualCue: string;
  visualCardType: 'identity' | 'platforms' | 'news' | 'requirements' | 'documents' | 'abshar' | 'support' | 'whatsapp';
  preBreakMs: number; // default 1000ms
  postBreakMs: number; // default 4500ms
  ssmlSnippet: string;
  audioBase64?: string | null;
  audioDuration?: number; // actual speech duration in seconds
  speechEndTime?: number; // preBreakMs/1000 + audioDuration
  status: 'idle' | 'generating' | 'ready' | 'error';
  errorMessage?: string;
}

export interface VoiceoverConfig {
  personaId: string;
  personaName: string;
  voiceName: 'Charon' | 'Fenrir' | 'Puck' | 'Kore' | 'Zephyr';
  vocalAge: string;
  tone: string;
  dialect: string;
  sampleRate: number; // 48000
  targetLoudnessLUFS: number; // -16
  truePeakLimitDb: number; // -1.0
  totalDuration: number; // 120.000
  whatsappNumber: string; // 0552910447
  whatsappFormatted: string; // +966 55 291 0447
}
