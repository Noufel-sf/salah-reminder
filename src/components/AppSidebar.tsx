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
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200/90 flex flex-col justify-between select-none h-screen z-20">
      {/* Top Header & Navigation */}
      <div className="flex flex-col flex-1 overflow-y-auto px-4 py-5">
        {/* Brand Header */}
        <div className="titlebar-drag px-2 mb-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
            <Moon size={18} strokeWidth={2.2} className="fill-emerald-800/20" />
          </div>
          <div className="leading-tight">
            <h1 className="font-extrabold text-sm tracking-tight text-slate-900">
              Ramadhan Pro
            </h1>
            <p className="text-[11px] font-medium text-slate-500">
              Prayer & Daily Worship
            </p>
          </div>
        </div>

        {/* Grouped Nav Items */}
        <nav className="space-y-5" aria-label="Main Navigation">
          {navGroups.map((group) => (
            <div key={group.category}>
              <div className="px-2.5 mb-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                {group.category}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-900 font-bold border-l-4 border-emerald-700 rounded-r-xl rounded-l-none'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className={isActive ? 'text-emerald-700' : 'text-slate-400'}>
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

      {/* Bottom Sticky Section */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/50">
        <div className="flex items-center justify-between p-2 rounded-xl border border-slate-200/90 bg-white shadow-2xs">
          <button
            onClick={onOpenSettingsLocation}
            className="flex items-center gap-2 text-left truncate flex-1 min-w-0 group cursor-pointer"
            title="Click to change city"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-800 border border-emerald-100">
              <MapPin size={13} strokeWidth={2.2} />
            </div>
            <div className="truncate pr-1">
              <p className="text-xs font-bold truncate text-slate-900 group-hover:underline">
                {settings.city}
              </p>
              <p className="text-[10px] truncate text-slate-400">
                {settings.country}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1 shrink-0">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Toggle Theme"
              >
                {currentTheme === 'dark' ? <Sun size={13} strokeWidth={2} /> : <Moon size={13} strokeWidth={2} />}
              </button>
            )}

            <button
              onClick={onToggleMute}
              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-emerald-800 hover:bg-emerald-50'
              }`}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX size={13} strokeWidth={2} /> : <Volume2 size={13} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
