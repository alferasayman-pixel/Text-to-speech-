import React from 'react';
import { SceneData } from '../types/voiceover';
import { Check, Clock, AlertTriangle, ShieldCheck, Play } from 'lucide-react';

interface TimelineVisualizerProps {
  scenes: SceneData[];
  currentTime: number;
  totalDuration: number;
  activeSceneId: number;
  onSelectScene: (id: number) => void;
  onSeek: (time: number) => void;
  isPlaying: boolean;
}

export const TimelineVisualizer: React.FC<TimelineVisualizerProps> = ({
  scenes,
  currentTime,
  totalDuration,
  activeSceneId,
  onSelectScene,
  onSeek,
  isPlaying,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playheadPercent = (currentTime / totalDuration) * 100;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      
      {/* Header and Timeline Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-wide">
              مخطط الخط الزمني الماسي (120 ثانية / 8 فترات متساوية)
            </h2>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono-numbers">
              8 × 15.000s = 120.000s
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            توزيع هندسي دقيق: ثانية أولى انتقال بصري (1000ms) + نطق صوتي + صمت وتنفس وقراءة (3–5s) قبل نهاية كل مشهد.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-sm bg-amber-500/40 border border-amber-500/60" />
            <span>انتقال بصري (1.0s)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-sm bg-emerald-500" />
            <span>النطق الصوتي (6-8s)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-sm bg-slate-800 border border-slate-700" />
            <span>تنفس وصمت (3-5s)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500/80" />
            <span>حد الإلزام (12.0s)</span>
          </div>
        </div>
      </div>

      {/* DAW Multi-Track Timeline Container */}
      <div className="relative bg-slate-950 rounded-xl p-3 border border-slate-800/80">
        
        {/* Time ruler ticks */}
        <div className="relative h-6 w-full flex justify-between text-[10px] font-mono-numbers text-slate-500 border-b border-slate-800 mb-2 px-1 select-none">
          {Array.from({ length: 9 }).map((_, idx) => {
            const timeSec = idx * 15;
            return (
              <div key={idx} className="flex flex-col items-center">
                <span>{formatTime(timeSec)}</span>
                <span className="w-px h-1.5 bg-slate-700" />
              </div>
            );
          })}
        </div>

        {/* Interactive Scenes Grid (8 Scene Columns) */}
        <div className="grid grid-cols-8 gap-2 relative">
          
          {/* Real-time Playhead Vertical Needle */}
          <div
            className="absolute top-0 bottom-0 z-30 pointer-events-none transition-all duration-75 flex flex-col items-center"
            style={{
              // In RTL, 0% is at the right edge
              right: `${playheadPercent}%`,
              transform: 'translateX(50%)',
            }}
          >
            <div className="w-2.5 h-2.5 bg-red-500 rotate-45 -mt-1 shadow-md shadow-red-500/50" />
            <div className="w-0.5 h-full bg-red-500 shadow-sm shadow-red-500" />
          </div>

          {scenes.map((scene) => {
            const isActive = activeSceneId === scene.id;
            const isCurrentInPlayback =
              currentTime >= scene.startTime && currentTime < scene.endTime;

            return (
              <div
                key={scene.id}
                onClick={() => {
                  onSelectScene(scene.id);
                  onSeek(scene.startTime);
                }}
                className={`group relative rounded-lg p-2 transition-all cursor-pointer border text-right flex flex-col justify-between h-36 ${
                  isCurrentInPlayback
                    ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/30'
                    : isActive
                    ? 'bg-slate-900 border-teal-500/60'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {/* Scene Header */}
                <div className="flex items-center justify-between">
                  <span className="font-mono-numbers text-[10px] font-bold text-slate-400 group-hover:text-emerald-400 transition">
                    S{scene.sceneNumber}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono-numbers ${
                      scene.status === 'ready'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : scene.status === 'generating'
                        ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {scene.targetWords} كلمة
                  </span>
                </div>

                {/* Simulated Audio Waveform / Slot Visualization within 15 seconds */}
                <div className="my-1.5 flex-1 flex flex-col justify-center">
                  <div className="h-10 w-full bg-slate-950/90 rounded-md border border-slate-800/80 p-1 relative overflow-hidden flex items-center">
                    
                    {/* Visual Transition Zone (1.0s / 15s = 6.66% width at the start - in RTL, at the right) */}
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-amber-500/20 border-l border-amber-500/40 flex items-center justify-center"
                      style={{ width: `${(scene.preBreakMs / 15000) * 100}%` }}
                      title="فترة الانتقال البصري (1000ms)"
                    >
                      <span className="text-[7px] font-mono text-amber-400/80 select-none">
                        1s
                      </span>
                    </div>

                    {/* Spoken Speech Block (approx 1.0s to 8.5s = ~50% width) */}
                    <div
                      className="absolute top-1 bottom-1 rounded bg-gradient-to-l from-emerald-600 to-teal-500 flex items-center justify-center overflow-hidden px-1 shadow-sm"
                      style={{
                        right: `${(scene.preBreakMs / 15000) * 100}%`,
                        width: `${((scene.audioDuration || 7.2) / 15) * 100}%`,
                      }}
                      title="النطق الصوتي للمشهد"
                    >
                      {/* Stylized waveform bars */}
                      <div className="flex items-center gap-0.5 h-full opacity-70">
                        {Array.from({ length: 12 }).map((_, bIdx) => (
                          <div
                            key={bIdx}
                            className="w-0.5 bg-white rounded-full"
                            style={{
                              height: `${25 + Math.sin(bIdx * 1.5 + scene.id) * 60}%`,
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Strict 12-second Cutoff Line (12s / 15s = 80% mark, 20% from left in RTL) */}
                    <div
                      className="absolute top-0 bottom-0 w-px bg-red-500/70 z-10"
                      style={{ right: '80%' }}
                      title="الحد الأقصى الإلزامي لانتهاء النطق (12.0 ثانية)"
                    />

                    {/* Silence Cushion Zone (from speech end to 15s boundary) */}
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-slate-900/40 flex items-center justify-center"
                      style={{
                        width: `${Math.max(0, 100 - ((scene.preBreakMs / 1000 + (scene.audioDuration || 7.2)) / 15) * 100)}%`,
                      }}
                      title="فترة صمت وتنفس وقراءة"
                    >
                      <span className="text-[7px] text-slate-500 select-none">
                        هدوء
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scene Script Snippet */}
                <p className="text-[10px] text-slate-300 font-medium truncate leading-tight mt-1" title={scene.spokenText}>
                  {scene.spokenText}
                </p>

                {/* Scene Timestamps */}
                <div className="mt-1 flex items-center justify-between text-[9px] font-mono-numbers text-slate-400">
                  <span>{formatTime(scene.startTime)}</span>
                  <span className="text-emerald-400 font-semibold">15.0s</span>
                  <span>{formatTime(scene.endTime)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
