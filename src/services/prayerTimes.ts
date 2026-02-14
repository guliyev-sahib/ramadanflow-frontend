export interface PrayerTimesResponse {
  data: {
    timings: {
      Fajr: string;
      Maghrib: string;
    };
    date: {
      readable: string;
      timestamp: string;
    };
    meta: {
      timezone: string;
      method: {
        id: number;
        name: string;
        params?: any;
      };
      latitude?: number;
      longitude?: number;
    };
  };
}

export interface Coordinates {
  lat: number;
  lon: number;
}

const countryMethodMap: Record<string, number> = {
  'TR': 13,  // Турция (Diyanet)
  'RU': 16,  // Россия (ДУМ РФ)
  'SA': 4,   // Саудовская Аравия (Umm Al-Qura)
  'AE': 4,   // ОАЭ (Umm Al-Qura)
  'QA': 4,   // Катар
  'KW': 4,   // Кувейт
  'BH': 4,   // Бахрейн
  'EG': 5,   // Египет (Egyptian General Authority)
  'SY': 7,   // Сирия
  'IQ': 9,   // Ирак
  'MY': 11,  // Малайзия (JAKIM)
  'SG': 11,  // Сингапур (MUIS)
  'ID': 12,  // Индонезия
  'PK': 1,   // Пакистан (University of Islamic Sciences, Karachi)
  'IN': 1,   // Индия
  'BD': 1,   // Бангладеш
  'AF': 1,   // Афганистан
  'IR': 8,   // Иран (Tehran)
  'MA': 14,  // Марокко
  'TN': 14,  // Тунис
  'DZ': 14,  // Алжир
  'FR': 3,   // Франция (MWL)
  'DE': 3,   // Германия
  'GB': 3,   // Великобритания
  'US': 3,   // США
  'CA': 3,   // Канада
  'AU': 3,   // Австралия
};

const DEFAULT_METHOD = 3;

export async function getCountryFromCoords(coords: Coordinates): Promise<string | null> {
  try {
    const response = await fetch('http://ip-api.com/json/?fields=status,countryCode', {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) throw new Error('IP geolocation failed');
    const data = await response.json();
    if (data.status === 'success') {
      return data.countryCode || null;
    }
    return null;
  } catch (error) {
    console.error('Ошибка при определении страны по IP:', error);
    return null;
  }
}

export function getMethodForCountry(countryCode: string | null): number {
  if (countryCode && countryMethodMap[countryCode]) {
    return countryMethodMap[countryCode];
  }
  return DEFAULT_METHOD;
}

export async function fetchPrayerTimes(coords: Coordinates): Promise<PrayerTimesResponse['data']> {
  const { lat, lon } = coords;
  const countryCode = await getCountryFromCoords(coords);
  const method = getMethodForCountry(countryCode);
  const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=${method}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Ошибка загрузки времени намаза');
    const data: PrayerTimesResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('Ошибка при получении времени намаза:', error);
    throw error;
  }
}

export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Геолокация не поддерживается вашим браузером'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}

export function parseTimeToToday(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function getNextEvent(fajrTime: string, maghribTime: string): {
  type: 'suhoor' | 'iftar';
  time: Date;
} {
  const now = new Date();
  const fajr = parseTimeToToday(fajrTime);
  const maghrib = parseTimeToToday(maghribTime);
  if (now < fajr) {
    return { type: 'suhoor', time: fajr };
  } else if (now < maghrib) {
    return { type: 'iftar', time: maghrib };
  } else {
    const tomorrowFajr = new Date(fajr);
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
    return { type: 'suhoor', time: tomorrowFajr };
  }
}

export function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}