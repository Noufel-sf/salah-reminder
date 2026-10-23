import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Clock, 
  RotateCcw 
} from 'lucide-react';
import { PrayerItem } from '../../types/prayer';
import { audioService } from '../../utils/audio';

interface JumuahModeCardProps {
  prayers: PrayerItem[];
  onOpenKahfReader: () => void;
  salawatGoal?: number;
}

export const JumuahModeCard: React.FC<JumuahModeCardProps> = ({
  prayers,
  onOpenKahfReader,
  salawatGoal = 300
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const kahfKey = `noor_kahf_read_${todayStr}`;
  const salawatKey = `noor_friday_salawat_${todayStr}`;

  const [isKahfRead, setIsKahfRead] = useState<boolean>(() => {
    try {
      return localStorage.getItem(kahfKey) === 'true';
    } catch {
      return false;
    }
  });

  const [salawatCount, setSalawatCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(salawatKey);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Listen for kahf read status change from reader modal
  useEffect(() => {
    const handleKahfStatus = (e: any) => {
      if (typeof e.detail?.isRead === 'boolean') {
        setIsKahfRead(e.detail.isRead);
      }
    };
    window.addEventListener('kahf-read-status-changed', handleKahfStatus);
    return () => window.removeEventListener('kahf-read-status-changed', handleKahfStatus);
  }, []);

  // Update clock every 30 seconds for Friday Hour of Response calculation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleKahfRead = () => {
    const next = !isKahfRead;
    setIsKahfRead(next);
    try {
      localStorage.setItem(kahfKey, String(next));
    } catch {
      // fallback
    }
  };

  const handleIncrementSalawat = (amount: number = 1) => {
    const next = salawatCount + amount;
    setSalawatCount(next);
    audioService.playBeep(0.12);
    try {
      localStorage.setItem(salawatKey, String(next));
    } catch {
      // fallback
    }

    if (salawatCount < salawatGoal && next >= salawatGoal) {
      audioService.playChime(0.4);
    }
  };

  const handleResetSalawat = () => {
    if (salawatCount > 0 && window.confirm('هل تريد إعادة تصفير عداد الصلاة على النبي ﷺ ليوم الجمعة؟')) {
      setSalawatCount(0);
      try {
        localStorage.setItem(salawatKey, '0');
      } catch {
        // fallback
      }
    }
  };

  // Calculate Friday Hour of Response (ساعة الاستجابة) relative to Maghrib
  const maghribPrayer = prayers.find((p) => p.id === 'Maghrib');
  const ijabahInfo = React.useMemo(() => {
    if (!maghribPrayer) {
      return { status: 'unknown', text: 'ساعة الاستجابة: آخر ساعة قبل المغرب' };
    }

    const maghribTime = new Date(maghribPrayer.time);
    const now = currentTime.getTime();
    const maghribMs = maghribTime.getTime();
    const oneHourBeforeMs = maghribMs - 60 * 60 * 1000;

    if (now < oneHourBeforeMs) {
      const diffMins = Math.round((oneHourBeforeMs - now) / (60 * 1000));
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      const timeStr = hours > 0 ? `${hours} ساعة و ${mins} دقيقة` : `${mins} دقيقة`;
      return {
        status: 'upcoming',
        text: `متبقي ${timeStr} على دخول ساعة الاستجابة المباركة`,
        detail: 'تبدأ قبل أذان المغرب بساعة كاملة حتى غروب الشمس'
      };
    } else if (now >= oneHourBeforeMs && now <= maghribMs) {
      const remainingMins = Math.max(1, Math.round((maghribMs - now) / (60 * 1000)));
      return {
        status: 'active',
        text: `✨ نحن الآن في ساعة الاستجابة! متبقي ${remainingMins} دقيقة على غروب الشمس`,
        detail: '«فِيهَا سَاعَةٌ لَا يُوَافِقُهَا عَبْدٌ مُسْلِمٌ يَسْأَلُ اللَّهَ خَيْراً إِلَّا أَعْطَاهُ إِيَّاهُ»'
      };
    } else {
      return {
        status: 'passed',
        text: 'انقضت ساعة استجابة الجمعة مع غروب الشمس',
        detail: 'تقبل الله صالح دعواتكم وأعمالكم'
      };
    }
  }, [maghribPrayer, currentTime]);

  const salawatPercent = Math.min(100, Math.round((salawatCount / Math.max(1, salawatGoal)) * 100));

  return (
    <div className="bg-white dark:bg-[#121f1a] rounded-none border border-slate-200/90 dark:border-emerald-900/40 shadow-sm p-6 text-right font-readex relative overflow-hidden transition-all space-y-6">
      {/* Top Emerald Header Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-800" />

      {/* Main Title & Friday Greeting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1e332a] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <span className="font-amiri font-bold text-xl">🕌</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 font-readex">
                الجمعة المباركة
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-800 text-white">
                خير يوم طلعت عليه الشمس
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-readex mt-0.5">
              سنن وفضائل الجمعة: الغسل، التطيب، التبكير للمسجد، وقراءة سورة الكهف، والإكثار من الصلاة على النبي ﷺ
            </p>
          </div>
        </div>

        <div className="hidden md:block text-left font-readex">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 block">سُنَّةُ النَّبِيِّ ﷺ</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">«أَكْثِرُوا عَلَيَّ مِنَ الصَّلَاةِ فِيهِ»</span>
        </div>
      </div>

      {/* 2-Column Responsive Section: Surah Al-Kahf & Hour of Response */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 1: Surah Al-Kahf */}
        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 border-r-4 border-emerald-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-emerald-800 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">سورة الكهف (نور ما بين الجمعتين)</span>
            </div>
            <span 
              className={`text-[11px] font-bold px-2 py-0.5 ${
                isKahfRead 
                  ? 'bg-emerald-700 text-white' 
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300'
              }`}
            >
              {isKahfRead ? 'تمت القراءة ✅' : 'لم تقرأ بعد'}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-readex">
            «مَنْ قَرَأَ سُورَةَ الْكَهْفِ فِي يَوْمِ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ»
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onOpenKahfReader}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <BookOpen size={14} />
              <span>قراءة سورة الكهف داخل التطبيق</span>
            </button>

            <button
              type="button"
              onClick={handleToggleKahfRead}
              className="px-3 py-2 bg-white dark:bg-[#162520] hover:bg-slate-50 dark:hover:bg-[#1f352c] border border-slate-300 dark:border-[#233b31] text-slate-700 dark:text-slate-200 font-semibold text-xs cursor-pointer transition-colors"
              title="تعديل حالة القراءة"
            >
              {isKahfRead ? 'إلغاء التأكيد' : 'تأكيد القراءة'}
            </button>
          </div>
        </div>

        {/* Section 2: Hour of Response (ساعة الاستجابة) */}
        <div 
          className={`p-4 border-r-4 space-y-3 transition-colors ${
            ijabahInfo.status === 'active'
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500'
              : 'bg-slate-50 dark:bg-[#15231e] border-emerald-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className={ijabahInfo.status === 'active' ? 'text-amber-700 dark:text-amber-400 animate-pulse' : 'text-emerald-800 dark:text-emerald-400'} />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">ساعة الإجابة (آخر ساعة قبل المغرب)</span>
            </div>
            {ijabahInfo.status === 'active' && (
              <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-600 text-white animate-pulse">
                وقت الاستجابة الآن 🤲
              </span>
            )}
          </div>

          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed font-readex">
            {ijabahInfo.text}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-readex">
            {ijabahInfo.detail}
          </p>

          <div className="pt-1 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="text-[11px]">«رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ»</span>
          </div>
        </div>
      </div>

      {/* Section 3: Friday Salawat on the Prophet ﷺ Counter */}
      <div className="p-5 bg-gradient-to-r from-emerald-50/70 via-emerald-50/40 to-transparent dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-transparent border border-emerald-200/80 dark:border-emerald-800/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-800 dark:text-emerald-400" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-readex">
                عداد الصلاة على النبي ﷺ الخاص بيوم الجمعة
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-readex">
                الهدف اليومي المستحب: {salawatGoal} صلاة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-emerald-900 dark:text-emerald-300 bg-white dark:bg-[#162520] px-3 py-1 border border-emerald-300 dark:border-emerald-700/60">
              {salawatCount} / {salawatGoal}
            </span>
            {salawatCount > 0 && (
              <button
                type="button"
                onClick={handleResetSalawat}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white dark:bg-[#162520] border border-slate-200 dark:border-[#233b31] cursor-pointer"
                title="تصفير عداد الجمعة"
              >
                <RotateCcw size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Big Tap Area */}
        <div className="text-center py-2">
          <p className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-emerald-300 mb-3 leading-relaxed">
            «اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ»
          </p>

          <button
            type="button"
            onClick={() => handleIncrementSalawat(1)}
            className="w-full max-w-sm mx-auto py-3 bg-emerald-800 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer font-readex"
          >
            <Sparkles size={16} />
            <span>صَلِّ عَلَى النَّبِيِّ (+1)</span>
          </button>
        </div>

        {/* Progress Bar & Quick Add Buttons */}
        <div className="space-y-2 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/40">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-readex">
            <span>نسبة إنجاز هدف الجمعة: {salawatPercent}%</span>
            <div className="flex items-center gap-1.5">
              {[10, 50, 100].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleIncrementSalawat(amt)}
                  className="px-2.5 py-1 bg-white dark:bg-[#162520] border border-slate-300 dark:border-[#233b31] text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-900 dark:hover:text-emerald-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full bg-slate-200 dark:bg-[#162520] h-2 overflow-hidden">
            <div 
              className="bg-emerald-700 dark:bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${salawatPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
