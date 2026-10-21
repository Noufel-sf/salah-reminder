import React from 'react';
import { Sparkles } from 'lucide-react';

export const DailyEncouragement: React.FC = () => {
  return (
    <div 
      className="p-4 rounded-xl border flex items-center gap-3 transition-colors"
      style={{
        backgroundColor: 'var(--color-primary-highlight)',
        borderColor: 'rgba(21, 92, 69, 0.18)'
      }}
    >
      <div 
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF'
        }}
      >
        <Sparkles size={15} strokeWidth={2} />
      </div>

      <div className="min-w-0">
        <h4 
          className="text-xs font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Daily Reminder
        </h4>
        <p 
          className="text-xs mt-0.5 leading-normal"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          "Keep your connection with Allah strong. Prayer is the comfort of the believer and light for the soul."
        </p>
      </div>
    </div>
  );
};
