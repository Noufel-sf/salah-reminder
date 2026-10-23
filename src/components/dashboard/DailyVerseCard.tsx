import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
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
    <div className="bg-white rounded-none p-5 border border-slate-200/90 shadow-sm text-right font-readex transition-all relative">
      {/* Top accent bar in main app color */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-800" />

      {/* Header Label: cleanly spaced title and Surah reference without any collision */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-emerald-800 shrink-0" strokeWidth={2.2} />
          <h4 className="text-xs font-bold text-slate-900 font-readex">
            آية اليوم
          </h4>
        </div>

        <span className="text-xs font-semibold text-emerald-800 font-readex">
          سورة {currentVerse.surah} • الآية {currentVerse.ayah}
        </span>
      </div>

      {/* Main Quranic Verse: elegant background with main color accent */}
      <div className="py-3 px-4 text-center bg-emerald-50/50 border-r-4 border-emerald-800 mb-3">
        <p className="font-amiri text-2xl font-bold leading-relaxed text-slate-900 select-text">
          ﴿ {currentVerse.arabic} ﴾
        </p>
      </div>

      {/* Reflection summary with Ayah Theme */}
      <div className="text-xs text-slate-700 leading-relaxed font-readex mb-3">
        <p className="font-bold text-emerald-800 text-[11px] mb-1">
          💡 {currentVerse.theme}
        </p>
        <p className="text-slate-600">
          {currentVerse.reflection}
        </p>
      </div>

      {/* Expandable Tafseer Drawer */}
      {isExpanded && (
        <div className="mb-3 p-3 bg-slate-50 border-r-2 border-emerald-800 text-right space-y-2 animate-fade-in text-xs">
          <div>
            <span className="font-bold text-emerald-900 block mb-0.5">📖 التفسير الميسر:</span>
            <p className="text-slate-700 leading-relaxed font-readex">
              {currentVerse.tafseer}
            </p>
          </div>
        </div>
      )}

      {/* Action Toolbar: beautifully balanced, no overflow */}
      <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 cursor-pointer transition-colors text-xs font-readex"
        >
          <span>{isExpanded ? 'إخفاء التفسير' : 'التفسير الميسر'}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <div className="flex items-center gap-1">
          {/* Recitation audio */}
          {currentVerse.audioUrl && (
            <button
              type="button"
              onClick={handlePlayAudio}
              className={`p-1.5 rounded-none text-xs cursor-pointer transition-colors ${
                isPlayingAudio
                  ? 'bg-rose-700 text-white animate-pulse'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
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
            className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 cursor-pointer transition-colors"
            title="نسخ الآية والتفسير"
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
          </button>

          {/* Next / Shuffle verse */}
          <button
            type="button"
            onClick={handleNextVerse}
            className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 cursor-pointer transition-colors"
            title="عرض آية أخرى"
          >
            <RotateCw size={13} />
          </button>

          {/* Open full Quran view */}
          {onOpenQuranTab && (
            <button
              type="button"
              onClick={onOpenQuranTab}
              className="px-2 py-1 bg-emerald-800 text-white font-bold hover:bg-emerald-900 cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-readex"
              title="فتح قسم المصحف والورد اليومي"
            >
              <span>الورد اليومي</span>
              <ExternalLink size={10} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
