import { Coordinates, CalculationMethod, CalculationParameters, PrayerTimes, Madhab } from 'adhan';
import { AppSettings, CalculationMethodKey, PrayerItem, PrayerName } from '../types/prayer';

export const DEFAULT_IQAMAH_MINUTES: Record<PrayerName, number> = {
  Fajr: 20,
  Sunrise: 0,
  Dhuhr: 15,
  Asr: 15,
  Maghrib: 10,
  Isha: 15
};

export const DEFAULT_SETTINGS: AppSettings = {
  city: 'قسنطينة',
  country: 'الجزائر',
  latitude: 36.3650,
  longitude: 6.6147,
  calculationMethod: 'Algeria',
  madhab: 'shafi',
  soundOption: 'full_adhan',
  adhanVolume: 0.8,
  autoStart: true,
  remindMinutesBefore: 15, // 15 minutes before prayer adhan
  iqamahEnabled: true,
  iqamahDurations: DEFAULT_IQAMAH_MINUTES,
  enabledPrayers: {
    Fajr: true,
    Sunrise: false,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true
  },
  prayerAdjustments: {
    Fajr: 0,
    Sunrise: 0,
    Dhuhr: 0,
    Asr: 0,
    Maghrib: 0,
    Isha: 0
  },
  randomDhikrEnabled: true,
  randomDhikrInterval: 0,
  fastingMondayThursdayReminder: true,
  fastingWhiteDaysReminder: true,
  isFastingToday: false,
  jumuahKahfReminder: true,
  jumuahIjabahReminder: true,
  jumuahSalawatGoal: 300,
  theme: 'light'
};

export const CALCULATION_METHOD_LABELS_AR: Record<CalculationMethodKey, string> = {
  Algeria: 'وزارة الشؤون الدينية والأوقاف (الجزائر)',
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
    case 'Algeria': {
      // Official Algerian Ministry standard: Fajr 18°, Isha 17°, Maghrib +3min sunset precaution
      const params = new CalculationParameters(null, 18, 17);
      params.methodAdjustments = { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 3, isha: 0 };
      params.adjustments = { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 3, isha: 0 };
      return params;
    }
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

  const rawBase: { id: PrayerName; time: Date }[] = [
    { id: 'Fajr', time: rawTimes.fajr },
    { id: 'Sunrise', time: rawTimes.sunrise },
    { id: 'Dhuhr', time: rawTimes.dhuhr },
    { id: 'Asr', time: rawTimes.asr },
    { id: 'Maghrib', time: rawTimes.maghrib },
    { id: 'Isha', time: rawTimes.isha }
  ];

  const rawList: { id: PrayerName; time: Date }[] = rawBase.map((item) => {
    const adjMinutes = settings.prayerAdjustments?.[item.id] || 0;
    if (adjMinutes !== 0) {
      return { id: item.id, time: new Date(item.time.getTime() + adjMinutes * 60 * 1000) };
    }
    return item;
  });

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

export interface HijriDateParts {
  day: number;
  month: number;
  monthName: string;
  year: number;
  formatted: string;
  arabic: string;
}

export function getHijriDateParts(date: Date = new Date()): HijriDateParts {
  try {
    const formatterEn = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const parts = formatterEn.formatToParts(date);
    const day = parseInt(parts.find((p) => p.type === 'day')?.value || '1', 10);
    const month = parseInt(parts.find((p) => p.type === 'month')?.value || '1', 10);
    const year = parseInt(parts.find((p) => p.type === 'year')?.value || '1446', 10);

    const formatterArabic = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const formatted = formatterArabic.format(date);

    const monthNames = [
      'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة',
      'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
    ];
    const monthName = monthNames[month - 1] || 'شهر هجري';

    return {
      day,
      month,
      monthName,
      year,
      formatted,
      arabic: formatted
    };
  } catch {
    return {
      day: 15,
      month: 8,
      monthName: 'شعبان',
      year: 1446,
      formatted: '١٥ شعبان ١٤٤٦ هـ',
      arabic: '١٥ شعبان ١٤٤٦ هـ'
    };
  }
}

export function getHijriDate(date: Date = new Date()): { formatted: string; arabic: string } {
  const parts = getHijriDateParts(date);
  return {
    formatted: parts.formatted,
    arabic: parts.arabic
  };
}

export interface FastingInfo {
  isFastingDay: boolean;
  type: 'monday' | 'thursday' | 'white_day' | 'ashura' | 'arafah' | 'ramadan' | 'none';
  title: string;
  virtue: string;
  isTomorrowFastingDay: boolean;
  tomorrowType: 'monday' | 'thursday' | 'white_day' | 'none';
  tomorrowTitle: string;
  tomorrowVirtue: string;
  tomorrowDescription: string;
  isTomorrowMondayOrThursday: boolean;
  isTomorrowWhiteDay: boolean;
}

export function getFastingDayInfo(date: Date = new Date()): FastingInfo {
  const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  const hijri = getHijriDateParts(date);

  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDayOfWeek = tomorrow.getDay();
  const tomorrowHijri = getHijriDateParts(tomorrow);

  // Check today
  let isFastingDay = false;
  let type: FastingInfo['type'] = 'none';
  let title = '';
  let virtue = '';

  if (hijri.month === 9) {
    isFastingDay = true;
    type = 'ramadan';
    title = 'صيام شهر رمضان المبارك';
    virtue = 'صيام الفريضة، تغفر فيه الذنوب وتفتح فيه أبواب الجنان وتضاعف الحسنات.';
  } else if (hijri.day === 13 || hijri.day === 14 || hijri.day === 15) {
    isFastingDay = true;
    type = 'white_day';
    title = `صيام الأيام البيض (${hijri.day} ${hijri.monthName})`;
    virtue = '«صِيَامُ ثَلاثَةِ أَيَّامٍ مِنْ كُلِّ شَهْرٍ صِيَامُ الدَّهْرِ كُلِّهِ» (متفق عليه).';
  } else if (dayOfWeek === 1) { // Monday
    isFastingDay = true;
    type = 'monday';
    title = 'صيام يوم الإثنين (سنة نبوية)';
    virtue = '«ذَلِكَ يَوْمٌ وُلِدْتُ فِيهِ، وَيَوْمٌ بُعِثْتُ أَوْ أُنْزِلَ عَلَيَّ فِيهِ» وتُعرض فيه الأعمال على الله.';
  } else if (dayOfWeek === 4) { // Thursday
    isFastingDay = true;
    type = 'thursday';
    title = 'صيام يوم الخميس (سنة نبوية)';
    virtue = '«تُعْرَضُ الأَعْمَالُ يَوْمَ الاِثْنَيْنِ وَالْخَمِيسِ فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ».';
  }

  // Check tomorrow
  let isTomorrowFastingDay = false;
  let tomorrowType: FastingInfo['tomorrowType'] = 'none';
  let tomorrowTitle = '';
  let tomorrowVirtue = '';
  let tomorrowDescription = '';

  const isTomorrowWhiteDay = tomorrowHijri.day === 13 || tomorrowHijri.day === 14 || tomorrowHijri.day === 15;
  const isTomorrowMondayOrThursday = tomorrowDayOfWeek === 1 || tomorrowDayOfWeek === 4;

  if (isTomorrowWhiteDay) {
    isTomorrowFastingDay = true;
    tomorrowType = 'white_day';
    tomorrowTitle = `تذكير بصيام الأيام البيض (${tomorrowHijri.day} ${tomorrowHijri.monthName}) 🌕`;
    tomorrowDescription = `غداً يوافق اليوم ${tomorrowHijri.day} من شهر ${tomorrowHijri.monthName}، وهو من الأيام البيض المستحب صيامها.`;
    tomorrowVirtue = '«صِيَامُ ثَلاثَةِ أَيَّامٍ مِنْ كُلِّ شَهْرٍ صِيَامُ الدَّهْرِ كُلِّهِ» (متفق عليه)';
  } else if (tomorrowDayOfWeek === 1) {
    isTomorrowFastingDay = true;
    tomorrowType = 'monday';
    tomorrowTitle = 'تذكير بصيام يوم الإثنين المبارك 🌙';
    tomorrowDescription = 'غداً يوم الإثنين، ترفع فيه الأعمال إلى الله تعالى. انوِ الصيام ونل الأجر العظيم.';
    tomorrowVirtue = '«تُعْرَضُ الأَعْمَالُ يَوْمَ الاِثْنَيْنِ وَالْخَمِيسِ فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ»';
  } else if (tomorrowDayOfWeek === 4) {
    isTomorrowFastingDay = true;
    tomorrowType = 'thursday';
    tomorrowTitle = 'تذكير بصيام يوم الخميس المبارك 🌙';
    tomorrowDescription = 'غداً يوم الخميس، ترفع فيه الأعمال إلى الله تعالى. انوِ الصيام ونل الأجر العظيم.';
    tomorrowVirtue = '«تُعْرَضُ الأَعْمَالُ يَوْمَ الاِثْنَيْنِ وَالْخَمِيسِ فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ»';
  }

  return {
    isFastingDay,
    type,
    title,
    virtue,
    isTomorrowFastingDay,
    tomorrowType,
    tomorrowTitle,
    tomorrowVirtue,
    tomorrowDescription,
    isTomorrowMondayOrThursday,
    isTomorrowWhiteDay
  };
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
