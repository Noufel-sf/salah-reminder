import React, { useState } from 'react';
import { RotateCcw, Volume2, VolumeX, Sparkles, Award } from 'lucide-react';
import { audioService } from '../../utils/audio';

export const TasbihView: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [activePhraseIndex, setActivePhraseIndex] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [totalCompleted, setTotalCompleted] = useState<number>(0);

  const phrases = [
    { arabic: 'سُبْحَانَ اللَّهِ', english: 'SubhanAllah', meaning: 'Glory be to Allah' },
    { arabic: 'الْحَمْدُ لِلَّهِ', english: 'Alhamdulillah', meaning: 'All praise is for Allah' },
    { arabic: 'اللَّهُ أَكْبَرُ', english: 'Allahu Akbar', meaning: 'Allah is the Greatest' },
    { arabic: 'أَسْتَغْفِرُ اللَّهَ', english: 'Astaghfirullah', meaning: 'I seek forgiveness from Allah' },
    { arabic: 'لا إِلَهَ إِلا اللَّهُ', english: 'La ilaha illallah', meaning: 'None has the right to be worshipped but Allah' }
  ];

  const handleTap = () => {
    const nextCount = count + 1;
    if (soundEnabled) {
      audioService.playBeep(0.2);
    }

    if (nextCount >= target) {
      setCount(0);
      setTotalCompleted(totalCompleted + 1);
      audioService.playChime(0.5);
    } else {
      setCount(nextCount);
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  const progress = Math.min(100, (count / target) * 100);

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="sage-card p-8 text-center relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#edf3ee] mb-6">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#52b788]" />
            <h2 className="text-lg font-bold text-[#114232]">Digital Tasbih Counter</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl border border-[#edf3ee] text-[#74897f] hover:text-[#114232] hover:bg-[#f0f7f2]"
              title={soundEnabled ? 'Mute tap sound' : 'Enable tap sound'}
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-xl border border-[#edf3ee] text-[#74897f] hover:text-[#114232] hover:bg-[#f0f7f2]"
              title="Reset Counter"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* Phrase Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 justify-center mb-6">
          {phrases.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActivePhraseIndex(idx);
                setCount(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activePhraseIndex === idx
                  ? 'bg-[#164e3c] text-white shadow-sm'
                  : 'bg-[#fafbfa] border border-[#edf3ee] text-[#486356] hover:bg-[#f0f7f2]'
              }`}
            >
              {phrase.english}
            </button>
          ))}
        </div>

        {/* Current Dhikr Display */}
        <div className="py-2">
          <p className="arabic-calligraphy text-4xl font-bold text-[#114232] mb-2 leading-relaxed">
            {phrases[activePhraseIndex].arabic}
          </p>
          <p className="text-sm font-semibold text-[#2d6a4f]">
            {phrases[activePhraseIndex].english}
          </p>
          <p className="text-xs text-[#74897f]">
            {phrases[activePhraseIndex].meaning}
          </p>
        </div>

        {/* Big Tap Dial Button */}
        <div className="my-8">
          <button
            onClick={handleTap}
            className="w-48 h-48 mx-auto rounded-full bg-gradient-to-b from-[#164e3c] via-[#205c47] to-[#2d6a4f] text-white flex flex-col items-center justify-center shadow-xl shadow-[#164e3c]/25 hover:scale-105 active:scale-95 transition-all cursor-pointer border-4 border-white"
          >
            <span className="text-6xl font-black font-mono tracking-tight">{count}</span>
            <span className="text-xs text-[#a3e4c0] uppercase tracking-widest mt-1 font-semibold">Tap for Dhikr</span>
          </button>
        </div>

        {/* Progress & Target Settings */}
        <div className="max-w-sm mx-auto">
          <div className="flex justify-between items-center text-xs font-semibold text-[#74897f] mb-2">
            <span>Goal: {target} repetitions</span>
            <span>{Math.round(progress)}% complete</span>
          </div>

          <div className="h-2.5 w-full bg-[#eaf4ee] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#52b788] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Quick Target Switcher */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-xs text-[#74897f]">Change Goal:</span>
            {[33, 99, 100].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTarget(t);
                  setCount(0);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  target === t
                    ? 'bg-[#2d6a4f] text-white'
                    : 'bg-[#fafbfa] border border-[#edf3ee] text-[#486356]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[#edf3ee] flex items-center justify-center gap-2 text-xs text-[#2d6a4f] font-semibold">
            <Award size={16} className="text-[#52b788]" />
            <span>Total Sets Completed: {totalCompleted}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
