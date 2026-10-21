import React from 'react';
import { Sparkles } from 'lucide-react';

export const DailyEncouragement: React.FC = () => {
  return (
    <div className="p-4 rounded-none border border-emerald-200/90 bg-emerald-50/70 flex items-center gap-3.5 shadow-2xs text-right">
      <div className="w-9 h-9 rounded-none flex items-center justify-center shrink-0 bg-emerald-700 text-white shadow-xs">
        <Sparkles size={16} strokeWidth={2} />
      </div>

      <div className="min-w-0">
        <h4 className="text-xs font-bold text-emerald-950 font-readex">
          تذكرة اليوم
        </h4>
        <p className="text-xs mt-0.5 leading-normal text-emerald-800 font-readex">
          «حافظ على صلاتك، فإن الصلاة صلة العبد بربه، وراحة لقلب المؤمن ونور لدربه.»
        </p>
      </div>
    </div>
  );
};
