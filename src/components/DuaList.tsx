import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

interface Dua {
  id: number;
  category: string;
  arabic_text: string;
  transliteration: string | null;
  translation_ru: string;
  translation_en: string;
  translation_tr: string;
  audio_url: string | null;
}

const API_URL = 'https://delila-pupilless-unearthly.ngrok-free.dev';

const DuaList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [duas, setDuas] = useState<Dua[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'suhoor' | 'iftar' | 'general'>('all');

  useEffect(() => {
    const fetchDuas = async () => {
      try {
        const url = filter === 'all' ? '/duas' : `/duas?category=${filter}`;
        const res = await axios.get(`${API_URL}${url}`);
        setDuas(res.data);
      } catch (error) {
        console.error('Ошибка загрузки дуа:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDuas();
  }, [filter]);

  const getTranslation = (dua: Dua) => {
    if (i18n.language.startsWith('ru')) return dua.translation_ru;
    if (i18n.language.startsWith('tr')) return dua.translation_tr;
    return dua.translation_en;
  };

  if (loading) return <p style={{ textAlign: 'center' }}>⏳ {t('loading')}...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            background: filter === 'all' ? '#c9a227' : 'transparent',
            border: '1px solid #c9a227',
            color: filter === 'all' ? '#0a1929' : '#c9a227',
            padding: '0.3rem 1rem',
            borderRadius: '30px',
            cursor: 'pointer',
          }}
        >
          {t('filter_all')}
        </button>
        <button
          onClick={() => setFilter('suhoor')}
          style={{
            background: filter === 'suhoor' ? '#c9a227' : 'transparent',
            border: '1px solid #c9a227',
            color: filter === 'suhoor' ? '#0a1929' : '#c9a227',
            padding: '0.3rem 1rem',
            borderRadius: '30px',
            cursor: 'pointer',
          }}
        >
          {t('filter_suhoor')}
        </button>
        <button
          onClick={() => setFilter('iftar')}
          style={{
            background: filter === 'iftar' ? '#c9a227' : 'transparent',
            border: '1px solid #c9a227',
            color: filter === 'iftar' ? '#0a1929' : '#c9a227',
            padding: '0.3rem 1rem',
            borderRadius: '30px',
            cursor: 'pointer',
          }}
        >
          {t('filter_iftar')}
        </button>
        <button
          onClick={() => setFilter('general')}
          style={{
            background: filter === 'general' ? '#c9a227' : 'transparent',
            border: '1px solid #c9a227',
            color: filter === 'general' ? '#0a1929' : '#c9a227',
            padding: '0.3rem 1rem',
            borderRadius: '30px',
            cursor: 'pointer',
          }}
        >
          {t('filter_general')}
        </button>
      </div>

      {duas.length === 0 && <p style={{ textAlign: 'center' }}>Дуа пока нет.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {duas.map((dua) => (
          <div
            key={dua.id}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(201,162,39,0.3)',
              borderRadius: '12px',
              padding: '1rem',
            }}
          >
            <p style={{ fontSize: '1.3rem', direction: 'rtl', textAlign: 'right', fontFamily: 'Amiri', marginBottom: '0.5rem' }}>
              {dua.arabic_text}
            </p>
            {dua.transliteration && (
              <p style={{ fontSize: '0.9rem', opacity: 0.8, fontStyle: 'italic', marginBottom: '0.5rem' }}>
                {dua.transliteration}
              </p>
            )}
            <p style={{ fontSize: '1rem' }}>{getTranslation(dua)}</p>
            {dua.audio_url && (
              <audio controls src={dua.audio_url} style={{ width: '100%', marginTop: '0.5rem' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DuaList;