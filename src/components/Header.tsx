import React from 'react';
import { Volume2, Sparkles, MessageCircle, Clock, ShieldCheck, Download, Code2 } from 'lucide-react';
import { VoiceoverConfig } from '../types/voiceover';

interface HeaderProps {
  config: VoiceoverConfig;
  onOpenSSML: () => void;
  onOpenExport: () => void;
  onGenerateAll: () => void;
  isGeneratingAll: boolean;
  readyScenesCount: number;
  totalScenesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onOpenSSML,
  onOpenExport,
  onGenerateAll,
  isGeneratingAll,
  readyScenesCount,
  totalScenesCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand & Commercial Identity */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white shrink-0">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  أبو محمد للخدمات الإلكترونية
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  إعلان تجاري 4K
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>استوديو التعليق الصوتي المعتمد</span>
                <span className="inline-block w-1 h-1 rounded-full bg-slate-600" />
                <span className="font-mono-numbers text-slate-300">120.000 ثانية</span>
                <span className="inline-block w-1 h-1 rounded-full bg-slate-600" />
                <span>8 مشاهد متزامنة</span>
              </p>
            </div>
          </div>

          {/* WhatsApp Direct Contact Badge */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <a
              href={`https://wa.me/966552910447?text=${encodeURIComponent(
                'مرحبًا أبو محمد، استفسار بخصوص خدمات تصحيح الأوضاع ومتابعة المنصات الإلكترونية وحجز المواعيد'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-600/40 transition-all text-xs font-medium shadow-sm group hover:scale-[1.02]"
              title="تواصل مباشر عبر الواتساب"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:animate-pulse" />
              <div className="text-right">
                <div className="text-[10px] text-emerald-400/80 leading-none">واتساب مباشر:</div>
                <div className="font-mono-numbers font-bold text-xs tracking-wider text-emerald-200">
                  0552910447
                </div>
              </div>
            </a>

            {/* SSML View Button */}
            <button
              onClick={onOpenSSML}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              title="عرض كود SSML والسيناريو"
            >
              <Code2 className="w-3.5 h-3.5 text-teal-400" />
              <span>كود SSML</span>
            </button>

            {/* Export Center Button */}
            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              title="تصدير ملفات الماستر والتقارير"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>مركز التصدير</span>
            </button>

            {/* Primary Generate All Voiceover Button */}
            <button
              onClick={onGenerateAll}
              disabled={isGeneratingAll}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className={`w-4 h-4 text-emerald-200 ${isGeneratingAll ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAll ? 'جارِ التوليد بالذكاء الاصطناعي...' : 'توليد الصوت الكامل (AI 120s)'}</span>
            </button>
          </div>

        </div>

        {/* Studio Specs Bar */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-slate-300">النموذج الصوتي:</strong> gemini-3.8-flash-tts
            </span>
            <span className="text-slate-600">|</span>
            <span>
              <strong className="text-slate-300">الهوية الصوتية:</strong> {config.personaId} (باريتون دافئ 35–45 سنة)
            </span>
            <span className="text-slate-600">|</span>
            <span>
              <strong className="text-slate-300">المعايير:</strong> -16 LUFS • 48,000 Hz Linear PCM
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">حالة المشاهد الجاهزة:</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-mono-numbers font-semibold">
              {readyScenesCount} / {totalScenesCount}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
