// Utility for real worship statistics tracking and localStorage persistence

export type DhikrKey = 'tasbih' | 'tahmeed' | 'takbeer' | 'istighfar' | 'tahlil' | 'hawqala';

export interface DhikrMeta {
  key: DhikrKey;
  arabic: string;
  title: string;
  meaning: string;
}

export const DHIKR_ITEMS: DhikrMeta[] = [
  { key: 'tasbih', arabic: 'سُبْحَانَ اللَّهِ', title: 'التسبيح', meaning: 'تنزيه الله عن كل نقص' },
  { key: 'tahmeed', arabic: 'الْحَمْدُ لِلَّهِ', title: 'التحميد', meaning: 'الشكر والثناء على نعم الله' },
  { key: 'takbeer', arabic: 'اللَّهُ أَكْبَرُ', title: 'التكبير', meaning: 'الله أعظم من كل شيء' },
  { key: 'istighfar', arabic: 'أَسْتَغْفِرُ اللَّهَ', title: 'الاستغفار', meaning: 'طلب المغفرة والصفح' },
  { key: 'tahlil', arabic: 'لا إِلَهَ إِلا اللَّهُ', title: 'التهليل', meaning: 'التوحيد وإفراد الله بالعبادة' },
  { key: 'hawqala', arabic: 'لا حَوْلَ وَلا قُوَّةَ إِلاَّ بِاللَّهِ', title: 'الحوقلة', meaning: 'التوكل والاستعانة بالله' }
];

export interface DailyDhikrRecord {
  date: string; // YYYY-MM-DD
  tasbih: number;
  tahmeed: number;
  takbeer: number;
  istighfar: number;
  tahlil: number;
  hawqala: number;
  total: number;
}

export interface DailyPrayerRecord {
  date: string; // YYYY-MM-DD
  prayers: {
    Fajr: boolean;
    Dhuhr: boolean;
    Asr: boolean;
    Maghrib: boolean;
    Isha: boolean;
  };
}

const DHIKR_STORAGE_KEY = 'noor_real_dhikr_data_v1';
const PRAYER_STORAGE_KEY = 'noor_real_prayer_data_v1';

export function getTodayDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ------------------- DHIKR TRACKING ------------------- //

function getDefaultDhikrRecord(dateStr: string): DailyDhikrRecord {
  return {
    date: dateStr,
    tasbih: 0,
    tahmeed: 0,
    takbeer: 0,
    istighfar: 0,
    tahlil: 0,
    hawqala: 0,
    total: 0
  };
}

function getAllDhikrRecords(): Record<string, DailyDhikrRecord> {
  try {
    const raw = localStorage.getItem(DHIKR_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getTodayDhikr(): DailyDhikrRecord {
  const today = getTodayDateString();
  const records = getAllDhikrRecords();
  return records[today] || getDefaultDhikrRecord(today);
}

export function incrementDhikr(key: DhikrKey, amount = 1): DailyDhikrRecord {
  const today = getTodayDateString();
  const records = getAllDhikrRecords();
  const record = records[today] || getDefaultDhikrRecord(today);

  record[key] = (record[key] || 0) + amount;
  record.total = (record.tasbih || 0) +
    (record.tahmeed || 0) +
    (record.takbeer || 0) +
    (record.istighfar || 0) +
    (record.tahlil || 0) +
    (record.hawqala || 0);

  records[today] = record;
  try {
    localStorage.setItem(DHIKR_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save dhikr stats', e);
  }

  // Notify components across app
  window.dispatchEvent(new CustomEvent('worship-stats-updated', { detail: { type: 'dhikr', record } }));
  return record;
}

export function resetTodayDhikr(): DailyDhikrRecord {
  const today = getTodayDateString();
  const records = getAllDhikrRecords();
  const record = getDefaultDhikrRecord(today);
  records[today] = record;
  try {
    localStorage.setItem(DHIKR_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error(e);
  }
  window.dispatchEvent(new CustomEvent('worship-stats-updated', { detail: { type: 'dhikr', record } }));
  return record;
}

export function getAllTimeDhikrTotals(): {
  total: number;
  tasbih: number;
  tahmeed: number;
  takbeer: number;
  istighfar: number;
  tahlil: number;
  hawqala: number;
} {
  const records = getAllDhikrRecords();
  const totals = {
    total: 0,
    tasbih: 0,
    tahmeed: 0,
    takbeer: 0,
    istighfar: 0,
    tahlil: 0,
    hawqala: 0
  };

  Object.values(records).forEach((r) => {
    totals.tasbih += r.tasbih || 0;
    totals.tahmeed += r.tahmeed || 0;
    totals.takbeer += r.takbeer || 0;
    totals.istighfar += r.istighfar || 0;
    totals.tahlil += r.tahlil || 0;
    totals.hawqala += r.hawqala || 0;
    totals.total += r.total || 0;
  });

  return totals;
}

// ------------------- PRAYER TRACKING ------------------- //

function getDefaultPrayerRecord(dateStr: string): DailyPrayerRecord {
  return {
    date: dateStr,
    prayers: {
      Fajr: false,
      Dhuhr: false,
      Asr: false,
      Maghrib: false,
      Isha: false
    }
  };
}

function getAllPrayerRecords(): Record<string, DailyPrayerRecord> {
  try {
    const raw = localStorage.getItem(PRAYER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getTodayPrayers(): DailyPrayerRecord {
  const today = getTodayDateString();
  const records = getAllPrayerRecords();
  return records[today] || getDefaultPrayerRecord(today);
}

export function togglePrayerCompleted(prayerKey: keyof DailyPrayerRecord['prayers']): DailyPrayerRecord {
  const today = getTodayDateString();
  const records = getAllPrayerRecords();
  const record = records[today] || getDefaultPrayerRecord(today);

  record.prayers[prayerKey] = !record.prayers[prayerKey];
  records[today] = record;

  try {
    localStorage.setItem(PRAYER_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save prayer stats', e);
  }

  window.dispatchEvent(new CustomEvent('worship-stats-updated', { detail: { type: 'prayer', record } }));
  return record;
}

export function calculateRealPrayerStreak(): {
  streakDays: number;
  weeklyRate: number;
  completedTodayCount: number;
} {
  const records = getAllPrayerRecords();
  const todayStr = getTodayDateString();
  const todayRecord = records[todayStr] || getDefaultPrayerRecord(todayStr);

  const completedTodayCount = Object.values(todayRecord.prayers).filter(Boolean).length;

  // Calculate consecutive days streak
  let streak = 0;
  const cursor = new Date();

  // If at least one prayer was prayed today, count today in streak, otherwise start checking from yesterday
  if (completedTodayCount > 0) {
    streak++;
  }
  cursor.setDate(cursor.getDate() - 1);

  for (let i = 0; i < 365; i++) {
    const dateStr = getTodayDateString(cursor);
    const rec = records[dateStr];
    if (rec) {
      const dayCompleted = Object.values(rec.prayers).filter(Boolean).length;
      if (dayCompleted >= 3) { // considered committed if prayed majority of prayers
        streak++;
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
    }
    break;
  }

  // Calculate past 7 days completion rate
  let last7Total = 0;
  let last7Completed = 0;
  const rateCursor = new Date();

  for (let i = 0; i < 7; i++) {
    const dateStr = getTodayDateString(rateCursor);
    const rec = records[dateStr];
    if (rec) {
      last7Completed += Object.values(rec.prayers).filter(Boolean).length;
    }
    last7Total += 5;
    rateCursor.setDate(rateCursor.getDate() - 1);
  }

  const weeklyRate = last7Total > 0 ? Math.round((last7Completed / last7Total) * 100) : 0;

  return {
    streakDays: streak,
    weeklyRate,
    completedTodayCount
  };
}
