import React, { useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Sliders,
  Radio,
  CheckCircle2,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { SceneData, VoiceoverConfig } from '../types/voiceover';

interface MasterPlayerBarProps {
  isPlaying: boolean;
  currentTime: number;
  totalDuration: number;
  currentScene: SceneData | undefined;
  volume: number;
  isMuted: boolean;
  config: VoiceoverConfig;
  onPlayPause: () => void;
  onRewind: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onVoiceChange: (voice: 'Charon' | 'Fenrir' | 'Puck') => void;
  onExportMasterWav: () => void;
  hasMasterAudio: boolean;
  onGenerateAll: () => void;
  isGeneratingAll: boolean;
}

export const MasterPlayerBar: React.FC<MasterPlayerBarProps> = ({
  isPlaying,
  currentTime,
  totalDuration,
  currentScene,
  volume,
  isMuted,
  config,
  onPlayPause,
  onRewind,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onVoiceChange,
  onExportMasterWav,
  hasMasterAudio,
  onGenerateAll,
  isGeneratingAll,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  // Mock LUFS meter animation when playing
  const lufsValue = isPlaying ? -16.0 + (Math.sin(currentTime * 8) * 1.5) : -60.0;
  const peakValue = isPlaying ? -1.0 + (Math.sin(currentTime * 5) * 0.4) : -60.0;

  return (
    <div className="bg-slate-900 border-t border-slate-800 shadow-2xl p-4 sticky bottom-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        
        {/* Scrubber Track with 15s Scene Segments */}
        <div className="relative w-full group">
          <div className="flex justify-between text-[11px] font-mono-numbers text-slate-400 mb-1 px-1">
            <span className="text-emerald-400 font-semibold">{formatTime(currentTime)}</span>
            <span className="text-slate-400">
              المشهد النشط:{' '}
              {currentScene ? (
                <strong className="text-emerald-300">
                  {currentScene.sceneNumber} ({formatTime(currentScene.startTime)} - {formatTime(currentScene.endTime)})
                </strong>
              ) : (
                '0'
              )}
            </span>
            <span className="text-slate-400">{formatTime(totalDuration)}</span>
          </div>

          {/* Interactive Progress Bar */}
          <div
            className="h-3 w-full bg-slate-950 rounded-full relative cursor-pointer overflow-hidden border border-slate-800"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              // Support RTL scrubbing
              const clickX = e.clientX - rect.left;
              const ratio = 1 - clickX / rect.width; // RTL invert
              const newTime = Math.max(0, Math.min(totalDuration, ratio * totalDuration));
              onSeek(newTime);
            }}
          >
            {/* 8 Scene Divider Ticks (every 15s = 12.5%) */}
            <div className="absolute inset-0 flex divide-x divide-slate-800 divide-x-reverse pointer-events-none">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-[12.5%] h-full relative ${
                    currentScene?.sceneNumber === idx + 1 ? 'bg-emerald-500/15' : ''
                  }`}
                >
                  <span className="absolute top-0.5 right-1 text-[9px] font-mono-numbers text-slate-600 select-none">
                    S{idx + 1}
                  </span>
                </div>
              ))}
            </div>

            {/* Filled Progress */}
            <div
              className="h-full bg-gradient-to-l from-emerald-500 via-teal-400 to-emerald-600 transition-all duration-75 relative"
              style={{ width: `${(currentTime / totalDuration) * 100}%` }}
            >
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
            </div>
          </div>
        </div>

        {/* Transport & Control Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Main Playback Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onRewind}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="إعادة التشغيل للبداية (00:00)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onPlayPause}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/30 transition transform hover:scale-105 active:scale-95"
              title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل الماستر 120 ثانية'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
            </button>

            {/* Digital Clock readout */}
            <div className="flex flex-col items-start px-2">
              <span className="text-xl font-mono-numbers font-bold text-white tracking-wider">
                {formatTime(currentTime)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono-numbers leading-none">
                / {formatTime(totalDuration)}
              </span>
            </div>
          </div>

          {/* Voice Persona Selector & Target LUFS Specs */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Radio className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-400">الصوت:</span>
              <select
                value={config.voiceName}
                onChange={(e) => onVoiceChange(e.target.value as any)}
                className="bg-transparent text-emerald-300 font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="Charon" className="bg-slate-900 text-slate-100">
                  Charon (باريتون دافئ عميق - الافتراضي)
                </option>
                <option value="Fenrir" className="bg-slate-900 text-slate-100">
                  Fenrir (باريتون وقور حازم)
                </option>
                <option value="Puck" className="bg-slate-900 text-slate-100">
                  Puck (صوت إذاعي حيوي وواضح)
                </option>
              </select>
            </div>

            {/* Broadcast Meter Display */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono-numbers">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">LUFS:</span>
              <span className={`font-semibold ${isPlaying ? 'text-emerald-300' : 'text-slate-500'}`}>
                {isPlaying ? lufsValue.toFixed(1) : '-16.0'} dB
              </span>
              <span className="text-slate-700">|</span>
              <span className="text-slate-400">Peak:</span>
              <span className={`font-semibold ${isPlaying ? 'text-teal-300' : 'text-slate-500'}`}>
                {isPlaying ? peakValue.toFixed(1) : '-1.0'} dBTP
              </span>
            </div>
          </div>

          {/* Volume Control & Master Export Action */}
          <div className="flex items-center gap-3">
            {/* Volume slider */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleMute}
                className="text-slate-400 hover:text-white transition"
                title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-20 accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                title="مستوى الصوت"
              />
            </div>

            {/* Export Master WAV Button */}
            <button
              onClick={onExportMasterWav}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold shadow transition active:scale-95"
              title="تحميل ملف الماستر النهائي 120 ثانية (WAV 48kHz)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>تحميل الماستر (120s WAV)</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
