import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Check, 
  Plus, 
  Minus, 
  Bookmark, 
  Radio, 
  Volume2, 
  Square, 
  Play, 
  Copy, 
  RotateCw,
  Award
} from 'lucide-react';
import { getTodayVerse, getRandomVerse, DailyVerse } from '../../data/dailyVerses';

const QURAN_STORAGE_KEY = 'noor_quran_tracker_v1';

interface QuranTrackerState {
  dailyGoalPages: number;
  pagesReadToday: number;
  totalKhatmahPages: number;
  bookmarkSurah: string;
  bookmarkAyah: number;
  lastDate: string;
}

const DEFAULT_QURAN_STATE: QuranTrackerState = {
  dailyGoalPages: 4,
  pagesReadToday: 0,
  totalKhatmahPages: 0,
  bookmarkSurah: 'البقرة',
  bookmarkAyah: 1,
  lastDate: new Date().toISOString().slice(0, 10)
};

const SURAHS_LIST = [
  { name: 'الفاتحة', number: 1, totalAyahs: 7 },
  { name: 'البقرة', number: 2, totalAyahs: 286 },
  { name: 'آل عمران', number: 3, totalAyahs: 200 },
  { name: 'النساء', number: 4, totalAyahs: 176 },
  { name: 'المائدة', number: 5, totalAyahs: 120 },
  { name: 'الأنعام', number: 6, totalAyahs: 165 },
  { name: 'الأعراف', number: 7, totalAyahs: 206 },
  { name: 'الأنفال', number: 8, totalAyahs: 75 },
  { name: 'التوبة', number: 9, totalAyahs: 129 },
  { name: 'يونس', number: 10, totalAyahs: 109 },
  { name: 'هود', number: 11, totalAyahs: 123 },
  { name: 'يوسف', number: 12, totalAyahs: 111 },
  { name: 'الرعد', number: 13, totalAyahs: 43 },
  { name: 'إبراهيم', number: 14, totalAyahs: 52 },
  { name: 'الحجر', number: 15, totalAyahs: 99 },
  { name: 'النحل', number: 16, totalAyahs: 128 },
  { name: 'الإسراء', number: 17, totalAyahs: 111 },
  { name: 'الكهف', number: 18, totalAyahs: 110 },
  { name: 'مريم', number: 19, totalAyahs: 98 },
  { name: 'طه', number: 20, totalAyahs: 135 },
  { name: 'الأنبياء', number: 21, totalAyahs: 112 },
  { name: 'الحج', number: 22, totalAyahs: 78 },
  { name: 'المؤمنون', number: 23, totalAyahs: 118 },
  { name: 'النور', number: 24, totalAyahs: 64 },
  { name: 'الفرقان', number: 25, totalAyahs: 77 },
  { name: 'الشعراء', number: 26, totalAyahs: 227 },
  { name: 'النمل', number: 27, totalAyahs: 93 },
  { name: 'القصص', number: 28, totalAyahs: 88 },
  { name: 'العنكبوت', number: 29, totalAyahs: 69 },
  { name: 'الروم', number: 30, totalAyahs: 60 },
  { name: 'لقمان', number: 31, totalAyahs: 34 },
  { name: 'السجدة', number: 32, totalAyahs: 30 },
  { name: 'الأحزاب', number: 33, totalAyahs: 73 },
  { name: 'سبأ', number: 34, totalAyahs: 54 },
  { name: 'فاطر', number: 35, totalAyahs: 45 },
  { name: 'يس', number: 36, totalAyahs: 83 },
  { name: 'الصافات', number: 37, totalAyahs: 182 },
  { name: 'ص', number: 38, totalAyahs: 88 },
  { name: 'الزمر', number: 39, totalAyahs: 75 },
  { name: 'غافر', number: 40, totalAyahs: 85 },
  { name: 'فصلت', number: 41, totalAyahs: 54 },
  { name: 'الشورى', number: 42, totalAyahs: 53 },
  { name: 'الزخرف', number: 43, totalAyahs: 89 },
  { name: 'الدخان', number: 44, totalAyahs: 59 },
  { name: 'الجاثية', number: 45, totalAyahs: 37 },
  { name: 'الأحقاف', number: 46, totalAyahs: 35 },
  { name: 'محمد', number: 47, totalAyahs: 38 },
  { name: 'الفتح', number: 48, totalAyahs: 29 },
  { name: 'الحجرات', number: 49, totalAyahs: 18 },
  { name: 'ق', number: 50, totalAyahs: 45 },
  { name: 'الذاريات', number: 51, totalAyahs: 60 },
  { name: 'الطور', number: 52, totalAyahs: 49 },
  { name: 'النجم', number: 53, totalAyahs: 62 },
  { name: 'القمر', number: 54, totalAyahs: 55 },
  { name: 'الرحمن', number: 55, totalAyahs: 78 },
  { name: 'الواقعة', number: 56, totalAyahs: 96 },
  { name: 'الحديد', number: 57, totalAyahs: 29 },
  { name: 'المجادلة', number: 58, totalAyahs: 22 },
  { name: 'الحشر', number: 59, totalAyahs: 24 },
  { name: 'الممتحنة', number: 60, totalAyahs: 13 },
  { name: 'الصف', number: 61, totalAyahs: 14 },
  { name: 'الجمعة', number: 62, totalAyahs: 11 },
  { name: 'المنافقون', number: 63, totalAyahs: 11 },
  { name: 'التغابن', number: 64, totalAyahs: 18 },
  { name: 'الطلاق', number: 65, totalAyahs: 12 },
  { name: 'التحريم', number: 66, totalAyahs: 12 },
  { name: 'الملك', number: 67, totalAyahs: 30 },
  { name: 'القلم', number: 68, totalAyahs: 52 },
  { name: 'الحاقة', number: 69, totalAyahs: 52 },
  { name: 'المعارج', number: 70, totalAyahs: 44 },
  { name: 'نوح', number: 71, totalAyahs: 28 },
  { name: 'الجن', number: 72, totalAyahs: 28 },
  { name: 'المزمل', number: 73, totalAyahs: 20 },
  { name: 'المدثر', number: 74, totalAyahs: 56 },
  { name: 'القيامة', number: 75, totalAyahs: 40 },
  { name: 'الإنسان', number: 76, totalAyahs: 31 },
  { name: 'المرسلات', number: 77, totalAyahs: 50 },
  { name: 'النبأ', number: 78, totalAyahs: 40 },
  { name: 'النازعات', number: 79, totalAyahs: 46 },
  { name: 'عبس', number: 80, totalAyahs: 42 },
  { name: 'التكوير', number: 81, totalAyahs: 29 },
  { name: 'الانفطار', number: 82, totalAyahs: 19 },
  { name: 'المطففين', number: 83, totalAyahs: 36 },
  { name: 'الانشقاق', number: 84, totalAyahs: 25 },
  { name: 'البروج', number: 85, totalAyahs: 22 },
  { name: 'الطارق', number: 86, totalAyahs: 17 },
  { name: 'الأعلى', number: 87, totalAyahs: 19 },
  { name: 'الغاشية', number: 88, totalAyahs: 26 },
  { name: 'الفجر', number: 89, totalAyahs: 30 },
  { name: 'البلد', number: 90, totalAyahs: 20 },
  { name: 'الشمس', number: 91, totalAyahs: 15 },
  { name: 'الليل', number: 92, totalAyahs: 21 },
  { name: 'الضحى', number: 93, totalAyahs: 11 },
  { name: 'الشرح', number: 94, totalAyahs: 8 },
  { name: 'التين', number: 95, totalAyahs: 8 },
  { name: 'العلق', number: 96, totalAyahs: 19 },
  { name: 'القدر', number: 97, totalAyahs: 5 },
  { name: 'البينة', number: 98, totalAyahs: 8 },
  { name: 'الزلزلة', number: 99, totalAyahs: 8 },
  { name: 'العاديات', number: 100, totalAyahs: 11 },
  { name: 'القارعة', number: 101, totalAyahs: 11 },
  { name: 'التكاثر', number: 102, totalAyahs: 8 },
  { name: 'العصر', number: 103, totalAyahs: 3 },
  { name: 'الهمزة', number: 104, totalAyahs: 9 },
  { name: 'الفيل', number: 105, totalAyahs: 5 },
  { name: 'قريش', number: 106, totalAyahs: 4 },
  { name: 'الماعون', number: 107, totalAyahs: 7 },
  { name: 'الكوثر', number: 108, totalAyahs: 3 },
  { name: 'الكافرون', number: 109, totalAyahs: 6 },
  { name: 'النصر', number: 110, totalAyahs: 3 },
  { name: 'المسد', number: 111, totalAyahs: 5 },
  { name: 'الإخلاص', number: 112, totalAyahs: 4 },
  { name: 'الفلق', number: 113, totalAyahs: 5 },
  { name: 'الناس', number: 114, totalAyahs: 6 }
];

const RADIO_STATIONS = [
  { id: 'algeria', name: 'إذاعة القرآن الكريم (الجزائر)', url: 'https://webradio.tda.dz/Coran_64K.mp3' },
  { id: 'makkah', name: 'إذاعة القرآن الكريم (مكة المكرمة)', url: 'https://stream.radiojar.com/0tpy1h0kxtzuv' },
  { id: 'cairo', name: 'إذاعة القرآن الكريم (القاهرة)', url: 'https://stream.zeno.fm/06283y6sm98uv' }
];

export const QuranView: React.FC = () => {
  const [verse, setVerse] = useState<DailyVerse>(getTodayVerse());
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlayingRecitation, setIsPlayingRecitation] = useState<boolean>(false);
  const [recitationAudio, setRecitationAudio] = useState<HTMLAudioElement | null>(null);

  // Live Radio State
  const [activeRadio, setActiveRadio] = useState<string | null>(null);
  const [radioAudio, setRadioAudio] = useState<HTMLAudioElement | null>(null);
  const [isRadioBuffering, setIsRadioBuffering] = useState<boolean>(false);

  // Daily Wird Tracker State
  const [tracker, setTracker] = useState<QuranTrackerState>(() => {
    try {
      const saved = localStorage.getItem(QURAN_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const today = new Date().toISOString().slice(0, 10);
        // Reset pagesReadToday if a new day has arrived
        if (parsed.lastDate !== today) {
          parsed.pagesReadToday = 0;
          parsed.lastDate = today;
        }
        return { ...DEFAULT_QURAN_STATE, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_QURAN_STATE;
  });

  const saveTracker = (updated: QuranTrackerState) => {
    setTracker(updated);
    try {
      localStorage.setItem(QURAN_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    return () => {
      if (recitationAudio) recitationAudio.pause();
      if (radioAudio) radioAudio.pause();
    };
  }, [recitationAudio, radioAudio]);

  const handleNextVerse = () => {
    if (recitationAudio) {
      recitationAudio.pause();
      setIsPlayingRecitation(false);
    }
    setVerse(getRandomVerse(verse.id));
  };

  const handleCopyVerse = () => {
    const text = `﴿ ${verse.arabic} ﴾\n[سورة ${verse.surah} - الآية ${verse.ayah}]\n\nالتفسير الميسر: ${verse.tafseer}\nوقفة تدبرية: ${verse.reflection}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleRecitation = () => {
    if (isPlayingRecitation && recitationAudio) {
      recitationAudio.pause();
      setIsPlayingRecitation(false);
      return;
    }

    if (verse.audioUrl) {
      if (recitationAudio) recitationAudio.pause();
      const a = new Audio(verse.audioUrl);
      setRecitationAudio(a);
      setIsPlayingRecitation(true);

      a.onended = () => setIsPlayingRecitation(false);
      a.onerror = () => setIsPlayingRecitation(false);
      a.play().catch(() => setIsPlayingRecitation(false));
    }
  };

  const handleToggleRadio = (station: typeof RADIO_STATIONS[0]) => {
    if (activeRadio === station.id && radioAudio) {
      radioAudio.pause();
      setActiveRadio(null);
      setIsRadioBuffering(false);
      return;
    }

    if (radioAudio) {
      radioAudio.pause();
    }

    setIsRadioBuffering(true);
    const a = new Audio(station.url);
    setRadioAudio(a);
    setActiveRadio(station.id);

    a.onplaying = () => setIsRadioBuffering(false);
    a.onerror = () => {
      setIsRadioBuffering(false);
      setActiveRadio(null);
      alert('تعذر تشغيل البث المباشر للإذاعة حالياً، يرجى المحاولة لاحقاً.');
    };

    a.play().catch(() => {
      setIsRadioBuffering(false);
      setActiveRadio(null);
    });
  };

  const handleAddPages = (delta: number) => {
    const newPages = Math.max(0, tracker.pagesReadToday + delta);
    const newTotal = Math.max(0, (tracker.totalKhatmahPages || 0) + delta);
    saveTracker({
      ...tracker,
      pagesReadToday: newPages,
      totalKhatmahPages: newTotal
    });
  };

  const wirdPercent = Math.min(
    100,
    Math.round((tracker.pagesReadToday / Math.max(1, tracker.dailyGoalPages)) * 100)
  );

  const khatmahPercent = Math.min(
    100,
    Math.round(((tracker.totalKhatmahPages % 604) / 604) * 100)
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-right font-readex">
      {/* 1. Header Banner */}
      <div className="bg-[#0b1f16] border border-emerald-500/40 p-6 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-900 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-300">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-readex text-slate-100">المصحف الشريف والورد اليومي</h2>
            <p className="text-xs text-emerald-200/90 font-readex">
              «اقْرَؤُوا القُرْآنَ فإنَّه يَأْتي يَومَ القِيامَةِ شَفِيعًا لأَصْحابِهِ» — رتّل آيات الله وتدبّر معانيها
            </p>
          </div>
        </div>

        {/* Live Quran Radios Quick Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 ml-2">
            <Radio size={14} className={activeRadio ? 'animate-pulse text-amber-400' : ''} />
            <span>إذاعات القرآن:</span>
          </span>
          {RADIO_STATIONS.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => handleToggleRadio(st)}
              className={`px-3 py-1.5 rounded-none text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                activeRadio === st.id
                  ? 'bg-amber-600 border-amber-400 text-white font-bold animate-pulse'
                  : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-100 hover:bg-emerald-900'
              }`}
            >
              {activeRadio === st.id ? <Square size={11} /> : <Play size={11} />}
              <span>
                {activeRadio === st.id && isRadioBuffering
                  ? 'جاري الاتصال...'
                  : st.name.replace('إذاعة القرآن الكريم ', '')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main 2-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left / Ayah of the Day & Deep Tafseer (xl:col-span-7) */}
        <div className="xl:col-span-7 space-y-6">
          <div className="bg-white p-7 border border-slate-200/90 shadow-sm space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
                  <Sparkles size={16} />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-readex">آية اليوم وتفسيرها الميسر</h3>
                  <span className="text-[11px] text-emerald-700 font-semibold">{verse.theme}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold font-readex">
                  سورة {verse.surah} • الآية {verse.ayah} (الجزء {verse.juz})
                </span>
              </div>
            </div>

            {/* Arabic Quranic Calligraphy */}
            <div className="bg-gradient-to-b from-emerald-50/60 to-transparent p-6 border border-emerald-100 text-center my-2">
              <p className="font-amiri text-2xl sm:text-3xl font-extrabold text-slate-900 leading-loose select-text">
                ﴿ {verse.arabic} ﴾
              </p>
            </div>

            {/* Tafseer Muyassar */}
            <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5 font-readex">
                <BookOpen size={14} className="text-emerald-700" />
                <span>التفسير الميسر:</span>
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-readex">
                {verse.tafseer}
              </p>
            </div>

            {/* Reflection & Daily Action */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 space-y-2">
              <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5 font-readex">
                <Sparkles size={14} className="text-emerald-700" />
                <span>وقفة تدبرية وعمل بالآية:</span>
              </span>
              <p className="text-xs text-emerald-950 leading-relaxed font-readex">
                {verse.reflection}
              </p>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {verse.audioUrl && (
                  <button
                    type="button"
                    onClick={handleToggleRecitation}
                    className={`px-3 py-1.5 rounded-none border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      isPlayingRecitation
                        ? 'bg-rose-700 border-rose-700 text-white animate-pulse'
                        : 'bg-emerald-800 border-emerald-800 text-white hover:bg-emerald-900'
                    }`}
                  >
                    {isPlayingRecitation ? <Square size={13} /> : <Volume2 size={13} />}
                    <span>{isPlayingRecitation ? 'إيقاف التلاوة' : 'استماع للآية'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyVerse}
                  className="px-3 py-1.5 bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copied ? <Check size={13} className="text-emerald-700" /> : <Copy size={13} />}
                  <span>{copied ? 'تم النسخ' : 'نسخ الآية والتفسير'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleNextVerse}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCw size={13} />
                <span>آية أخرى للتدبر</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right / Daily Wird & Bookmark Tracker (xl:col-span-5) */}
        <div className="xl:col-span-5 space-y-6">
          {/* Daily Wird Goal Card */}
          <div className="bg-white p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
                  <Award size={16} />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-readex">متابع الورد القرآني اليومي</h3>
                  <span className="text-[10px] text-slate-500 font-readex">تثبيت وتتبع قراءة وردك يومياً</span>
                </div>
              </div>

              <span className="text-xs font-bold font-mono px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700">
                {tracker.pagesReadToday} / {tracker.dailyGoalPages} صفحة
              </span>
            </div>

            {/* Progress indicator */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600 font-readex">
                <span>نسبة إنجاز ورد اليوم</span>
                <span className="font-mono text-emerald-800 font-bold">{wirdPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 border border-slate-200 overflow-hidden">
                <div
                  className="bg-emerald-700 h-full transition-all duration-500"
                  style={{ width: `${wirdPercent}%` }}
                />
              </div>
            </div>

            {/* Quick add buttons */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <span className="text-xs font-bold text-slate-700">تسجيل الصفحات:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddPages(-1)}
                  disabled={tracker.pagesReadToday <= 0}
                  className="w-7 h-7 bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center font-bold text-xs cursor-pointer"
                  title="إنقاص صفحة"
                >
                  <Minus size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPages(1)}
                  className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs cursor-pointer flex items-center gap-1"
                >
                  <Plus size={12} />
                  <span>+1 صفحة</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPages(4)}
                  className="px-2.5 py-1 bg-emerald-100 border border-emerald-300 text-emerald-900 hover:bg-emerald-200 font-bold text-xs cursor-pointer"
                >
                  +4 صفحات
                </button>
              </div>
            </div>

            {/* Daily Goal selector */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600 font-readex">الهدف اليومي المستهدف:</label>
              <div className="flex gap-1">
                {[2, 4, 10, 20].map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => saveTracker({ ...tracker, dailyGoalPages: goal })}
                    className={`px-2.5 py-1 text-xs font-semibold border cursor-pointer font-readex transition-colors ${
                      tracker.dailyGoalPages === goal
                        ? 'bg-emerald-800 border-emerald-800 text-white font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {goal} ص
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bookmark & Khatmah Tracker */}
          <div className="bg-white p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
                  <Bookmark size={16} />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-readex">العلامة المرجعية (الفاصِلة)</h3>
                  <span className="text-[10px] text-slate-500 font-readex">حفظ آخر سورة وآية توقفت عندها</span>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-800 font-readex bg-emerald-50 px-2.5 py-1 border border-emerald-200">
                سورة {tracker.bookmarkSurah} • الآية {tracker.bookmarkAyah}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">اسم السورة:</label>
                <select
                  value={tracker.bookmarkSurah}
                  onChange={(e) => saveTracker({ ...tracker, bookmarkSurah: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 font-readex text-right"
                >
                  {SURAHS_LIST.map((s) => (
                    <option key={s.number} value={s.name}>
                      {s.number}. سورة {s.name} ({s.totalAyahs} آية)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">رقم الآية:</label>
                <input
                  type="number"
                  min="1"
                  max="286"
                  value={tracker.bookmarkAyah}
                  onChange={(e) => saveTracker({ ...tracker, bookmarkAyah: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-50 border border-slate-200 p-2 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 text-center"
                />
              </div>
            </div>

            {/* Khatmah Progress */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600 font-readex">
                <span>تقدم ختمة المصحف (604 صفحة)</span>
                <span className="font-mono text-slate-800 font-bold">
                  {tracker.totalKhatmahPages % 604} / 604 ص ({khatmahPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 border border-slate-200 overflow-hidden">
                <div
                  className="bg-amber-600 h-full transition-all duration-500"
                  style={{ width: `${khatmahPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
