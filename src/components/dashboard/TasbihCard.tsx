import React, { useState } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import { audioService } from '../../utils/audio';

export const TasbihCard: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [activePhraseIndex, setActivePhraseIndex] = useState<number>(0);
  const [isConfirmingReset, setIsConfirmingReset] = useState<boolean>(false);

  const phrases = [
    { arabic: 'سُبْحَانَ اللَّهِ', english: 'SubhanAllah', meaning: 'Glory be to Allah' },
    { arabic: 'الْحَمْدُ لِلَّهِ', english: 'Alhamdulillah', meaning: 'Praise be to Allah' },
    { arabic: 'اللَّهُ أَكْبَرُ', english: 'Allahu Akbar', meaning: 'Allah is the Greatest' },
    { arabic: 'أَسْتَغْفِرُ اللَّهَ', english: 'Astaghfirullah', meaning: 'I seek forgiveness' }
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
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
      {/* Header with Dhikr selector & Reset */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <span className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5 text-slate-400">
          <Sparkles size={12} strokeWidth={2.2} className="text-emerald-700" />
          Digital Tasbih
        </span>

        <button
          onClick={handleResetClick}
          className={`text-[11px] font-medium inline-flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer ${
            isConfirmingReset
              ? 'bg-rose-50 text-rose-600 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
          title={isConfirmingReset ? 'Click again to confirm reset' : 'Reset count'}
          aria-label="Reset count"
        >
          <RotateCcw size={11} strokeWidth={2} />
          <span>{isConfirmingReset ? 'Confirm?' : 'Reset'}</span>
        </button>
      </div>

      {/* Selected Dhikr info */}
      <div className="text-center">
        <button
          onClick={() => setActivePhraseIndex((activePhraseIndex + 1) % phrases.length)}
          className="text-xs font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
          title="Click to switch dhikr phrase"
        >
          <span>{phrases[activePhraseIndex].english}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">{phrases[activePhraseIndex].meaning}</span>
        </button>

        <p className="arabic-text text-xl font-bold my-1 text-slate-800">
          {phrases[activePhraseIndex].arabic}
        </p>

        {/* Circular Tap Increment Control */}
        <div className="py-2.5 flex justify-center">
          <button
            onClick={handleTap}
            className="w-20 h-20 rounded-full flex flex-col items-center justify-center text-white bg-emerald-800 hover:bg-emerald-900 shadow-md active:scale-95 transition-all cursor-pointer"
            aria-label={`Current count is ${count} of ${target}. Tap to count.`}
          >
            <span className="font-mono text-2xl font-bold tracking-tight">{count}</span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-200">Tap</span>
          </button>
        </div>

        {/* Progress & Target Switcher */}
        <div className="flex items-center justify-between text-[11px] mt-2 text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>Target:</span>
            <button
              onClick={() => { setTarget(target === 33 ? 100 : 33); setCount(0); }}
              className="font-bold underline cursor-pointer text-emerald-800 hover:text-emerald-950"
              title="Click to switch target between 33 and 100"
            >
              {target}
            </button>
          </div>
          <span>{progress}% complete</span>
        </div>

        <div className="h-1.5 w-full rounded-full overflow-hidden mt-1.5 bg-slate-100">
          <div 
            className="h-full rounded-full transition-all duration-300 bg-emerald-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
