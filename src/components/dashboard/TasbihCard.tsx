import React, { useState } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import { audioService } from '../../utils/audio';

export const TasbihCard: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [activePhraseIndex, setActivePhraseIndex] = useState<number>(0);
  const [isConfirmingReset, setIsConfirmingReset] = useState<boolean>(false);

  const phrases = [
    { arabic: 'سُبْحَانَ اللَّهِ', title: 'التسبيح', meaning: 'تنزيه الله عن كل نقص' },
    { arabic: 'الْحَمْدُ لِلَّهِ', title: 'التحميد', meaning: 'الشكر والثناء على نعم الله' },
    { arabic: 'اللَّهُ أَكْبَرُ', title: 'التكبير', meaning: 'الله أعظم من كل شيء' },
    { arabic: 'أَسْتَغْفِرُ اللَّهَ', title: 'الاستغفار', meaning: 'طلب المغفرة والصفح' },
    { arabic: 'لا حَوْلَ وَلا قُوَّةَ إِلاَّ بِاللَّهِ', title: 'الحوقلة', meaning: 'التوكل والاستعانة بالله' }
  ];

  const handleTap = () => {
    const nextCount = count + 1;
    audioService.playBeep(0.15);

    if (nextCount >= target) {
      setCount(0);
      audioService.playChime(0.4);
    } else {
      setCount(nextCount);
    }
  };

  const handleResetClick = () => {
    if (count > 0 && !isConfirmingReset) {
      setIsConfirmingReset(true);
      setTimeout(() => setIsConfirmingReset(false), 3000);
      return;
    }
    setCount(0);
    setIsConfirmingReset(false);
  };

  const progress = Math.min(100, Math.round((count / target) * 100));

  return (
    <div className="bg-white rounded-none p-6 border border-slate-200/90 shadow-sm text-right">
      {/* Header with Dhikr selector & Reset */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <span className="text-[11px] font-bold flex items-center gap-1.5 text-slate-500 font-readex">
          <Sparkles size={13} strokeWidth={2.2} className="text-emerald-700" />
          المسبحة الإلكترونية
        </span>

        <button
          onClick={handleResetClick}
          className={`text-[11px] font-medium inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none transition-colors cursor-pointer font-readex ${
            isConfirmingReset
              ? 'bg-rose-50 text-rose-600 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
          title={isConfirmingReset ? 'انقر مرة أخرى لتأكيد التصفير' : 'إعادة ضبط العداد'}
          aria-label="إعادة ضبط العداد"
        >
          <RotateCcw size={11} strokeWidth={2} />
          <span>{isConfirmingReset ? 'تأكيد؟' : 'إعادة ضبط'}</span>
        </button>
      </div>

      {/* Selected Dhikr info */}
      <div className="text-center">
        <button
          onClick={() => setActivePhraseIndex((activePhraseIndex + 1) % phrases.length)}
          className="text-xs font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors font-readex"
          title="انقر لتغيير صيغة الذكر"
        >
          <span>{phrases[activePhraseIndex].title}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">{phrases[activePhraseIndex].meaning}</span>
        </button>

        <p className="font-amiri text-2xl font-bold my-1 text-slate-900 leading-relaxed">
          {phrases[activePhraseIndex].arabic}
        </p>

        {/* Tap Increment Control */}
        <div className="py-2.5 flex justify-center">
          <button
            onClick={handleTap}
            className="w-20 h-20 rounded-none flex flex-col items-center justify-center text-white bg-emerald-800 hover:bg-emerald-900 shadow-md active:scale-95 transition-all cursor-pointer"
            aria-label={`العدد الحالي هو ${count} من ${target}. اضغط للعد.`}
          >
            <span className="font-mono text-2xl font-bold tracking-tight">{count}</span>
            <span className="text-[10px] font-bold tracking-wide text-emerald-200 font-readex">تسبيح</span>
          </button>
        </div>

        {/* Progress & Target Switcher */}
        <div className="flex items-center justify-between text-[11px] mt-2 text-slate-500 font-readex">
          <div className="flex items-center gap-1.5">
            <span>الهدف:</span>
            <button
              onClick={() => { setTarget(target === 33 ? 100 : 33); setCount(0); }}
              className="font-bold underline cursor-pointer text-emerald-800 hover:text-emerald-950 font-mono"
              title="انقر للتبديل بين ٣٣ و ١٠٠"
            >
              {target}
            </button>
          </div>
          <span>مكتمل {progress}%</span>
        </div>

        <div className="h-1.5 w-full rounded-none overflow-hidden mt-1.5 bg-slate-100">
          <div 
            className="h-full rounded-none transition-all duration-300 bg-emerald-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
