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

  const mainNav = [
    { id: 'prayers' as NavTab, label: 'Sholat & Timetable', icon: <Clock size={17} /> },
    { id: 'duas' as NavTab, label: 'Doa & Hadith', icon: <BookOpen size={17} /> },
    { id: 'calendar' as NavTab, label: 'Islamic Calendar', icon: <Calendar size={17} /> },
  ];

  const toolsNav = [
    { id: 'qibla' as NavTab, label: 'Qibla Direction', icon: <Compass size={17} /> },
    { id: 'tasbih' as NavTab, label: 'Digital Tasbih', icon: <Sparkles size={17} /> },
  ];

  const settingsNav = [
    { id: 'settings' as NavTab, label: 'Settings & Method', icon: <Settings size={17} /> }
  ];

  const renderNavGroup = (title: string, items: typeof mainNav) => (
    <div className="mb-5">
      <div className="px-3 mb-2 text-[10px] font-bold tracking-wider uppercase text-[#8fa298]">
        {title}
      </div>
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                isActive
                  ? 'bg-[#e8f5ee] text-[#123d2e] font-bold shadow-xs'
                  : 'text-[#556e62] hover:bg-[#f1f6f2] hover:text-[#123d2e]'
              }`}
            >
              <span className={isActive ? 'text-[#24634c]' : 'text-[#7d9388]'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-[#e5ede7] flex flex-col justify-between select-none h-screen overflow-hidden">
      {/* Top Branding */}
      <div className="p-4 overflow-y-auto">
        <div className="titlebar-drag px-2 py-3 mb-4 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#e8f5ee] flex items-center justify-center text-[#24634c] border border-[#d2ecde]">
            <Moon size={18} className="fill-[#24634c]/20" />
          </div>
          <div className="leading-tight">
            <h1 className="font-extrabold text-sm text-[#123d2e] tracking-tight">Ramadhan Pro</h1>
            <p className="text-[10px] text-[#48a07f] font-semibold">Salah Reminder</p>
          </div>
        </div>

        {/* Navigation Sections */}
        {renderNavGroup('MAIN', mainNav)}
        {renderNavGroup('TOOLS', toolsNav)}
        {renderNavGroup('OTHERS', settingsNav)}
      </div>

      {/* Bottom Profile / Location Card matching reference */}
      <div className="p-3 border-t border-[#edf3ee] bg-[#fafcfa]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#e5ede7]">
          <button
            onClick={onOpenSettingsLocation}
            className="flex items-center gap-2 text-left truncate flex-1 min-w-0"
            title="Click to change location"
          >
            <div className="w-7 h-7 rounded-lg bg-[#e8f5ee] text-[#24634c] flex items-center justify-center shrink-0">
              <MapPin size={13} />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-[#123d2e] truncate">{settings.city}</p>
              <p className="text-[10px] text-[#7d9388] truncate">{settings.country}</p>
            </div>
          </button>

          <button
            onClick={onToggleMute}
            className={`p-1.5 rounded-lg border transition-all shrink-0 ml-1.5 ${
              isMuted
                ? 'bg-rose-50 border-rose-200 text-rose-500'
                : 'bg-[#fafcfa] border-[#dbe6df] text-[#24634c] hover:bg-[#e8f5ee]'
            }`}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </div>
    </aside>
  );
};
