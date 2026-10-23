export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface PrayerItem {
  id: PrayerName;
  name: string;
  arabicName: string;
  time: Date;
  timeString: string;
  isPassed: boolean;
  isCurrent: boolean;
  isNext: boolean;
  notificationEnabled: boolean;
}

export type CalculationMethodKey = 
  | 'Algeria'
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Dubai'
  | 'Qatar'
  | 'Kuwait'
  | 'MoonsightingCommittee'
  | 'Singapore'
  | 'NorthAmerica'
  | 'Other';

export type MadhabKey = 'shafi' | 'hanafi';

export type SoundOption = 
  | 'full_adhan' 
  | 'adhan_makkah' 
  | 'adhan_algeria' 
  | 'adhan_madinah' 
  | 'takbeer' 
  | 'soft_chime' 
  | 'beep' 
  | 'silent';

export interface AppSettings {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  calculationMethod: CalculationMethodKey;
  madhab: MadhabKey;
  soundOption: SoundOption;
  adhanVolume: number; // 0 to 1
  autoStart: boolean;
  remindMinutesBefore: number; // e.g. 0, 5, 10, 15, or 20 mins before
  iqamahEnabled?: boolean;
  iqamahDurations?: Partial<Record<PrayerName, number>>;
  enabledPrayers: Record<PrayerName, boolean>;
  prayerAdjustments?: Partial<Record<PrayerName, number>>;
  randomDhikrEnabled?: boolean;
  randomDhikrInterval?: number; // 0 for random (20-45m), or 15, 30, 45, 60 mins
  miniWidgetEnabled?: boolean;
  fastingMondayThursdayReminder?: boolean;
  fastingWhiteDaysReminder?: boolean;
  isFastingToday?: boolean;
  theme?: 'light' | 'dark' | 'system';
}

export interface TrayUpdatePayload {
  tooltip: string;
  nextPrayerName: string;
  nextPrayerTime: string;
  remainingText: string;
  isMuted?: boolean;
}

declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      showNotification: (title: string, body: string) => void;
      setStartup: (enable: boolean) => Promise<boolean>;
      getStartup: () => Promise<boolean>;
      updateTray: (data: TrayUpdatePayload) => void;
      toggleWidget: () => void;
      closeWidget: () => void;
      openMain: () => void;
      onQuickTasbih: (callback: () => void) => () => void;
      onToggleMute: (callback: () => void) => () => void;
    };
  }
}
