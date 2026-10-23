import React from 'react';
import { Sparkles, X, ArrowLeft, BookOpen, Award } from 'lucide-react';
import { DhikrMilestoneFeedback } from '../../utils/dhikrMilestones';

interface DhikrMilestoneModalProps {
  milestone: DhikrMilestoneFeedback;
  totalTodayCount?: number;
  onContinue: () => void;
  onNextPhrase?: () => void;
}

export const DhikrMilestoneModal: React.FC<DhikrMilestoneModalProps> = ({
  milestone,
  totalTodayCount,
  onContinue,
  onNextPhrase
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-readex animate-fade-in text-right">
      <div className="bg-white dark:bg-[#0e1914] w-full max-w-lg shadow-2xl border-2 border-emerald-800 rounded-none relative overflow-hidden flex flex-col">
        {/* Top Header Banner */}
        <div className="p-5 bg-gradient-to-l from-emerald-900 via-emerald-800 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-emerald-700/80 border border-emerald-500/40 flex items-center justify-center text-emerald-200 shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <span className="text-[11px] text-emerald-200 font-semibold block">إنجاز ورد الذكر</span>
              <h3 className="text-sm font-bold text-white">{milestone.badge}</h3>
            </div>
          </div>

          <button
            onClick={onContinue}
            className="text-emerald-200 hover:text-white p-1 cursor-pointer transition-colors"
            title="إغلاق"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 select-text overflow-y-auto max-h-[75vh]">
          {/* Ayah Card */}
          <div className="p-5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/50 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/50">
              <BookOpen size={12} />
              <span>آية كريمة في فضل الذكر</span>
            </span>

            <p className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-emerald-100 leading-relaxed px-2">
              ﴿ {milestone.ayah} ﴾
            </p>

            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 block font-mono">
              [{milestone.ayahSurah}]
            </span>
          </div>

          {/* Hadith & Virtue */}
          {milestone.hadith && (
            <div className="p-4 bg-slate-50 dark:bg-[#13221c] border border-slate-200 dark:border-[#233b31] space-y-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                حديث نبوي شريف:
              </span>
              <p className="font-amiri text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed text-justify">
                {milestone.hadith}
              </p>
            </div>
          )}

          {/* Reflection */}
          <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-xs leading-relaxed text-amber-950 dark:text-amber-200">
            <span className="font-bold">نفحة إيمانية: </span>
            <span>{milestone.reflection}</span>
          </div>

          {/* Today Count Badge */}
          {typeof totalTodayCount === 'number' && (
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-[#1a2c25]">
              <span className="flex items-center gap-1.5">
                <Award size={14} className="text-emerald-700 dark:text-emerald-400" />
                <span>مجموع أذكارك لليوم:</span>
              </span>
              <span className="font-mono text-sm font-bold text-emerald-800 dark:text-emerald-400">
                {totalTodayCount} ذكراً
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-[#12201b] border-t border-slate-200 dark:border-[#233b31] flex items-center justify-end gap-2.5">
          {onNextPhrase && (
            <button
              onClick={onNextPhrase}
              className="px-4 py-2.5 rounded-none border border-slate-300 dark:border-[#2d493e] bg-white dark:bg-[#1a2c25] hover:bg-slate-100 dark:hover:bg-[#253f34] text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              الانتقال للذكر التالي ⏭️
            </button>
          )}

          <button
            onClick={onContinue}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-none bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer transition-colors"
          >
            <span>متابعة التسبيح</span>
            <ArrowLeft size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
