import React, { useState } from 'react';
import { X, Copy, Check, Download, Code2, Sparkles, ShieldCheck } from 'lucide-react';
import { FULL_SSML_DOCUMENT } from '../data/initialScenes';

interface SSMLModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SSMLModal: React.FC<SSMLModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(FULL_SSML_DOCUMENT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([FULL_SSML_DOCUMENT], { type: 'application/ssml+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'abu_mohammed_voiceover_120s.ssml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                كود SSML المعتمد للتعليق الصوتي (120 ثانية / 8 مشاهد)
              </h2>
              <p className="text-xs text-slate-400">
                مخطط الفواصل الزمنية المبرمجة بالمللي ثانية ومطابقة الكلمات والوقفات الصوتية بدقة متناهية.
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

        {/* Specs Overview */}
        <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px]">المدة الإجمالية</span>
            <span className="font-mono-numbers font-bold text-emerald-400">120.000 ثانية</span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px]">عدد الكلمات الكلي</span>
            <span className="font-mono-numbers font-bold text-teal-400">105 كلمة (مقفلة)</span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px]">تقسيم المشاهد</span>
            <span className="font-mono-numbers font-bold text-amber-400">8 فترات × 15.000s</span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px]">الهاتف والواتساب</span>
            <span className="font-mono-numbers font-bold text-emerald-300">0552910447</span>
          </div>
        </div>

        {/* Code Content Box */}
        <div className="p-6 overflow-y-auto flex-1 font-mono-numbers text-xs leading-relaxed text-slate-300 bg-slate-950 dir-ltr text-left selection:bg-teal-500 selection:text-slate-950">
          <pre className="whitespace-pre-wrap font-mono">
            {FULL_SSML_DOCUMENT}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>متوافق كليًا مع محرك Gemini TTS وأنظمة المونتاج الاحترافية</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>نسخ الكود</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow transition"
            >
              <Download className="w-4 h-4" />
              <span>تحميل ملف SSML (.xml)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
