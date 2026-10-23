import React from 'react';
import { 
  Clock, 
  Compass, 
  Sparkles, 
  BookOpen, 
  ScrollText,
  Calendar, 
  Settings, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Moon,
  Sun
} from 'lucide-react';
import { AppSettings } from '../types/prayer';

export type NavTab = 'prayers' | 'quran' | 'duas' | 'calendar' | 'qibla' | 'tasbih' | 'settings';

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
      category: 'الرئيسية',
      items: [
        { id: 'prayers', label: 'مواقيت الصلاة', icon: <Clock size={17} strokeWidth={2} /> },
        { id: 'quran', label: 'المصحف والورد', icon: <BookOpen size={17} strokeWidth={2} /> },
        { id: 'duas', label: 'الأذكار والحديث', icon: <ScrollText size={17} strokeWidth={2} /> },
        { id: 'calendar', label: 'التقويم الهجري', icon: <Calendar size={17} strokeWidth={2} /> }
      ]
    },
    {
      category: 'الأدوات',
      items: [
        { id: 'qibla', label: 'اتجاه القبلة', icon: <Compass size={17} strokeWidth={2} /> },
        { id: 'tasbih', label: 'المسبحة الإلكترونية', icon: <Sparkles size={17} strokeWidth={2} /> }
      ]
    },
    {
      category: 'التفضيلات',
      items: [
        { id: 'settings', label: 'الإعدادات', icon: <Settings size={17} strokeWidth={2} /> }
      ]
    }
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-l border-slate-200/90 flex flex-col justify-between select-none h-screen z-20">
      {/* Top Header & Navigation */}
      <div className="flex flex-col flex-1 overflow-y-auto px-4 py-5">
        {/* Brand Header */}
        <div className="titlebar-drag px-2 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-none flex items-center justify-center shrink-0 bg-[#004217] border border-emerald-900/30 overflow-hidden shadow-xs">
            <img src="/logo.png" alt="شعار التطبيق" className="w-full h-full object-cover" />
          </div>
          <div className="leading-tight text-right">
            <h1 className="font-extrabold text-sm tracking-tight text-slate-900">
              رمضان برو
            </h1>
            <p className="text-[11px] font-medium text-slate-500">
              الصلاة والعبادة اليومية
            </p>
          </div>
        </div>

        {/* Grouped Nav Items */}
        <nav className="space-y-5" aria-label="القائمة الرئيسية">
          {navGroups.map((group) => (
            <div key={group.category}>
              <div className="px-2.5 mb-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400 text-right">
                {group.category}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-right transition-all cursor-pointer rounded-none ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-900 font-bold border-r-4 border-emerald-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
        <div className="flex items-center justify-between p-2 rounded-none border border-slate-200/90 bg-white shadow-2xs">
          <button
            onClick={onOpenSettingsLocation}
            className="flex items-center gap-2 text-right truncate flex-1 min-w-0 group cursor-pointer"
            title="انقر لتغيير المدينة"
          >
            <div className="w-7 h-7 rounded-none flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-800 border border-emerald-100">
              <MapPin size={13} strokeWidth={2.2} />
            </div>
            <div className="truncate pl-1">
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
                className="w-7 h-7 rounded-none border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                title={currentTheme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
              >
                {currentTheme === 'dark' ? <Sun size={13} strokeWidth={2} /> : <Moon size={13} strokeWidth={2} />}
              </button>
            )}

            <button
              onClick={onToggleMute}
              className={`w-7 h-7 rounded-none border flex items-center justify-center transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-emerald-800 hover:bg-emerald-50'
              }`}
              title={isMuted ? 'تشغيل صوت الأذان' : 'كتم صوت الأذان'}
            >
              {isMuted ? <VolumeX size={13} strokeWidth={2} /> : <Volume2 size={13} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
