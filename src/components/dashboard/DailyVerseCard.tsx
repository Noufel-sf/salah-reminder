import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Volume2, 
  Square, 
  RotateCw,
  ExternalLink 
} from 'lucide-react';
import { DailyVerse, getTodayVerse, getRandomVerse } from '../../data/dailyVerses';

interface DailyVerseCardProps {
  onOpenQuranTab?: () => void;
}

export const DailyVerseCard: React.FC<DailyVerseCardProps> = ({ onOpenQuranTab }) => {
  const [currentVerse, setCurrentVerse] = useState<DailyVerse>(getTodayVerse());
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioInstance) {
        audioInstance.pause();
      }
    };
  }, [audioInstance]);

  const handleNextVerse = () => {
    if (audioInstance) {
      audioInstance.pause();
      setIsPlayingAudio(false);
    }
    const next = getRandomVerse(currentVerse.id);
    setCurrentVerse(next);
  };

  const handleCopy = () => {
    const textToCopy = `﴿ ${currentVerse.arabic} ﴾\n[سورة ${currentVerse.surah} - الآية ${currentVerse.ayah}]\n\nالتفسير الميسر: ${currentVerse.tafseer}\nوقفة تدبرية: ${currentVerse.reflection}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayAudio = () => {
    if (isPlayingAudio && audioInstance) {
      audioInstance.pause();
      setIsPlayingAudio(false);
      return;
    }

    if (currentVerse.audioUrl) {
      if (audioInstance) audioInstance.pause();
      const audio = new Audio(currentVerse.audioUrl);
      setAudioInstance(audio);
      setIsPlayingAudio(true);

      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);

      audio.play().catch(() => setIsPlayingAudio(false));
    }
  };

  return (
    <div className="bg-white rounded-none p-6 border border-slate-200/90 shadow-sm text-right font-readex transition-all relative overflow-hidden">
      {/* Decorative ambient top border line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500" />

      {/* Header Label & Metadata */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-none bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
            <BookOpen size={16} strokeWidth={2} />
          </span>
          <div>
            <span className="text-xs font-bold text-slate-800 block">آية اليوم وتفسيرها الميسر</span>
            <span className="text-[10px] text-emerald-700 font-semibold">{currentVerse.theme}</span>
          </div>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 rounded-none border border-emerald-300 bg-emerald-50/80 text-emerald-900 font-readex">
          سورة {currentVerse.surah} • الآية {currentVerse.ayah}
        </span>
      </div>

      {/* Main Quranic Verse */}
      <div className="py-2 text-center bg-emerald-50/40 border border-emerald-100/80 p-4 mb-3">
        <p className="font-amiri text-2xl sm:text-3xl font-bold leading-loose text-slate-900 select-text">
          ﴿ {currentVerse.arabic} ﴾
        </p>
      </div>

      {/* Reflection summary */}
      <div className="mb-3 space-y-1">
        <p className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
          <Sparkles size={12} className="text-emerald-600 shrink-0" />
          <span>{currentVerse.reflection}</span>
        </p>
      </div>

      {/* Expandable Tafseer Drawer */}
      {isExpanded && (
        <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 text-right space-y-2 animate-fade-in text-xs">
          <div>
            <span className="font-bold text-emerald-900 block mb-0.5">📖 التفسير الميسر:</span>
            <p className="text-slate-700 leading-relaxed font-readex">
              {currentVerse.tafseer}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <span className="font-bold text-emerald-900 block mb-0.5">💡 كيف نعمل بالآية اليوم؟</span>
            <p className="text-slate-600 leading-relaxed font-readex">
              {currentVerse.reflection}
            </p>
          </div>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>{isExpanded ? 'إخفاء التفسير' : 'التفسير الميسر'}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <div className="flex items-center gap-1.5">
          {/* Recitation audio */}
          {currentVerse.audioUrl && (
            <button
              type="button"
              onClick={handlePlayAudio}
              className={`p-1.5 rounded-none border text-xs cursor-pointer transition-colors ${
                isPlayingAudio
                  ? 'bg-rose-700 border-rose-700 text-white animate-pulse'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title={isPlayingAudio ? 'إيقاف التلاوة' : 'استماع لتلاوة الآية'}
            >
              {isPlayingAudio ? <Square size={13} /> : <Volume2 size={13} />}
            </button>
          )}

          {/* Copy verse */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            title="نسخ الآية والتفسير"
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
          </button>

          {/* Next / Shuffle verse */}
          <button
            type="button"
            onClick={handleNextVerse}
            className="p-1.5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            title="عرض آية أخرى"
          >
            <RotateCw size={13} />
          </button>

          {/* Open full Quran view */}
          {onOpenQuranTab && (
            <button
              type="button"
              onClick={onOpenQuranTab}
              className="px-2.5 py-1.5 bg-emerald-800 text-white font-bold hover:bg-emerald-900 cursor-pointer transition-colors flex items-center gap-1 text-[11px]"
              title="فتح قسم المصحف والورد اليومي"
            >
              <span>الورد اليومي</span>
              <ExternalLink size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
