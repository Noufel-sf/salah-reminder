import React, { useState, useEffect } from 'react';
import { RotateCcw, Volume2, VolumeX, Sparkles, Award, BookOpen } from 'lucide-react';
import { audioService } from '../../utils/audio';
import { DHIKR_ITEMS, incrementDhikr, getTodayDhikr, getAllTimeDhikrTotals } from '../../utils/worshipStats';
import { getDhikrMilestoneFeedback, DhikrMilestoneFeedback } from '../../utils/dhikrMilestones';
import { DhikrMilestoneModal } from '../tasbih/DhikrMilestoneModal';

export const TasbihView: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [activePhraseIndex, setActivePhraseIndex] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [todayRecord, setTodayRecord] = useState(getTodayDhikr());
  const [allTimeTotals, setAllTimeTotals] = useState(getAllTimeDhikrTotals());
  const [activeMilestone, setActiveMilestone] = useState<DhikrMilestoneFeedback | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setTodayRecord(getTodayDhikr());
      setAllTimeTotals(getAllTimeDhikrTotals());
    };
    window.addEventListener('worship-stats-updated', handleUpdate);
    return () => window.removeEventListener('worship-stats-updated', handleUpdate);
  }, []);

  useEffect(() => {
    const handleSpaceTap = () => {
      setCount((prev) => {
        const next = prev + 1;
        if (next >= target) {
          audioService.playChime(0.5);
          const feedback = getDhikrMilestoneFeedback(target);
          setActiveMilestone(feedback);
          return 0;
        }
        return next;
      });
    };
    window.addEventListener('space-tasbih-tap', handleSpaceTap);
    return () => window.removeEventListener('space-tasbih-tap', handleSpaceTap);
  }, [target]);

  const currentDhikr = DHIKR_ITEMS[activePhraseIndex] || DHIKR_ITEMS[0];

  const handleTap = () => {
    const nextCount = count + 1;
    if (soundEnabled) {
      audioService.playBeep(0.2);
    }

    // Record real dhikr statistic
    incrementDhikr(currentDhikr.key);

    if (nextCount >= target) {
      setCount(0);
      audioService.playChime(0.5);
      const feedback = getDhikrMilestoneFeedback(target);
      setActiveMilestone(feedback);
    } else {
      setCount(nextCount);
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  const handleNextPhrase = () => {
    setActiveMilestone(null);
    setActivePhraseIndex((prev) => (prev + 1) % DHIKR_ITEMS.length);
    setCount(0);
  };

  const progress = Math.min(100, (count / target) * 100);

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6 text-right font-readex">
      <div className="bg-white dark:bg-[#0e1914] rounded-none p-8 border border-slate-200/90 dark:border-[#233b31] shadow-sm text-center relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1a2c25] mb-6">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-700 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-readex">المسبحة الإلكترونية</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-none border border-slate-200 dark:border-[#233b31] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#15241e] cursor-pointer transition-colors"
              title={soundEnabled ? 'كتم صوت النقرة' : 'تفعيل صوت النقرة'}
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-none border border-slate-200 dark:border-[#233b31] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#15241e] cursor-pointer transition-colors"
              title="إعادة تصفير العداد"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* Phrase Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 justify-center mb-6">
          {DHIKR_ITEMS.map((item, idx) => (
            <button
              key={item.key}
              onClick={() => {
                setActivePhraseIndex(idx);
                setCount(0);
              }}
              className={`px-3.5 py-1.5 rounded-none text-xs font-semibold transition-all cursor-pointer font-readex flex items-center gap-1.5 ${
                activePhraseIndex === idx
                  ? 'bg-emerald-800 text-white shadow-xs font-bold'
                  : 'bg-slate-50 dark:bg-[#12201b] border border-slate-200 dark:border-[#233b31] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1c3029]'
              }`}
            >
              <span>{item.title}</span>
              <span className={`text-[10px] px-1 font-mono ${activePhraseIndex === idx ? 'bg-emerald-900 text-emerald-100' : 'bg-slate-200/60 dark:bg-[#1f352c] text-slate-500 dark:text-slate-400'}`}>
                {todayRecord[item.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Current Dhikr Display */}
        <div className="py-2">
          <p className="font-amiri text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-2 leading-relaxed">
            {currentDhikr.arabic}
          </p>
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400 font-readex">
            {currentDhikr.title}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-readex mt-0.5">
            {currentDhikr.meaning}
          </p>
        </div>

        {/* Tap Dial Button */}
        <div className="my-8">
          <button
            onClick={handleTap}
            className="w-48 h-48 mx-auto rounded-none bg-gradient-to-l from-[#113829] via-[#164e3c] to-[#205c47] text-white flex flex-col items-center justify-center shadow-xl shadow-emerald-950/20 hover:scale-105 active:scale-95 transition-all cursor-pointer border-4 border-white dark:border-[#233b31]"
          >
            <span className="text-6xl font-black font-mono tracking-tight">{count}</span>
            <span className="text-xs text-emerald-200 tracking-wider mt-1 font-bold font-readex">اضغط للتسبيح</span>
          </button>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-readex">
            <span>أو اضغط مفتاح</span>
            <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-[#1a2c25] border border-slate-300 dark:border-[#2d493e] font-mono text-slate-800 dark:text-slate-200 font-bold shadow-xs">Space</kbd>
            <span>في أي مكان للتسبيح السريع</span>
          </div>
        </div>

        {/* Progress & Target Settings */}
        <div className="max-w-sm mx-auto">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 font-readex">
            <span>الهدف: {target} تسبيحة</span>
            <span>مكتمل {Math.round(progress)}%</span>
          </div>

          <div className="h-2.5 w-full bg-slate-100 dark:bg-[#162520] rounded-none overflow-hidden">
            <div
              className="h-full bg-emerald-700 dark:bg-emerald-500 rounded-none transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Quick Target Switcher */}
          <div className="flex items-center justify-center gap-2 mt-4 font-readex">
            <span className="text-xs text-slate-500 dark:text-slate-400">تغيير الهدف:</span>
            {[33, 99, 100, 300, 1000].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTarget(t);
                  setCount(0);
                }}
                className={`px-3 py-1 rounded-none text-xs font-bold cursor-pointer font-mono transition-colors ${
                  target === t
                    ? 'bg-emerald-800 text-white'
                    : 'bg-slate-50 dark:bg-[#12201b] border border-slate-200 dark:border-[#233b31] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1c3029]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Real Dhikr Statistics Summary */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-[#1a2c25] text-right">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-readex">
              <Award size={15} className="text-emerald-700 dark:text-emerald-400" />
              سجل الأذكار اليومي المحفوظ
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-readex">
              مجموع اليوم: <span className="font-bold font-mono text-emerald-800 dark:text-emerald-400">{todayRecord.total}</span> | الكلي: <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{allTimeTotals.total}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DHIKR_ITEMS.map((item) => (
              <div key={item.key} className="p-3 bg-slate-50 dark:bg-[#12201b] border border-slate-200 dark:border-[#233b31] text-right">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">{item.title}</span>
                <span className="font-mono text-lg font-bold text-slate-900 dark:text-slate-100 block mt-0.5">{todayRecord[item.key]}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">إجمالي كلي: {allTimeTotals[item.key]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inspiring Dhikr Ayah Footer Banner */}
      <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border-r-4 border-emerald-800 text-right space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
          <BookOpen size={14} className="text-emerald-700 dark:text-emerald-400" />
          <span>فضل دوام الذكر والاستغفار</span>
        </div>
        <p className="font-amiri text-lg text-emerald-950 dark:text-emerald-200 leading-relaxed">
          ﴿فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ﴾
        </p>
        <p className="text-[11px] text-slate-600 dark:text-slate-400">
          كل تسبيحة غرس في الجنة، وكل تحميدة تملأ الميزان بالخير والبركة.
        </p>
      </div>

      {/* Milestone Modal Feedback */}
      {activeMilestone && (
        <DhikrMilestoneModal
          milestone={activeMilestone}
          totalTodayCount={todayRecord.total}
          onContinue={() => setActiveMilestone(null)}
          onNextPhrase={handleNextPhrase}
        />
      )}
    </div>
  );
};
