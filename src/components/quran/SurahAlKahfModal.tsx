import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  X, 
  Volume2, 
  Square, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  Copy 
} from 'lucide-react';
import { SURAH_AL_KAHF_METADATA, SURAH_AL_KAHF_AYAHS } from '../../data/surahAlKahf';

interface SurahAlKahfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMarkRead?: (read: boolean) => void;
}

export const SurahAlKahfModal: React.FC<SurahAlKahfModalProps> = ({
  isOpen,
  onClose,
  onMarkRead
}) => {
  const [fontSize, setFontSize] = useState<number>(24);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'flow' | 'list'>('flow');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const storageKey = `noor_kahf_read_${todayStr}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setIsCompleted(saved === 'true');
    } catch {
      // fallback
    }
  }, [storageKey, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleToggleAudio = () => {
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    if (!audioRef.current) {
      setIsAudioLoading(true);
      const audio = new Audio(SURAH_AL_KAHF_METADATA.audioUrl);
      audioRef.current = audio;

      audio.oncanplay = () => setIsAudioLoading(false);
      audio.onplaying = () => {
        setIsAudioLoading(false);
        setIsPlayingAudio(true);
      };
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        setIsAudioLoading(false);
        setIsPlayingAudio(false);
      };
    }

    audioRef.current.play().catch(() => {
      setIsAudioLoading(false);
      setIsPlayingAudio(false);
    });
  };

  const handleToggleCompleted = () => {
    const next = !isCompleted;
    setIsCompleted(next);
    try {
      localStorage.setItem(storageKey, String(next));
      window.dispatchEvent(new CustomEvent('kahf-read-status-changed', { detail: { isRead: next } }));
    } catch {
      // fallback
    }
    if (onMarkRead) onMarkRead(next);
  };

  const handleCopyAyah = (num: number, text: string) => {
    const formatted = `﴿ ${text} ﴾ [سورة الكهف - الآية ${num}]`;
    navigator.clipboard.writeText(formatted);
    setCopiedAyah(num);
    setTimeout(() => setCopiedAyah(null), 1500);
  };

  const toArabicNumber = (n: number) => {
    return n.toLocaleString('ar-EG');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in font-readex">
      {/* Modal Dialog Card */}
      <div 
        className="bg-[#fcfdfc] dark:bg-[#0c1611] w-full max-w-4xl h-[92vh] flex flex-col shadow-2xl border-2 border-emerald-800 rounded-none relative overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header Bar */}
        <div className="bg-[#0b1f16] border-b border-emerald-500/30 px-5 py-4 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-900/90 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-100 font-readex">
                  سورة الكهف المباركة
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-800 text-emerald-200">
                  110 آيات • مكية
                </span>
              </div>
              <p className="text-xs text-emerald-300/90 font-readex mt-0.5">
                «أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ» — سنة يوم الجمعة
              </p>
            </div>
          </div>

          {/* Quick Toolbar Controls */}
          <div className="flex items-center gap-2">
            {/* Audio Recitation Button */}
            <button
              type="button"
              onClick={handleToggleAudio}
              className={`px-3 py-1.5 rounded-none text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border ${
                isPlayingAudio
                  ? 'bg-rose-700 border-rose-600 text-white animate-pulse'
                  : 'bg-emerald-900/80 border-emerald-500/40 text-emerald-100 hover:bg-emerald-800'
              }`}
              title={isPlayingAudio ? 'إيقاف التلاوة' : 'استماع لتلاوة سورة الكهف بصوت الشيخ مشاري العفاسي'}
            >
              {isPlayingAudio ? <Square size={13} /> : <Volume2 size={13} />}
              <span>
                {isAudioLoading ? 'جاري التحميل...' : isPlayingAudio ? 'إيقاف التلاوة' : 'تلاوة كاملة'}
              </span>
            </button>

            {/* Font Size Adjusters */}
            <div className="hidden sm:flex items-center gap-1 bg-emerald-950/90 border border-emerald-500/30 px-1 py-1">
              <button
                type="button"
                onClick={() => setFontSize((prev) => Math.max(18, prev - 2))}
                className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                title="تصغير الخط"
              >
                <ZoomOut size={13} />
              </button>
              <span className="text-[11px] font-mono font-bold text-emerald-300 px-1">
                {fontSize}
              </span>
              <button
                type="button"
                onClick={() => setFontSize((prev) => Math.min(36, prev + 2))}
                className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                title="تكبير الخط"
              >
                <ZoomIn size={13} />
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="hidden md:flex items-center gap-1 bg-emerald-950/90 border border-emerald-500/30 p-1">
              <button
                type="button"
                onClick={() => setViewMode('flow')}
                className={`px-2 py-0.5 text-xs font-semibold cursor-pointer ${
                  viewMode === 'flow' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                المصحف
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-2 py-0.5 text-xs font-semibold cursor-pointer ${
                  viewMode === 'list' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                آية بآية
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-rose-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-sm"
              title="إغلاق القارئ (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Reading Body (Scrollable Mushaf) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 text-right select-text bg-[#fbfcfb] dark:bg-[#0c1611]">
          {/* Ornate Surah Frame Header */}
          <div className="max-w-3xl mx-auto mb-8 text-center border-y-2 border-emerald-800/40 py-4 bg-emerald-50/40 dark:bg-emerald-950/30">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block font-readex tracking-wide">
              سُورَةُ الْكَهْفِ
            </span>
            <p className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-emerald-200 my-2">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-readex">
              الجزء الخامس عشر والسادس عشر • 110 آيات
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {viewMode === 'flow' ? (
              /* Continuous Mushaf Paragraph Flow */
              <div 
                className="font-amiri leading-[2.5] text-slate-900 dark:text-slate-100 text-justify text-justify-arabic"
                style={{ fontSize: `${fontSize}px` }}
              >
                {SURAH_AL_KAHF_AYAHS.map((ayah) => {
                  // If first ayah starts with Bismillah, strip it in flow mode since we have the ornate header
                  let text = ayah.text;
                  if (ayah.number === 1 && text.startsWith('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ')) {
                    text = text.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ', '');
                  }

                  return (
                    <React.Fragment key={ayah.number}>
                      <span className="hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition-colors px-1 rounded-xs inline">
                        {text}
                      </span>
                      <span 
                        className="inline-flex items-center justify-center font-amiri font-bold text-emerald-800 dark:text-emerald-400 mx-1 select-none text-[0.85em] cursor-pointer"
                        title={`آية ${ayah.number} (انقر لنسخ الآية)`}
                        onClick={() => handleCopyAyah(ayah.number, ayah.text)}
                      >
                        ﴿{toArabicNumber(ayah.number)}﴾
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              /* Verse-by-Verse List Mode */
              <div className="space-y-4">
                {SURAH_AL_KAHF_AYAHS.map((ayah) => (
                  <div 
                    key={ayah.number} 
                    className="p-4 bg-white dark:bg-[#14221b] border border-slate-200/80 dark:border-emerald-900/40 hover:border-emerald-500 transition-all group flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <p 
                        className="font-amiri font-bold leading-relaxed text-slate-900 dark:text-slate-100"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {ayah.text}
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-2 shrink-0 pt-1">
                      <span className="w-8 h-8 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-300 font-bold font-mono text-xs flex items-center justify-center">
                        {ayah.number}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyAyah(ayah.number, ayah.text)}
                        className="text-slate-400 hover:text-emerald-800 dark:hover:text-emerald-300 p-1 cursor-pointer"
                        title="نسخ الآية"
                      >
                        {copiedAyah === ayah.number ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Completion Bar */}
        <div className="bg-[#0b1f16] border-t border-emerald-500/30 px-6 py-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-none animate-ping" />
            <p className="text-xs text-slate-200 leading-relaxed font-readex">
              قال النبي ﷺ: <span className="text-amber-200 font-semibold">«مَنْ قَرَأَ سُورَةَ الْكَهْفِ فِي يَوْمِ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ»</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleCompleted}
              className={`px-5 py-2 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors border shadow-sm ${
                isCompleted
                  ? 'bg-emerald-700 border-emerald-400 text-white'
                  : 'bg-emerald-900/90 hover:bg-emerald-800 border-emerald-500/50 text-emerald-100'
              }`}
            >
              <Check size={14} className={isCompleted ? 'text-white' : 'text-emerald-400'} />
              <span>{isCompleted ? 'تمت القراءة بنجاح بحمد الله ✅' : 'تأكيد إتمام قراءة السورة اليوم'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
