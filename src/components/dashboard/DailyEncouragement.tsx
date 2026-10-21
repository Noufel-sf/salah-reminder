import React from 'react';
import { Sparkles } from 'lucide-react';

export const DailyEncouragement: React.FC = () => {
  return (
    <div className="p-4 rounded-2xl border border-emerald-200/90 bg-emerald-50/70 flex items-center gap-3.5 shadow-2xs">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-700 text-white shadow-xs">
        <Sparkles size={16} strokeWidth={2} />
      </div>

      <div className="min-w-0">
        <h4 className="text-xs font-bold text-emerald-950">
          Daily Reminder
        </h4>
        <p className="text-xs mt-0.5 leading-normal text-emerald-800">
          "Keep your connection with Allah strong. Prayer is the comfort of the believer and light for the soul."
        </p>
      </div>
    </div>
  );
};
