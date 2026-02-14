import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import PrayerTimes from './components/PrayerTimes';
import RecipeList from './components/RecipeList';
import DuaList from './components/DuaList';

interface DayData {
  day: number;
  title: string;
  content: string;
  image_url?: string;
}

const API_URL = 'https://delila-pupilless-unearthly.ngrok-free.dev'; // при необходимости замените IP

interface DayFeedProps {
  token: string;
  onLogout: () => void;
}

// Стиль для кнопок переключения языка (аналогично App)
const langBtnStyle = {
  background: 'transparent',
  border: '1px solid #c9a227',
  color: '#f5f0e7',
  padding: '0.4rem 1rem',
  borderRadius: '30px',
  cursor: 'pointer',
  fontFamily: 'Cairo, Amiri, sans-serif',
  fontSize: '0.9rem',
  transition: 'all 0.3s ease'
};

const DayFeed: React.FC<DayFeedProps> = ({ token, onLogout }) => {
  const { t, i18n } = useTranslation();
  const [currentDay, setCurrentDay] = useState(1);
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'day' | 'recipes' | 'duas'>('day');

  useEffect(() => {
    if (activeTab !== 'day') return;
    const fetchDay = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/day/${currentDay}`, {
          params: { lang: i18n.language },
          headers: { Authorization: `Bearer ${token}` }
        });
        setDayData(res.data);
      } catch (error) {
        console.error('Failed to load day content', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDay();
  }, [currentDay, i18n.language, token, activeTab]);

  return (
    <div style={{
      maxWidth: '700px',
      margin: '2rem auto',
      padding: '2rem',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(201, 162, 39, 0.3)',
      borderRadius: '16px',
      color: '#f5f0e7',
      fontFamily: 'Cairo, Amiri, sans-serif'
    }}>
      {/* Шапка с кнопкой выхода */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2 style={{ color: '#c9a227', fontSize: '1.8rem', margin: 0 }}>{t('dailyFeed')}</h2>
        <button
          onClick={onLogout}
          style={{
            background: 'transparent',
            border: '1px solid #c9a227',
            color: '#f5f0e7',
            padding: '0.4rem 1rem',
            borderRadius: '30px',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#c9a227';
            e.currentTarget.style.color = '#0a1929';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#f5f0e7';
          }}
        >
          🚪 {t('logout')}
        </button>
      </div>

      {/* Переключатель языков (теперь виден после входа) */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button onClick={() => i18n.changeLanguage('ru')} style={langBtnStyle}>Русский</button>
        <button onClick={() => i18n.changeLanguage('en')} style={langBtnStyle}>English</button>
        <button onClick={() => i18n.changeLanguage('tr')} style={langBtnStyle}>Türkçe</button>
      </div>

      {/* Вкладки */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(201,162,39,0.3)', paddingBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab('day')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'day' ? '#c9a227' : '#f5f0e7',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '0 0 0.3rem 0',
            borderBottom: activeTab === 'day' ? '2px solid #c9a227' : 'none'
          }}
        >
          📅 {t('dailyFeed')}
        </button>
        <button
          onClick={() => setActiveTab('recipes')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'recipes' ? '#c9a227' : '#f5f0e7',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '0 0 0.3rem 0',
            borderBottom: activeTab === 'recipes' ? '2px solid #c9a227' : 'none'
          }}
        >
          🍳 {t('recipes')}
        </button>
        <button
          onClick={() => setActiveTab('duas')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'duas' ? '#c9a227' : '#f5f0e7',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '0 0 0.3rem 0',
            borderBottom: activeTab === 'duas' ? '2px solid #c9a227' : 'none'
          }}
        >
          🤲 {t('duas')}
        </button>
      </div>

      {/* Контент вкладок */}
      {activeTab === 'day' && (
        <>
          <PrayerTimes />
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setCurrentDay(prev => Math.max(1, prev - 1))}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(201,162,39,0.3)',
                color: '#c9a227',
                padding: '0.5rem 1.2rem',
                borderRadius: '30px',
                cursor: 'pointer',
                fontSize: '1rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#c9a227';
                e.currentTarget.style.color = '#0a1929';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = '#c9a227';
              }}
            >
              ← {t('previous')}
            </button>
            <span style={{ fontSize: '1.4rem', fontWeight: 600, color: '#f5f0e7', whiteSpace: 'nowrap' }}>
              {t('day')} {currentDay}
            </span>
            <button
              onClick={() => setCurrentDay(prev => prev + 1)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(201,162,39,0.3)',
                color: '#c9a227',
                padding: '0.5rem 1.2rem',
                borderRadius: '30px',
                cursor: 'pointer',
                fontSize: '1rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#c9a227';
                e.currentTarget.style.color = '#0a1929';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = '#c9a227';
              }}
            >
              {t('next')} →
            </button>
          </div>
          {loading && <p>{t('loading')}...</p>}
          {dayData && (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid #c9a227',
              borderRadius: '16px',
              padding: '2rem',
              animation: 'fadeSlideUp 0.5s ease-out'
            }}>
              {dayData.image_url && <img src={dayData.image_url} alt={dayData.title} style={{ maxWidth: '100%', borderRadius: '12px', marginBottom: '1rem' }} />}
              <h3 style={{ color: '#c9a227', fontSize: '1.6rem', marginBottom: '1rem' }}>{dayData.title}</h3>
              <p style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>{dayData.content}</p>
            </div>
          )}
          <style>{`
            @keyframes fadeSlideUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </>
      )}

      {activeTab === 'recipes' && <RecipeList />}
      {activeTab === 'duas' && <DuaList />}
    </div>
  );
};

export default DayFeed;