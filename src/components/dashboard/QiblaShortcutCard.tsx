import React from 'react';
import { Compass, ChevronRight } from 'lucide-react';

interface QiblaShortcutCardProps {
  qiblaAngle: number;
  cityName: string;
  onOpenQiblaTab: () => void;
}

export const QiblaShortcutCard: React.FC<QiblaShortcutCardProps> = ({
  qiblaAngle,
  cityName,
  onOpenQiblaTab
}) => {
  return (
    <div 
      onClick={onOpenQiblaTab}
      className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onOpenQiblaTab();
        }
      }}
      aria-label={`Qibla direction is ${qiblaAngle} degrees clockwise from North in ${cityName}. Click to open full compass.`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-800 border border-emerald-200 group-hover:scale-105 transition-transform">
          <Compass size={20} strokeWidth={2.2} />
        </div>
        <div className="truncate">
          <h4 className="text-xs font-bold tracking-tight truncate text-slate-900">
            Qibla Direction
          </h4>
          <p className="text-[11px] truncate mt-0.5 text-slate-500">
            {qiblaAngle}° Clockwise from North ({cityName})
          </p>
        </div>
      </div>

      <span className="text-xs font-semibold inline-flex items-center gap-0.5 shrink-0 text-emerald-800 group-hover:translate-x-0.5 transition-transform">
        <span>Open Qibla</span>
        <ChevronRight size={14} strokeWidth={2} />
      </span>
    </div>
  );
};
