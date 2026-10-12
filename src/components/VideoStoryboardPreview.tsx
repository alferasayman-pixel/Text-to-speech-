import React from 'react';
import { SceneData } from '../types/voiceover';
import {
  FileText,
  Clock,
  HelpCircle,
  Newspaper,
  CheckCircle,
  FileCheck2,
  Sparkles,
  MessageCircle,
  ExternalLink,
  ShieldAlert,
  Compass,
} from 'lucide-react';

interface VideoStoryboardPreviewProps {
  currentScene: SceneData | undefined;
  currentTime: number;
  isPlaying: boolean;
}

export const VideoStoryboardPreview: React.FC<VideoStoryboardPreviewProps> = ({
  currentScene,
  currentTime,
  isPlaying,
}) => {
  if (!currentScene) return null;

  // Compute time within current scene (0.0s to 15.0s)
  const sceneProgressSec = Math.max(0, currentTime - currentScene.startTime);
  const isTransitionPhase = sceneProgressSec < 1.0;
  const isSpeechPhase = sceneProgressSec >= 1.0 && sceneProgressSec < 9.5;
  const isSilencePhase = sceneProgressSec >= 9.5;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* 4K Monitor Header */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide">
            شاشة المحاكاة البصرية 4K (Video Storyboard Sync)
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono-numbers">
            3840 × 2160 UHD @ 60fps
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono-numbers">
          <span className="text-slate-400">
            المشهد {currentScene.sceneNumber} من 8
          </span>
          <span className="text-emerald-400 font-bold">
            {sceneProgressSec.toFixed(1)}s / 15.0s
          </span>
        </div>
      </div>

      {/* 16:9 Video Canvas Mockup */}
      <div className="relative aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-6 flex flex-col justify-between overflow-hidden select-none border-b border-slate-800">
        
        {/* Subtle grid background for studio look */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* Top Video Overlays: Branding & Timecode */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 shadow">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold text-white">أبو محمد للخدمات الإلكترونية</span>
          </div>

          <div className="bg-emerald-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-emerald-500/30 text-emerald-300 font-mono-numbers text-xs font-semibold">
            TC: [00:{currentScene.startTime.toString().padStart(2, '0')}:00 - 00:{currentScene.endTime.toString().padStart(2, '0')}:00]
          </div>
        </div>

        {/* Dynamic Graphic Mockup Based on Scene Card Type */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center px-4">
          
          {/* Scene 1: Identity & Urgency */}
          {currentScene.visualCardType === 'identity' && (
            <div className="flex flex-col items-center max-w-md animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-lg shadow-amber-500/10">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-extrabold text-white mb-1.5">
                مشغول؟ وضع غير نظامي؟ بلاغ هروب أو تغيب؟
              </h3>
              <p className="text-xs text-slate-300 max-w-sm">
                استعراض المعاناة الواقعية وضيق الوقت وتراكم المتطلبات أمام المقيم والباحث عن حل قانوني سليم.
              </p>
            </div>
          )}

          {/* Scene 2: Platforms Confusion */}
          {currentScene.visualCardType === 'platforms' && (
            <div className="flex flex-col items-center max-w-md animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-3 shadow-lg shadow-teal-500/10">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-extrabold text-white mb-1.5">
                محتار بين المنصات الإلكترونية والشروط المتشعبة؟
              </h3>
              <p className="text-xs text-slate-300 max-w-sm">
                الإجراءات الرقمية كثيرة، وكل خطوة تحتاج معرفة دقيقة بالمسارات والاشتراطات لتفادي الرفض أو التأخير.
              </p>
            </div>
          )}

          {/* Scene 3: News Announcement */}
          {currentScene.visualCardType === 'news' && (
            <div className="flex flex-col items-center max-w-lg bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/40 shadow-xl animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  عاجل ورسمي
                </span>
                <span className="text-xs text-emerald-300 font-semibold">بشرى للأشقاء اليمنيين بالمملكة</span>
              </div>
              <h3 className="text-base md:text-lg font-black text-white mb-2 leading-snug">
                بدء التسجيل الإلكتروني لتصحيح الأوضاع وفق الإجراءات المعلنة
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Newspaper className="w-3.5 h-3.5 text-emerald-400" />
                <span>فرصة نظامية موثقة لتسوية الأوضاع القانونية</span>
              </div>
            </div>
          )}

          {/* Scene 4: Requirements */}
          {currentScene.visualCardType === 'requirements' && (
            <div className="flex flex-col items-center max-w-md animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 shadow-lg shadow-indigo-500/10">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-extrabold text-white mb-1.5">
                لكل حالة متطلباتها الخاصة وشروط أهليتها
              </h3>
              <p className="text-xs text-slate-300 max-w-sm">
                تحقق دقيق من انطباق المعايير والمستندات المطلوبة لكل فئة قبل الشروع في التقديم لضمان القبول.
              </p>
            </div>
          )}

          {/* Scene 5: Documents & Appointments */}
          {currentScene.visualCardType === 'documents' && (
            <div className="flex flex-col items-center max-w-md animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-lg shadow-amber-500/10">
                <FileCheck2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-extrabold text-white mb-1.5">
                من الوثائق إلى المواعيد.. التفاصيل تصنع الفارق
              </h3>
              <p className="text-xs text-slate-300 max-w-sm">
                استعراض وترتيب النماذج والأوراق الرسمية، ومطابقة البيانات بحرفية واستعداد تام للمرحلة التالية.
              </p>
            </div>
          )}

          {/* Scene 6: Abu Mohammed & Absher */}
          {currentScene.visualCardType === 'abshar' && (
            <div className="flex flex-col items-center max-w-md animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-extrabold text-white mb-1.5">
                أبو محمد للخدمات الإلكترونية
              </h3>
              <p className="text-xs text-emerald-300 max-w-sm font-medium">
                مساعدتك في التسجيل، وفهم المتطلبات، وحجز مواعيد منصة أبشر بسهولة واطمئنان.
              </p>
            </div>
          )}

          {/* Scene 7: Full Support */}
          {currentScene.visualCardType === 'support' && (
            <div className="flex flex-col items-center max-w-md animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-3 shadow-lg shadow-teal-500/10">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-extrabold text-white mb-1.5">
                تجهيز المستندات ومتابعة الإجراءات خطوة بخطوة
              </h3>
              <p className="text-xs text-slate-300 max-w-sm">
                خدمة مساندة واضحة وموثوقة، وخطوات منظمة ومناسبة لحالتك تمامًا حتى إنجاز المعاملة.
              </p>
            </div>
          )}

          {/* Scene 8: WhatsApp & Temporary Document */}
          {currentScene.visualCardType === 'whatsapp' && (
            <div className="flex flex-col items-center max-w-md bg-emerald-950/80 p-5 rounded-2xl border-2 border-emerald-500/50 shadow-2xl animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 mb-3 shadow-lg shadow-emerald-500/40">
                <MessageCircle className="w-7 h-7 fill-slate-950" />
              </div>
              <h3 className="text-base md:text-lg font-black text-white mb-1">
                المساعدة بإجراءات الوثيقة المؤقتة
              </h3>
              <p className="text-xs text-slate-200 mb-3">
                شاهد الإرشادات، وتواصل مع أبو محمد مباشرة عبر الواتساب:
              </p>
              <div className="bg-slate-950 px-5 py-2.5 rounded-xl border border-emerald-400/60 shadow flex items-center gap-2">
                <span className="text-emerald-400 font-mono-numbers text-lg md:text-xl font-extrabold tracking-wider">
                  0552910447
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Subtitle Bar (Synchronized with Spoken Voice) */}
        <div className="relative z-10 bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-center shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
              التعليق الصوتي المباشر (Voiceover Subtitle)
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-[10px] font-mono-numbers text-slate-400">
              {currentScene.targetWords} كلمة
            </span>
          </div>
          <p className="text-sm md:text-base font-bold text-slate-100 leading-relaxed font-sans">
            "{currentScene.spokenText}"
          </p>
        </div>
      </div>

      {/* Visual Cue & Phase Status Footer */}
      <div className="bg-slate-950/70 p-3.5 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-slate-200">الوصف البصري للإعلان:</strong> {currentScene.visualCue}
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono-numbers">
          <span className="text-slate-500">حالة الفترة:</span>
          {isTransitionPhase && (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">
              انتقال بصري (1.0s)
            </span>
          )}
          {isSpeechPhase && (
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
              نطق صوتي جارٍ
            </span>
          )}
          {isSilencePhase && (
            <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-medium">
              تنفس وصمت (قراءة الشاشة)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
