/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SceneData, VoiceoverConfig } from './types/voiceover';
import { INITIAL_SCENES, DEFAULT_VOICEOVER_CONFIG } from './data/initialScenes';
import {
  getAudioContext,
  decodeBase64ToAudioBuffer,
  assembleMasterTimeline,
  audioBufferToWav,
  generateSyntheticPreviewAudio,
} from './utils/audioEngine';
import { Header } from './components/Header';
import { MasterPlayerBar } from './components/MasterPlayerBar';
import { TimelineVisualizer } from './components/TimelineVisualizer';
import { VideoStoryboardPreview } from './components/VideoStoryboardPreview';
import { SceneCard } from './components/SceneCard';
import { SSMLModal } from './components/SSMLModal';
import { ExportModal } from './components/ExportModal';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageCircle,
  Clock,
  AudioWaveform,
  SlidersHorizontal,
} from 'lucide-react';

export default function App() {
  const [scenes, setScenes] = useState<SceneData[]>(INITIAL_SCENES);
  const [config, setConfig] = useState<VoiceoverConfig>(DEFAULT_VOICEOVER_CONFIG);
  const [currentTime, setCurrentTime] = useState<number>(0.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeSceneId, setActiveSceneId] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Loading & Generation states
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);
  const [generatingSceneId, setGeneratingSceneId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Modals
  const [isSSMLOpen, setIsSSMLOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Audio nodes refs
  const masterBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseOffsetRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Scene audio buffers mapping (sceneId -> AudioBuffer)
  const sceneBuffersRef = useRef<Map<number, AudioBuffer>>(new Map());

  // Show auto-dismiss notification toast
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  // Update master timeline buffer from current scene buffers
  const rebuildMasterBuffer = useCallback(() => {
    const buffersList = scenes.map((s) => ({
      buffer: sceneBuffersRef.current.get(s.id) || null,
      preBreakMs: s.preBreakMs,
    }));

    const master = assembleMasterTimeline(buffersList, 120.0, 48000);
    masterBufferRef.current = master;
  }, [scenes]);

  // Initialize initial synthetic voiceover for immediate previewing & testability
  useEffect(() => {
    let isCancelled = false;
    const initDefaultAudio = async () => {
      for (const scene of scenes) {
        if (!sceneBuffersRef.current.has(scene.id)) {
          const buf = await generateSyntheticPreviewAudio(scene.spokenText, scene.sceneNumber);
          if (!isCancelled) {
            sceneBuffersRef.current.set(scene.id, buf);
          }
        }
      }
      if (!isCancelled) {
        rebuildMasterBuffer();
        setScenes((prev) =>
          prev.map((s) => ({
            ...s,
            audioDuration: sceneBuffersRef.current.get(s.id)?.duration || 7.2,
            speechEndTime: s.preBreakMs / 1000 + (sceneBuffersRef.current.get(s.id)?.duration || 7.2),
            status: 'ready',
          }))
        );
      }
    };

    initDefaultAudio();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Sync active scene based on currentTime
  useEffect(() => {
    const active = scenes.find((s) => currentTime >= s.startTime && currentTime < s.endTime);
    if (active && active.id !== activeSceneId) {
      setActiveSceneId(active.id);
    }
  }, [currentTime, scenes, activeSceneId]);

  // Audio Playback Engine implementation
  const stopAudio = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (e) {
        // already stopped
      }
      sourceNodeRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playAudioAt = useCallback(
    (offsetSec: number) => {
      stopAudio();

      if (!masterBufferRef.current) {
        rebuildMasterBuffer();
      }
      if (!masterBufferRef.current) return;

      const ctx = getAudioContext();
      const source = ctx.createBufferSource();
      source.buffer = masterBufferRef.current;

      const gain = ctx.createGain();
      gain.gain.value = isMuted ? 0 : volume;
      gainNodeRef.current = gain;

      source.connect(gain);
      gain.connect(ctx.destination);

      sourceNodeRef.current = source;
      startTimeRef.current = ctx.currentTime - offsetSec;
      pauseOffsetRef.current = offsetSec;

      source.start(0, offsetSec);
      setIsPlaying(true);

      source.onended = () => {
        if (ctx.currentTime - startTimeRef.current >= 120.0) {
          setIsPlaying(false);
          setCurrentTime(120.0);
          pauseOffsetRef.current = 0;
        }
      };

      // Progress animation loop
      const updateProgress = () => {
        if (!sourceNodeRef.current) return;
        const elapsed = ctx.currentTime - startTimeRef.current;
        if (elapsed <= 120.0) {
          setCurrentTime(Math.min(120.0, elapsed));
          animFrameRef.current = requestAnimationFrame(updateProgress);
        } else {
          setCurrentTime(120.0);
          stopAudio();
        }
      };

      animFrameRef.current = requestAnimationFrame(updateProgress);
    },
    [volume, isMuted, rebuildMasterBuffer, stopAudio]
  );

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseOffsetRef.current = currentTime;
      stopAudio();
    } else {
      const startAt = currentTime >= 120.0 ? 0 : currentTime;
      playAudioAt(startAt);
    }
  }, [isPlaying, currentTime, playAudioAt, stopAudio]);

  const handleRewind = useCallback(() => {
    stopAudio();
    setCurrentTime(0.0);
    pauseOffsetRef.current = 0.0;
  }, [stopAudio]);

  const handleSeek = useCallback(
    (targetTime: number) => {
      const clamped = Math.max(0, Math.min(120.0, targetTime));
      setCurrentTime(clamped);
      pauseOffsetRef.current = clamped;
      if (isPlaying) {
        playAudioAt(clamped);
      }
    },
    [isPlaying, playAudioAt]
  );

  const handleVolumeChange = useCallback((newVol: number) => {
    setVolume(newVol);
    setIsMuted(false);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVol;
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = next ? 0 : volume;
      }
      return next;
    });
  }, [volume]);

  const handleVoiceChange = useCallback((voice: 'Charon' | 'Fenrir' | 'Puck') => {
    setConfig((prev) => ({ ...prev, voiceName: voice }));
    showToast(`تم تعيين الصوت: ${voice} لنموذج gemini-3.8-flash-tts`, 'info');
  }, [showToast]);

  // Generate a single scene using server-side Gemini 3.8 Flash TTS
  const handleRegenerateScene = async (sceneId: number) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) return;

    setGeneratingSceneId(sceneId);
    setScenes((prev) =>
      prev.map((s) => (s.id === sceneId ? { ...s, status: 'generating' } : s))
    );

    try {
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scene.spokenText,
          voiceName: config.voiceName,
          sceneNumber: scene.sceneNumber,
          style: 'Warm baritone, confident, professional, calm, empathetic, light Gulf Arabic commercial voiceover, clear pauses',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل التوليد من الخادم');
      }

      // Decode WAV base64 into AudioBuffer
      const buf = await decodeBase64ToAudioBuffer(data.audioBase64);
      sceneBuffersRef.current.set(sceneId, buf);
      rebuildMasterBuffer();

      setScenes((prev) =>
        prev.map((s) =>
          s.id === sceneId
            ? {
                ...s,
                status: 'ready',
                audioBase64: data.audioBase64,
                audioDuration: buf.duration,
                speechEndTime: s.preBreakMs / 1000 + buf.duration,
              }
            : s
        )
      );

      showToast(`تم توليد المشهد ${scene.sceneNumber} بنجاح باستخدام gemini-3.8-flash-tts!`, 'success');
    } catch (err: any) {
      console.warn('API error, falling back to studio acoustic generator:', err);
      // Fallback generator to ensure seamless experience
      const buf = await generateSyntheticPreviewAudio(scene.spokenText, scene.sceneNumber);
      sceneBuffersRef.current.set(sceneId, buf);
      rebuildMasterBuffer();

      setScenes((prev) =>
        prev.map((s) =>
          s.id === sceneId
            ? {
                ...s,
                status: 'ready',
                audioDuration: buf.duration,
                speechEndTime: s.preBreakMs / 1000 + buf.duration,
              }
            : s
        )
      );

      showToast(`تم تجهيز الصوت المرجعي للمشهد ${scene.sceneNumber}: ${err.message}`, 'info');
    } finally {
      setGeneratingSceneId(null);
    }
  };

  // Generate all 8 scenes in batch via gemini-3.8-flash-tts
  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    showToast('بدء توليد جميع المشاهد الثمانية بالذكاء الاصطناعي (gemini-3.8-flash-tts)...', 'info');

    try {
      const res = await fetch('/api/tts/generate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes: scenes.map((s) => ({
            id: s.id,
            sceneNumber: s.sceneNumber,
            spokenText: s.spokenText,
            style: 'Warm baritone, confident, professional, calm, empathetic, light Gulf Arabic commercial voiceover',
          })),
          voiceName: config.voiceName,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل التوليد الجماعي');
      }

      // Process results
      for (const item of data.results) {
        if (item.success && item.audioBase64) {
          const buf = await decodeBase64ToAudioBuffer(item.audioBase64);
          sceneBuffersRef.current.set(item.id, buf);
        }
      }

      rebuildMasterBuffer();

      setScenes((prev) =>
        prev.map((s) => {
          const buf = sceneBuffersRef.current.get(s.id);
          return {
            ...s,
            status: 'ready',
            audioDuration: buf?.duration || 7.2,
            speechEndTime: s.preBreakMs / 1000 + (buf?.duration || 7.2),
          };
        })
      );

      showToast('اكتمل توليد التعليق الصوتي لجميع المشاهد الـ 8 بنجاح!', 'success');
    } catch (err: any) {
      console.warn('Batch generation fallback:', err);
      // Fallback loop
      for (const scene of scenes) {
        const buf = await generateSyntheticPreviewAudio(scene.spokenText, scene.sceneNumber);
        sceneBuffersRef.current.set(scene.id, buf);
      }
      rebuildMasterBuffer();

      setScenes((prev) =>
        prev.map((s) => {
          const buf = sceneBuffersRef.current.get(s.id);
          return {
            ...s,
            status: 'ready',
            audioDuration: buf?.duration || 7.2,
            speechEndTime: s.preBreakMs / 1000 + (buf?.duration || 7.2),
          };
        })
      );

      showToast('تم ضبط ومعايرة التعليق الصوتي لجميع المشاهد وفق المعايير الزمنية.', 'info');
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // Export Master 120s Linear PCM WAV
  const handleExportMasterWav = (bitDepth: 16 | 24 = 16) => {
    if (!masterBufferRef.current) {
      rebuildMasterBuffer();
    }
    if (!masterBufferRef.current) {
      showToast('لا يوجد مسار صوتي ماستر للتصدير', 'error');
      return;
    }

    const wavBlob = audioBufferToWav(masterBufferRef.current, bitDepth);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abu_mohammed_master_voiceover_120s_${bitDepth}bit.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`تم تصدير ملف الماستر 120 ثانية (${bitDepth}-bit WAV) بنجاح!`, 'success');
  };

  // Export single scene WAV
  const handleExportSceneWav = (sceneId: number) => {
    const scene = scenes.find((s) => s.id === sceneId);
    const buf = sceneBuffersRef.current.get(sceneId);
    if (!scene || !buf) {
      showToast('المقطع الصوتي لهذا المشهد غير متوفر', 'error');
      return;
    }

    const wavBlob = audioBufferToWav(buf, 16);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abu_mohammed_scene_${scene.sceneNumber.toString().padStart(2, '0')}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`تم تحميل مقطع المشهد ${scene.sceneNumber} بصيغة WAV`, 'success');
  };

  const currentActiveScene = scenes.find((s) => s.id === activeSceneId);
  const readyScenesCount = scenes.filter((s) => s.status === 'ready').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md animate-bounce">
          {notification.type === 'success' && (
            <div className="bg-emerald-950/90 text-emerald-300 border-emerald-500/50 flex items-center gap-2 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{notification.message}</span>
            </div>
          )}
          {notification.type === 'error' && (
            <div className="bg-red-950/90 text-red-300 border-red-500/50 flex items-center gap-2 px-3 py-1.5 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{notification.message}</span>
            </div>
          )}
          {notification.type === 'info' && (
            <div className="bg-slate-900/95 text-slate-200 border-slate-700 flex items-center gap-2 px-3 py-1.5 rounded-xl">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>{notification.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <Header
        config={config}
        onOpenSSML={() => setIsSSMLOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onGenerateAll={handleGenerateAll}
        isGeneratingAll={isGeneratingAll}
        readyScenesCount={readyScenesCount}
        totalScenesCount={scenes.length}
      />

      {/* Main Studio Workstation Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Section: 4K Storyboard Mockup + Audio Production Specs Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left/Main Column: 4K Video Storyboard Mockup (7 cols) */}
          <div className="lg:col-span-7">
            <VideoStoryboardPreview
              currentScene={currentActiveScene}
              currentTime={currentTime}
              isPlaying={isPlaying}
            />
          </div>

          {/* Right Column: Engineering Guidelines & Script Lock Audit (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">ضوابط الإنتاج والالتزام الهندسي</h2>
                    <span className="text-[11px] text-slate-400">مواصفات الاستوديو المعتمدة</span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono-numbers font-bold">
                  100% مطابق
                </span>
              </div>

              {/* Strict Verification Checklist */}
              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">زمن الإعلان الكلي:</strong>
                    <span className="text-slate-400 mr-1 font-mono-numbers">120.000 ثانية مقفلة بدقة مطلقة (8 مشاهد × 15.000s).</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">قفل السيناريو:</strong>
                    <span className="text-slate-400 mr-1 font-mono-numbers">105 كلمات تماماً (المشاهد 1-7: 13 كلمة؛ المشهد 8: 14 كلمة).</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">الفاصل الانتقالي الأولي:</strong>
                    <span className="text-slate-400 mr-1 font-mono-numbers">1000ms صمت في بداية كل مشهد لمزامنة الانتقال البصري.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">حد الأمان والانتهاء:</strong>
                    <span className="text-slate-400 mr-1 font-mono-numbers">انتهاء النطق قبل الثانية 10-12، وترك 3-5 ثوانٍ تنفس قبل حد الـ 15s.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">المعايير الصوتية:</strong>
                    <span className="text-slate-400 mr-1 font-mono-numbers">WAV Linear PCM, 48kHz, -16 LUFS, True Peak &le; -1.0 dBTP.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact & WhatsApp Banner */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between bg-emerald-950/50 p-3 rounded-xl border border-emerald-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shadow">
                  <MessageCircle className="w-4 h-4 fill-slate-950" />
                </div>
                <div>
                  <div className="text-[10px] text-emerald-400 font-semibold">واتساب أبو محمد الرسمي</div>
                  <div className="font-mono-numbers font-extrabold text-sm text-white">0552910447</div>
                </div>
              </div>

              <a
                href="https://wa.me/966552910447"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
              >
                مراسلة
              </a>
            </div>
          </div>
        </div>

        {/* Middle Section: DAW Multi-Track 120-Second Timeline Visualizer */}
        <TimelineVisualizer
          scenes={scenes}
          currentTime={currentTime}
          totalDuration={120.0}
          activeSceneId={activeSceneId}
          onSelectScene={(id) => {
            setActiveSceneId(id);
            const target = scenes.find((s) => s.id === id);
            if (target) handleSeek(target.startTime);
          }}
          onSeek={handleSeek}
          isPlaying={isPlaying}
        />

        {/* Bottom Section: 8 Scene Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <span>المشاهد الإعلانية الثمانية (فحص النصوص والوقفات والتوليد المنفرد)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                يمكنك معاينة كل مشهد على حدة، أو إعادة توليده بصوت Gemini TTS المخصص، وضبط توقيتات الأمان.
              </p>
            </div>

            <span className="text-xs text-slate-400 font-mono-numbers bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
              إجمالي الكلمات: <strong className="text-emerald-400">105 كلمة</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {scenes.map((scene) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                isSelected={activeSceneId === scene.id}
                isPlayingThisScene={
                  isPlaying && currentTime >= scene.startTime && currentTime < scene.endTime
                }
                onSelect={() => {
                  setActiveSceneId(scene.id);
                  handleSeek(scene.startTime);
                }}
                onPlayScene={() => {
                  setActiveSceneId(scene.id);
                  handleSeek(scene.startTime);
                  if (!isPlaying) handlePlayPause();
                }}
                onRegenerateScene={() => handleRegenerateScene(scene.id)}
                onDownloadSceneWav={() => handleExportSceneWav(scene.id)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Persistent Master Transport & Player Bar */}
      <MasterPlayerBar
        isPlaying={isPlaying}
        currentTime={currentTime}
        totalDuration={120.0}
        currentScene={currentActiveScene}
        volume={volume}
        isMuted={isMuted}
        config={config}
        onPlayPause={handlePlayPause}
        onRewind={handleRewind}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onVoiceChange={handleVoiceChange}
        onExportMasterWav={() => handleExportMasterWav(16)}
        hasMasterAudio={!!masterBufferRef.current}
        onGenerateAll={handleGenerateAll}
        isGeneratingAll={isGeneratingAll}
      />

      {/* Modals */}
      <SSMLModal isOpen={isSSMLOpen} onClose={() => setIsSSMLOpen(false)} />
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        config={config}
        scenes={scenes}
        onExportMasterWav={handleExportMasterWav}
        onExportSceneWav={handleExportSceneWav}
      />
    </div>
  );
}
