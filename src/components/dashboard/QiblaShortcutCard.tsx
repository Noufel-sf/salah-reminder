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
      className="pro-card p-4 transition-all cursor-pointer group flex items-center justify-between"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onOpenQiblaTab();
        }
      }}
      aria-label={`Qibla direction is ${qiblaAngle} degrees clockwise from North in ${cityName}. Click to open full compass.`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div 
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
          style={{
            backgroundColor: 'var(--color-primary-highlight)',
            color: 'var(--color-primary)'
          }}
        >
          <Compass size={18} strokeWidth={2.2} />
        </div>
        <div className="truncate">
          <h4 
            className="text-xs font-bold tracking-tight truncate"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Qibla Direction
          </h4>
          <p 
            className="text-[11px] truncate mt-0.5"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {qiblaAngle}° Clockwise from North ({cityName})
          </p>
        </div>
      </div>

      <span 
        className="text-xs font-semibold inline-flex items-center gap-0.5 shrink-0 transition-colors group-hover:underline"
        style={{ color: 'var(--color-primary)' }}
      >
        <span>Open Qibla</span>
        <ChevronRight size={14} strokeWidth={2} />
      </span>
    </div>
  );
};
