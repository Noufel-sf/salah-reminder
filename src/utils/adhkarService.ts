import fallbackData from '../data/adhkarFallback.json';

export interface AdhkarItem {
  id: number;
  text: string;
  count: number;
  audio?: string;
  filename?: string;
}

export interface AdhkarCategory {
  id?: number;
  category: string;
  audio?: string;
  filename?: string;
  array: AdhkarItem[];
}

const API_URL = 'https://raw.githubusercontent.com/rn0x/Adhkar-json/main/adhkar.json';
const CACHE_KEY = 'noor_adhkar_api_cache_v1';
const FAVORITES_KEY = 'noor_favorite_adhkar_ids';

export async function fetchAllAdhkar(): Promise<AdhkarCategory[]> {
  // 1. Try local cache first
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Fetch in background to keep updated
        fetchAndCacheBackground();
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  // 2. Try online API
  try {
    const response = await fetch(API_URL);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch {
          // ignore storage limit
        }
        return data;
      }
    }
  } catch {
    // fallback
  }

  // 3. Fallback to bundled data
  return (fallbackData as unknown) as AdhkarCategory[];
}

async function fetchAndCacheBackground() {
  try {
    const response = await fetch(API_URL);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
    }
  } catch {
    // ignore
  }
}

// ----------------- FAVORITES ----------------- //

export function getFavoriteAdhkarIds(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteAdhkar(uid: string): boolean {
  try {
    const current = getFavoriteAdhkarIds();
    const isFav = current.includes(uid);
    const updated = isFav ? current.filter((id) => id !== uid) : [...current, uid];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return !isFav;
  } catch {
    return false;
  }
}
