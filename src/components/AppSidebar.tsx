import React from 'react';
import { 
  Clock, 
  Compass, 
  Sparkles, 
  BookOpen, 
  Calendar, 
  Settings, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Moon,
  Sun
} from 'lucide-react';
import { AppSettings } from '../types/prayer';

export type NavTab = 'prayers' | 'duas' | 'calendar' | 'qibla' | 'tasbih' | 'settings';

interface AppSidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  settings: AppSettings;
  onOpenSettingsLocation: () => void;
  onToggleMute: () => void;
  onToggleTheme?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentTab,
  onTabChange,
  settings,
  onOpenSettingsLocation,
  onToggleMute,
  onToggleTheme
}) => {
  const isMuted = settings.soundOption === 'silent';
  const currentTheme = settings.theme || 'light';

  const navGroups: {
    category: string;
    items: { id: NavTab; label: string; icon: React.ReactNode }[];
  }[] = [
    {
      category: 'MAIN',
      items: [
        { id: 'prayers', label: 'Prayer Schedule', icon: <Clock size={17} strokeWidth={2} /> },
        { id: 'duas', label: 'Quran & Hadith', icon: <BookOpen size={17} strokeWidth={2} /> },
        { id: 'calendar', label: 'Islamic Calendar', icon: <Calendar size={17} strokeWidth={2} /> }
      ]
    },
    {
      category: 'TOOLS',
      items: [
        { id: 'qibla', label: 'Qibla Direction', icon: <Compass size={17} strokeWidth={2} /> },
        { id: 'tasbih', label: 'Digital Tasbih', icon: <Sparkles size={17} strokeWidth={2} /> }
      ]
    },
    {
      category: 'PREFERENCES',
      items: [
        { id: 'settings', label: 'Settings', icon: <Settings size={17} strokeWidth={2} /> }
      ]
    }
  ];

  return (
    <aside 
      className="w-58 shrink-0 flex flex-col justify-between select-none h-screen border-r transition-colors"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
      aria-label="Application Sidebar"
    >
      {/* Top Header & Navigation */}
      <div className="flex flex-col flex-1 overflow-y-auto px-4 py-5">
        {/* Brand Wordmark matching Senior UI requirements */}
        <div className="titlebar-drag px-2 mb-6 flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
            style={{ 
              backgroundColor: 'var(--color-primary-highlight)',
              color: 'var(--color-primary)'
            }}
          >
            <Moon size={18} strokeWidth={2.2} className="fill-current/20" />
          </div>
          <div className="leading-tight">
            <h1 
              className="font-bold text-sm tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Ramadhan Pro
            </h1>
            <p 
              className="text-[11px] font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Prayer & Daily Worship
            </p>
          </div>
        </div>

        {/* Grouped Nav Items */}
        <nav className="space-y-5" aria-label="Main Navigation">
          {navGroups.map((group) => (
            <div key={group.category}>
              <div 
                className="px-2.5 mb-1.5 text-[10px] font-bold tracking-wider uppercase"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {group.category}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all relative group cursor-pointer"
                      style={{
                        backgroundColor: isActive ? 'var(--color-primary-highlight)' : 'transparent',
                        color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                      }}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <span 
                          className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        />
                      )}
                      <span 
                        className="transition-colors shrink-0"
                        style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Sticky Section: Location & Audio / Theme Anchors */}
      <div 
        className="p-3 border-t transition-colors"
        style={{ 
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface-subtle)'
        }}
      >
        <div 
          className="flex items-center justify-between p-2 rounded-xl border transition-colors shadow-xs"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          {/* Location button */}
          <button
            onClick={onOpenSettingsLocation}
            className="flex items-center gap-2 text-left truncate flex-1 min-w-0 group cursor-pointer"
            title="Click to change city & coordinates"
            aria-label={`Current location: ${settings.city}, ${settings.country}. Click to change.`}
          >
            <div 
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
              style={{ 
                backgroundColor: 'var(--color-primary-highlight)',
                color: 'var(--color-primary)'
              }}
            >
              <MapPin size={13} strokeWidth={2.2} />
            </div>
            <div className="truncate pr-1">
              <p 
                className="text-xs font-bold truncate group-hover:underline"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {settings.city}
              </p>
              <p 
                className="text-[10px] truncate"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {settings.country}
              </p>
            </div>
          </button>

          {/* Quick Actions: Audio Mute & Theme Toggle */}
          <div className="flex items-center gap-1 shrink-0">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)'
                }}
                title={currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle application theme"
              >
                {currentTheme === 'dark' ? <Sun size={13} strokeWidth={2} /> : <Moon size={13} strokeWidth={2} />}
              </button>
            )}

            <button
              onClick={onToggleMute}
              className="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer"
              style={{
                backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.08)' : 'var(--color-surface-subtle)',
                borderColor: isMuted ? 'rgba(239, 68, 68, 0.25)' : 'var(--color-border)',
                color: isMuted ? '#EF4444' : 'var(--color-primary)'
              }}
              title={isMuted ? 'Unmute Audio Alerts' : 'Mute Audio Alerts'}
              aria-label={isMuted ? 'Unmute Audio Alerts' : 'Mute Audio Alerts'}
            >
              {isMuted ? <VolumeX size={13} strokeWidth={2} /> : <Volume2 size={13} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
