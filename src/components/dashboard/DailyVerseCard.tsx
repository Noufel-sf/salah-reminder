import React from 'react';
import { BookOpen } from 'lucide-react';

export const DailyVerseCard: React.FC = () => {
  return (
    <div 
      className="pro-card p-5 transition-colors"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      {/* Header Label */}
      <div 
        className="flex items-center justify-between pb-3 mb-3 border-b"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <span 
          className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          <BookOpen size={12} strokeWidth={2.2} style={{ color: 'var(--color-primary)' }} />
          Verse of the Day
        </span>
        <span 
          className="text-[11px] font-medium px-2 py-0.5 rounded border"
          style={{
            backgroundColor: 'var(--color-primary-highlight)',
            borderColor: 'rgba(21, 92, 69, 0.15)',
            color: 'var(--color-primary)'
          }}
        >
          Al-Inshirah 94:6
        </span>
      </div>

      {/* Content: Arabic + Translation */}
      <div className="py-1">
        <p 
          className="arabic-text text-xl md:text-2xl font-bold leading-loose mb-2.5"
          style={{ color: 'var(--color-text-primary)' }}
        >
          إِنَّ مَعَ الْعُسْرِ يُسْرًا
        </p>

        <p 
          className="text-xs font-semibold italic"
          style={{ color: 'var(--color-primary)' }}
        >
          "Indeed, with hardship comes ease."
        </p>

        <p 
          className="text-[11px] font-normal mt-1 leading-normal"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          A timeless divine promise that every difficulty is followed by relief.
        </p>
      </div>
    </div>
  );
};
