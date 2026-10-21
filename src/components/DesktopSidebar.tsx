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
  Moon
} from 'lucide-react';
import { AppSettings } from '../types/prayer';

export type NavTab = 'prayers' | 'qibla' | 'tasbih' | 'duas' | 'calendar' | 'settings';

interface DesktopSidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  settings: AppSettings;
  onOpenSettingsLocation: () => void;
  onToggleMute: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentTab,
  onTabChange,
  settings,
  onOpenSettingsLocation,
  onToggleMute
}) => {
  const isMuted = settings.soundOption === 'silent';

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'prayers', label: 'Prayer Times', icon: <Clock size={18} /> },
    { id: 'qibla', label: 'Qibla Direction', icon: <Compass size={18} /> },
    { id: 'tasbih', label: 'Digital Tasbih', icon: <Sparkles size={18} /> },
    { id: 'duas', label: 'Duas & Hadith', icon: <BookOpen size={18} /> },
    { id: 'calendar', label: 'Islamic Calendar', icon: <Calendar size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> }
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#e4eee6] flex flex-col justify-between select-none h-screen sticky top-0 z-30">
      {/* Top Branding */}
      <div>
        <div className="titlebar-drag px-6 py-5 border-b border-[#edf3ee] flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#164e3c] flex items-center justify-center text-white shadow-md shadow-[#164e3c]/20">
            <Moon size={20} className="fill-white/20 text-[#52b788]" />
          </div>
          <div>
            <h1 className="font-bold text-base text-[#114232] tracking-tight">Noor Desktop</h1>
            <p className="text-[11px] text-[#52b788] font-medium">Closer to Allah Every Day</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#164e3c] text-white shadow-md shadow-[#164e3c]/15'
                    : 'text-[#486356] hover:bg-[#f0f7f2] hover:text-[#114232]'
                }`}
              >
                <span className={isActive ? 'text-[#52b788]' : 'text-[#74897f]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Location Card */}
      <div className="p-4 border-t border-[#edf3ee]">
        <div className="bg-[#f4f8f5] p-3.5 rounded-2xl border border-[#e4eee6]">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={onOpenSettingsLocation}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#114232] hover:text-[#2d6a4f] transition-colors truncate max-w-[140px]"
              title="Change City"
            >
              <MapPin size={13} className="text-[#2d6a4f] shrink-0" />
              <span className="truncate">{settings.city}, {settings.country}</span>
            </button>

            <button
              onClick={onToggleMute}
              className={`p-1.5 rounded-xl border transition-all ${
                isMuted
                  ? 'bg-rose-50 border-rose-200 text-rose-500'
                  : 'bg-white border-[#d8e6dc] text-[#2d6a4f] hover:bg-[#eaf4ee]'
              }`}
              title={isMuted ? 'Unmute Prayer Calls' : 'Mute Prayer Calls'}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#74897f]">
            <span>Method: {settings.calculationMethod}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
