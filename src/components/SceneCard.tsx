import React from 'react';
import { SceneData } from '../types/voiceover';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Volume2,
} from 'lucide-react';

interface SceneCardProps {
  scene: SceneData;
  isSelected: boolean;
  isPlayingThisScene: boolean;
  onSelect: () => void;
  onPlayScene: () => void;
  onRegenerateScene: () => void;
  onDownloadSceneWav: () => void;
}

export const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  isSelected,
  isPlayingThisScene,
  onSelect,
  onPlayScene,
  onRegenerateScene,
  onDownloadSceneWav,
}) => {
  const wordsCount = scene.spokenText.split(/\s+/).filter(Boolean).length;
  const isWordCountExact = wordsCount === scene.targetWords;

  // Approximate or measured end of speech
  const speechDuration = scene.audioDuration || 7.2;
  const speechEndSec = scene.preBreakMs / 1000 + speechDuration;
  const silenceSec = Math.max(0, scene.targetDuration - speechEndSec);
  const isWithinSafeWindow = speechEndSec <= 12.0;

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl p-4 transition-all border text-right flex flex-col justify-between cursor-pointer ${
        isSelected
          ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
      }`}
    >
      <div>
        {/* Top Header: Scene number, range, word count */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono-numbers font-bold text-xs flex items-center justify-center border border-emerald-500/20">
              {scene.sceneNumber}
            </span>
            <span className="text-xs font-bold text-white">
              {scene.visualTitle}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono-numbers text-[11px]">
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
              [00:{scene.startTime.toString().padStart(2, '0')} - 00:{scene.endTime.toString().padStart(2, '0')}]
            </span>
            <span
              className={`px-2 py-0.5 rounded-md font-semibold ${
                isWordCountExact
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {wordsCount} / {scene.targetWords} كلمة
            </span>
          </div>
        </div>

        {/* Spoken Arabic Script */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 mb-3">
          <p className="text-xs md:text-sm font-semibold text-slate-100 leading-relaxed font-sans">
            "{scene.spokenText}"
          </p>
        </div>

        {/* Visual Cue note */}
        <p className="text-[11px] text-slate-400 mb-3 line-clamp-2">
          <span className="text-slate-500 font-medium">المرئي في الفيديو: </span>
          {scene.visualCue}
        </p>

        {/* Timing Breakdown Badges */}
        <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono-numbers text-center mb-3">
          <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
            <div className="text-slate-500 text-[9px]">انتقال بصري</div>
            <div className="text-amber-400 font-semibold">{scene.preBreakMs}ms</div>
          </div>
          <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
            <div className="text-slate-500 text-[9px]">مدة النطق</div>
            <div className="text-emerald-400 font-semibold">{speechDuration.toFixed(1)}s</div>
          </div>
          <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
            <div className="text-slate-500 text-[9px]">صمت وتنفس</div>
            <div className="text-teal-400 font-semibold">{silenceSec.toFixed(1)}s</div>
          </div>
        </div>

        {/* Boundary Compliance Verification */}
        <div className="flex items-center justify-between text-[10px] px-2 py-1 bg-slate-950/50 rounded-lg border border-slate-800/60 mb-3">
          <span className="text-slate-400">نهاية النطق: {speechEndSec.toFixed(1)}s (أقل من 12.0s)</span>
          {isWithinSafeWindow ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>مطابق للفاصل</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <AlertCircle className="w-3 h-3" />
              <span>قريب من الحد</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onPlayScene}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition ${
            isPlayingThisScene
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
        >
          {isPlayingThisScene ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-slate-950" />
              <span>إيقاف</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              <span>استماع</span>
            </>
          )}
        </button>

        <button
          onClick={onRegenerateScene}
          disabled={scene.status === 'generating'}
          className="inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-emerald-400 text-xs font-medium transition"
          title="توليد المشهد بواسطة gemini-3.8-flash-tts"
        >
          <Sparkles className={`w-3.5 h-3.5 ${scene.status === 'generating' ? 'animate-spin' : ''}`} />
          <span>توليد AI</span>
        </button>

        <button
          onClick={onDownloadSceneWav}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          title="تحميل مقطع المشهد بصيغة WAV"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
