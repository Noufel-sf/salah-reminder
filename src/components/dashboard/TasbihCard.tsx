import React, { useState } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import { audioService } from '../../utils/audio';

interface TasbihCardProps {
  onCountChange?: (count: number) => void;
}

export const TasbihCard: React.FC<TasbihCardProps> = () => {
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
    <div 
      className="pro-card p-5 transition-colors"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      {/* Header with Dhikr selector & Reset */}
      <div 
        className="flex items-center justify-between pb-3 mb-3 border-b"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <span 
          className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          <Sparkles size={12} strokeWidth={2.2} style={{ color: 'var(--color-primary)' }} />
          Digital Tasbih
        </span>

        <button
          onClick={handleResetClick}
          className="text-[11px] font-medium inline-flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer"
          style={{
            backgroundColor: isConfirmingReset ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
            color: isConfirmingReset ? '#EF4444' : 'var(--color-text-tertiary)'
          }}
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
          className="text-xs font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
          style={{ color: 'var(--color-primary)' }}
          title="Click to switch dhikr phrase"
        >
          <span>{phrases[activePhraseIndex].english}</span>
          <span style={{ color: 'var(--color-text-tertiary)' }}>•</span>
          <span style={{ color: 'var(--color-text-secondary)' }}>{phrases[activePhraseIndex].meaning}</span>
        </button>

        <p 
          className="arabic-text text-xl font-bold my-1"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {phrases[activePhraseIndex].arabic}
        </p>

        {/* Circular Tap Increment Control */}
        <div className="py-2 flex justify-center">
          <button
            onClick={handleTap}
            className="w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-md transition-transform active:scale-95 hover:scale-105 cursor-pointer"
            style={{
              backgroundColor: 'var(--color-primary)',
              boxShadow: '0 4px 16px rgba(21, 92, 69, 0.25)'
            }}
            aria-label={`Current count is ${count} of ${target}. Tap to count.`}
          >
            <span className="font-mono text-2xl font-bold tracking-tight">{count}</span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-white/80">Tap</span>
          </button>
        </div>

        {/* Progress & Target Switcher */}
        <div className="flex items-center justify-between text-[11px] mt-2" style={{ color: 'var(--color-text-secondary)' }}>
          <div className="flex items-center gap-1.5">
            <span>Target:</span>
            <button
              onClick={() => { setTarget(target === 33 ? 100 : 33); setCount(0); }}
              className="font-bold underline cursor-pointer hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
              title="Click to switch target between 33 and 100"
            >
              {target}
            </button>
          </div>
          <span>{progress}% complete</span>
        </div>

        <div 
          className="h-1.5 w-full rounded-full overflow-hidden mt-1"
          style={{ backgroundColor: 'var(--color-surface-muted)' }}
        >
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${progress}%`,
              backgroundColor: 'var(--color-primary)'
            }}
          />
        </div>
      </div>
    </div>
  );
};
