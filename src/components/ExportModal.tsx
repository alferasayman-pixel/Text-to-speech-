import React, { useState } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileAudio,
  CheckCircle2,
  Share2,
  MessageCircle,
  FileText,
  Sliders,
  Layers,
} from 'lucide-react';
import { SceneData, VoiceoverConfig } from '../types/voiceover';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: VoiceoverConfig;
  scenes: SceneData[];
  onExportMasterWav: (bitDepth: 16 | 24) => void;
  onExportSceneWav: (sceneId: number) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  config,
  scenes,
  onExportMasterWav,
  onExportSceneWav,
}) => {
  const [selectedBitDepth, setSelectedBitDepth] = useState<16 | 24>(16);

  if (!isOpen) return null;

  // Export Production Cue Sheet as JSON
  const handleExportCueSheet = () => {
    const cueSheet = {
      project: 'أبو محمد للخدمات الإلكترونية - إعلان تجاري 4K',
      whatsapp: config.whatsappNumber,
      totalDurationSeconds: 120.0,
      totalScenes: 8,
      voicePersona: {
        id: config.personaId,
        name: config.personaName,
        voiceModel: 'gemini-3.8-flash-tts',
        voiceVariant: config.voiceName,
        targetLUFS: config.targetLoudnessLUFS,
        truePeakLimitDb: config.truePeakLimitDb,
        sampleRate: config.sampleRate,
      },
      scenes: scenes.map((s) => ({
        sceneNumber: s.sceneNumber,
        timecodeStart: `00:${s.startTime.toString().padStart(2, '0')}:00`,
        timecodeEnd: `00:${s.endTime.toString().padStart(2, '0')}:00`,
        durationSeconds: s.targetDuration,
        wordCount: s.targetWords,
        spokenScript: s.spokenText,
        visualTitle: s.visualTitle,
        visualCue: s.visualCue,
        timingBreakdown: {
          preBreakMs: s.preBreakMs,
          speechDurationSec: s.audioDuration || 7.2,
          postBreakMs: s.postBreakMs,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(cueSheet, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'abu_mohammed_production_cuesheet.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export CSV for Premiere / DaVinci Resolve markers
  const handleExportCSV = () => {
    const rows = [
      ['Scene', 'Start Timecode', 'End Timecode', 'Duration (s)', 'Words', 'Visual Title', 'Voiceover Script'],
      ...scenes.map((s) => [
        `Scene ${s.sceneNumber}`,
        `00:${s.startTime.toString().padStart(2, '0')}:00:00`,
        `00:${s.endTime.toString().padStart(2, '0')}:00:00`,
        `${s.targetDuration}`,
        `${s.targetWords}`,
        `"${s.visualTitle}"`,
        `"${s.spokenText.replace(/"/g, '""')}"`,
      ]),
    ];

    const csvContent = '\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'abu_mohammed_timeline_markers.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                مركز تصدير الإنتاج الصوتي والهندسة الإذاعية
              </h2>
              <p className="text-xs text-slate-400">
                تحميل الماستر النهائي بدقة 48,000 Hz Linear PCM ومخططات المونتاج المتزامنة.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Master WAV Export Card */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/30 relative overflow-hidden shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  البث التجاري المعتمد
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  تصدير الملف الماستر المجمع (120.000 ثانية كاملة)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ملف WAV غير مضغوط (Linear PCM) مستوفي لمعايير الإذاعة والتلفزيون (-16 LUFS, Peak &lt;= -1.0 dBTP).
                </p>
              </div>

              {/* Bit Depth Selector */}
              <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs shrink-0">
                <span className="text-slate-400 text-[11px] px-1">العمق:</span>
                <button
                  onClick={() => setSelectedBitDepth(16)}
                  className={`px-3 py-1 rounded-lg font-mono-numbers font-semibold transition ${
                    selectedBitDepth === 16
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  16-bit
                </button>
                <button
                  onClick={() => setSelectedBitDepth(24)}
                  className={`px-3 py-1 rounded-lg font-mono-numbers font-semibold transition ${
                    selectedBitDepth === 24
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  24-bit Broadcast
                </button>
              </div>
            </div>

            {/* Production Specs Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-numbers text-center mb-4">
              <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Sample Rate</span>
                <span className="text-emerald-400 font-bold">48,000 Hz</span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Duration</span>
                <span className="text-teal-400 font-bold">120.000 s</span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Target LUFS</span>
                <span className="text-amber-400 font-bold">-16.0 LUFS</span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">True Peak</span>
                <span className="text-emerald-300 font-bold">&le; -1.0 dBTP</span>
              </div>
            </div>

            <button
              onClick={() => onExportMasterWav(selectedBitDepth)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 fill-slate-950" />
              <span>تحميل الماستر الصوتي النهائي (120s WAV - {selectedBitDepth}-bit)</span>
            </button>
          </div>

          {/* Timeline Markers & Cues Card */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-1">
              مخططات المونتاج وعلامات الفواصل (Video Editor Markers)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              تصدير ملفات العلامات الزمنية الجاهزة للاستيراد في برامج المونتاج العالمية (Premiere Pro, DaVinci Resolve, Final Cut).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportCSV}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-right flex items-center justify-between group transition"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-teal-400" />
                  <div>
                    <div className="text-xs font-bold text-white">ملف علامات المونتاج (.CSV)</div>
                    <div className="text-[10px] text-slate-400">لبرامج DaVinci و Premiere Pro</div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
              </button>

              <button
                onClick={handleExportCueSheet}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-right flex items-center justify-between group transition"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-white">صحيفة الإنتاج الهندسية (.JSON)</div>
                    <div className="text-[10px] text-slate-400">تقرير شامل عن المشاهد والكلمات</div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition" />
              </button>
            </div>
          </div>

          {/* Individual Scene Clips Download */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">
                تنزيل مقاطع المشاهد المنفصلة (8 مقاطع WAV)
              </h3>
              <span className="text-xs text-slate-400">15.0 ثانية لكل مشهد</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {scenes.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => onExportSceneWav(scene.id)}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-right flex items-center justify-between text-xs transition group"
                >
                  <div>
                    <span className="font-mono-numbers font-bold text-emerald-400 block text-xs">
                      المشهد {scene.sceneNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono-numbers">
                      {scene.startTime}s - {scene.endTime}s
                    </span>
                  </div>
                  <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition" />
                </button>
              ))}
            </div>
          </div>

          {/* WhatsApp Direct Action */}
          <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">التواصل المباشر مع المعلن</h4>
                <p className="text-[11px] text-slate-300">
                  أبو محمد للخدمات الإلكترونية • رقم الواتساب: <strong className="font-mono-numbers text-emerald-300">0552910447</strong>
                </p>
              </div>
            </div>

            <a
              href="https://wa.me/966552910447"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow"
            >
              <span>فتح محادثة واتساب الآن</span>
            </a>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
