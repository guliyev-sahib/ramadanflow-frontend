import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  fetchPrayerTimes, 
  getCurrentLocation, 
  getNextEvent, 
  formatTimeRemaining,
  PrayerTimesResponse
} from '../services/prayerTimes';

interface PrayerTimesProps {
  onLocationError?: (error: string) => void;
}

const PrayerTimes: React.FC<PrayerTimesProps> = ({ onLocationError }) => {
  // @ts-ignore – временно игнорируем ошибку TS2589
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesResponse['data'] | null>(null);
  const [nextEvent, setNextEvent] = useState<{ type: 'suhoor' | 'iftar'; time: Date } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [methodName, setMethodName] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(perm => setPermission(perm));
      }
    }
  }, []);

  useEffect(() => {
    const loadPrayerTimes = async () => {
      try {
        setLoading(true);
        const coords = await getCurrentLocation();
        const times = await fetchPrayerTimes(coords);
        setPrayerTimes(times);
        
        setCurrentDate(times.date.readable);
        if (times.meta?.method) {
          setMethodName(times.meta.method.name);
        } else {
          setMethodName('');
        }
        
        const next = getNextEvent(times.timings.Fajr, times.timings.Maghrib);
        setNextEvent(next);
        setError(null);
      } catch (err: any) {
        const errorMsg = err.message || 'Не удалось получить время намаза';
        setError(errorMsg);
        if (onLocationError) onLocationError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    loadPrayerTimes();
  }, []);

  useEffect(() => {
    if (!nextEvent) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const diff = nextEvent.time.getTime() - now.getTime();
      setTimeRemaining(Math.max(0, diff));
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [nextEvent]);

  useEffect(() => {
    if (timeRemaining === 0 && nextEvent && permission === 'granted' && typeof window !== 'undefined') {
      const title = nextEvent.type === 'suhoor' 
        ? '🕌 Время сухура закончилось' 
        : '🌙 Время ифтара наступило';
      const body = nextEvent.type === 'suhoor'
        ? 'Прекратите приём пищи. Пора на Фаджр.'
        : 'Можно разговляться. Пора на Магриб.';
      
      new Notification(title, { body });
    }
  }, [timeRemaining, nextEvent, permission]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <p>⏳ {t('loading')}...</p>
      </div>
    );
  }

  if (error || !prayerTimes || !nextEvent) {
    return (
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <p style={{ color: '#e74c3c' }}>❌ {error || 'Не удалось загрузить время намаза'}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            background: 'transparent',
            border: '1px solid #c9a227',
            color: '#c9a227',
            padding: '0.3rem 1rem',
            borderRadius: '30px',
            cursor: 'pointer',
            marginTop: '0.5rem'
          }}
        >
          🔄 {t('reload')}
        </button>
      </div>
    );
  }

  const eventTypeText = nextEvent.type === 'suhoor' ? '🕒 Сухур (до)' : '🍽️ Ифтар (до)';
  const eventName = nextEvent.type === 'suhoor' ? t('suhoor') : t('iftar');
  const eventTime = nextEvent.time.toLocaleTimeString(i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(201, 162, 39, 0.3)',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '2rem',
      textAlign: 'center'
    }}>
      <h3 style={{ color: '#c9a227', marginBottom: '0.5rem', fontSize: '1.3rem' }}>
        ⏰ {t('prayerTimes')}
      </h3>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.9rem', color: '#f5f0e7', marginBottom: '1rem', opacity: 0.8 }}>
        <span>🗓 {currentDate}</span>
        {methodName && <span>⚙️ {methodName}</span>}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{t('fajr')} ({t('suhoor')})</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#c9a227' }}>
            {prayerTimes.timings.Fajr}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{t('maghrib')} ({t('iftar')})</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#c9a227' }}>
            {prayerTimes.timings.Maghrib}
          </div>
        </div>
      </div>

      <div style={{
        background: 'rgba(201, 162, 39, 0.1)',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
          {nextEvent.type === 'suhoor' ? '🕒 Сухур (до)' : '🍽️ Ифтар (до)'} {eventName}
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          {eventTime}
        </div>
        <div style={{
          fontSize: '2.2rem',
          fontWeight: 'bold',
          color: '#c9a227',
          marginTop: '0.5rem',
          fontFamily: 'monospace'
        }}>
          {formatTimeRemaining(timeRemaining)}
        </div>
      </div>

      {permission !== 'granted' && typeof window !== 'undefined' && 'Notification' in window && (
        <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.5rem' }}>
          🔔 {t('notificationPermissionRequest')}
          <button 
            onClick={() => Notification.requestPermission().then(setPermission)}
            style={{
              background: 'transparent',
              border: '1px solid #c9a227',
              color: '#c9a227',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              marginLeft: '0.5rem',
              cursor: 'pointer'
            }}
          >
            {t('allow')}
          </button>
        </div>
      )}
    </div>
  );
};

export default PrayerTimes;