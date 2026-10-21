import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';
import { AppSettings, CalculationMethodKey, PrayerItem, PrayerName } from '../types/prayer';

export const DEFAULT_SETTINGS: AppSettings = {
  city: 'الجزائر',
  country: 'الجزائر',
  latitude: 36.7538,
  longitude: 3.0588,
  calculationMethod: 'MuslimWorldLeague',
  madhab: 'shafi',
  soundOption: 'takbeer',
  adhanVolume: 0.8,
  autoStart: true,
  remindMinutesBefore: 0,
  enabledPrayers: {
    Fajr: true,
    Sunrise: false,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true
  },
  theme: 'light'
};

export const CALCULATION_METHOD_LABELS_AR: Record<CalculationMethodKey, string> = {
  MuslimWorldLeague: 'رابطة العالم الإسلامي',
  Egyptian: 'الهيئة المصرية العامة للمساحة',
  Karachi: 'جامعة العلوم الإسلامية بكراتشي',
  UmmAlQura: 'جامعة أم القرى - مكة المكرمة',
  Dubai: 'دائرة الشؤون الإسلامية بدبي',
  Qatar: 'وزارة الأوقاف القطرية',
  Kuwait: 'وزارة الأوقاف الكويتية',
  MoonsightingCommittee: 'لجنة رؤية الهلال العالمية',
  Singapore: 'المجلس الإسلامي بسنغافورة',
  NorthAmerica: 'الجمعية الإسلامية لأمريكا الشمالية',
  Other: 'طريقة مخصصة'
};

const PRAYER_METADATA: Record<PrayerName, { name: string; arabicName: string }> = {
  Fajr: { name: 'الفجر', arabicName: 'صلاة الفجر' },
  Sunrise: { name: 'الشروق', arabicName: 'شروق الشمس' },
  Dhuhr: { name: 'الظهر', arabicName: 'صلاة الظهر' },
  Asr: { name: 'العصر', arabicName: 'صلاة العصر' },
  Maghrib: { name: 'المغرب', arabicName: 'صلاة المغرب' },
  Isha: { name: 'العشاء', arabicName: 'صلاة العشاء' }
};

export function getCalculationMethodParams(methodKey: CalculationMethodKey) {
  switch (methodKey) {
    case 'MuslimWorldLeague':
      return CalculationMethod.MuslimWorldLeague();
    case 'Egyptian':
      return CalculationMethod.Egyptian();
    case 'Karachi':
      return CalculationMethod.Karachi();
    case 'UmmAlQura':
      return CalculationMethod.UmmAlQura();
    case 'Dubai':
      return CalculationMethod.Dubai();
    case 'Qatar':
      return CalculationMethod.Qatar();
    case 'Kuwait':
      return CalculationMethod.Kuwait();
    case 'MoonsightingCommittee':
      return CalculationMethod.MoonsightingCommittee();
    case 'Singapore':
      return CalculationMethod.Singapore();
    case 'NorthAmerica':
      return CalculationMethod.NorthAmerica();
    default:
      return CalculationMethod.MuslimWorldLeague();
  }
}

export function calculatePrayerTimes(settings: AppSettings, date: Date = new Date()): {
  prayers: PrayerItem[];
  nextPrayer: PrayerItem | null;
  currentPrayer: PrayerItem | null;
  rawTimes: PrayerTimes;
} {
  const coordinates = new Coordinates(settings.latitude, settings.longitude);
  const params = getCalculationMethodParams(settings.calculationMethod);
  params.madhab = settings.madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;

  const rawTimes = new PrayerTimes(coordinates, date, params);
  const now = new Date();

  // Tomorrow's times for fallback when past Isha
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTimes = new PrayerTimes(coordinates, tomorrow, params);

  const rawList: { id: PrayerName; time: Date }[] = [
    { id: 'Fajr', time: rawTimes.fajr },
    { id: 'Sunrise', time: rawTimes.sunrise },
    { id: 'Dhuhr', time: rawTimes.dhuhr },
    { id: 'Asr', time: rawTimes.asr },
    { id: 'Maghrib', time: rawTimes.maghrib },
    { id: 'Isha', time: rawTimes.isha }
  ];

  // Find next and current prayer
  let nextPrayerId: PrayerName | null = null;
  let currentPrayerId: PrayerName | null = null;

  for (let i = 0; i < rawList.length; i++) {
    if (now < rawList[i].time) {
      nextPrayerId = rawList[i].id;
      currentPrayerId = i > 0 ? rawList[i - 1].id : 'Isha';
      break;
    }
  }

  // If after Isha, next prayer is tomorrow's Fajr
  if (!nextPrayerId) {
    nextPrayerId = 'Fajr';
    currentPrayerId = 'Isha';
  }

  const prayers: PrayerItem[] = rawList.map((item) => {
    const isPassed = now > item.time;
    const isNext = item.id === nextPrayerId;
    const isCurrent = item.id === currentPrayerId;

    return {
      id: item.id,
      name: PRAYER_METADATA[item.id].name,
      arabicName: PRAYER_METADATA[item.id].arabicName,
      time: item.time,
      timeString: formatTime(item.time),
      isPassed,
      isCurrent,
      isNext,
      notificationEnabled: settings.enabledPrayers[item.id] ?? true
    };
  });

  // Determine nextPrayer object (handling after-Isha edge case)
  let nextPrayer = prayers.find((p) => p.id === nextPrayerId) || null;
  if (now > rawTimes.isha && nextPrayerId === 'Fajr') {
    nextPrayer = {
      id: 'Fajr',
      name: PRAYER_METADATA['Fajr'].name,
      arabicName: PRAYER_METADATA['Fajr'].arabicName,
      time: tomorrowTimes.fajr,
      timeString: formatTime(tomorrowTimes.fajr),
      isPassed: false,
      isCurrent: false,
      isNext: true,
      notificationEnabled: settings.enabledPrayers['Fajr'] ?? true
    };
  }

  const currentPrayer = prayers.find((p) => p.id === currentPrayerId) || null;

  return { prayers, nextPrayer, currentPrayer, rawTimes };
}

export function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'م' : 'ص';
  const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
  return `${displayHours}:${minutes} ${period}`;
}

export function getHijriDate(date: Date = new Date()): { formatted: string; arabic: string } {
  try {
    const formatterArabic = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const formatted = formatterArabic.format(date);
    return {
      formatted,
      arabic: formatted
    };
  } catch {
    return { formatted: '١٤٤٦ هـ', arabic: '١٤٤٦ هـ' };
  }
}

export function getGregorianDateArabic(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(date);
  } catch {
    return date.toLocaleDateString('ar-EG');
  }
}

// Calculate Qibla direction (clockwise degrees from North)
export function calculateQibla(latitude: number, longitude: number): number {
  const meccaLat = (21.4225 * Math.PI) / 180;
  const meccaLng = (39.8262 * Math.PI) / 180;
  const userLat = (latitude * Math.PI) / 180;
  const userLng = (longitude * Math.PI) / 180;

  const y = Math.sin(meccaLng - userLng);
  const x =
    Math.cos(userLat) * Math.tan(meccaLat) -
    Math.sin(userLat) * Math.cos(meccaLng - userLng);

  let qibla = (Math.atan2(y, x) * 180) / Math.PI;
  qibla = (qibla + 360) % 360;
  return Math.round(qibla);
}
