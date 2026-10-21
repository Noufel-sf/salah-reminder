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

export type SoundOption = 'full_adhan' | 'takbeer' | 'soft_chime' | 'beep' | 'silent';

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
  remindMinutesBefore: number; // e.g. 0 or 15 mins before
  enabledPrayers: Record<PrayerName, boolean>;
  theme?: 'light' | 'dark' | 'system';
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
    };
  }
}
