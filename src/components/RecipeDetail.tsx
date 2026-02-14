import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Recipe {
  id: number;
  category: string;
  tags_ru: string[];
  tags_en: string[];
  tags_tr: string[];
  title_ru: string;
  title_en: string;
  title_tr: string;
  ingredients_ru: string[];
  ingredients_en: string[];
  ingredients_tr: string[];
  instructions: {
    ru: string[];
    en: string[];
    tr: string[];
  };
  cooking_time: number;
  calories: number;
  image_url: string | null;
}

const API_URL = 'https://delila-pupilless-unearthly.ngrok-free.dev';

const RecipeDetail: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(`${API_URL}/recipes/${id}`);
        setRecipe(res.data);
      } catch (error) {
        console.error('Ошибка загрузки рецепта:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const getTitle = () => {
    if (!recipe) return '';
    const lang = i18n.language;
    if (lang.startsWith('ru')) return recipe.title_ru;
    if (lang.startsWith('tr')) return recipe.title_tr;
    return recipe.title_en;
  };

  const getIngredients = (): string[] => {
    if (!recipe) return [];
    const lang = i18n.language;
    if (lang.startsWith('ru')) return recipe.ingredients_ru || [];
    if (lang.startsWith('tr')) return recipe.ingredients_tr || [];
    return recipe.ingredients_en || [];
  };

  const getInstructions = (): string[] => {
    if (!recipe) return [];
    const lang = i18n.language;
    if (lang.startsWith('ru')) return recipe.instructions.ru || [];
    if (lang.startsWith('tr')) return recipe.instructions.tr || [];
    return recipe.instructions.en || [];
  };

  const getTags = (): string[] => {
    if (!recipe) return [];
    const lang = i18n.language;
    if (lang.startsWith('ru')) return recipe.tags_ru || [];
    if (lang.startsWith('tr')) return recipe.tags_tr || [];
    return recipe.tags_en || [];
  };

  if (loading) return <p style={{ textAlign: 'center' }}>⏳ {t('loading')}...</p>;
  if (!recipe) return <p style={{ textAlign: 'center' }}>Рецепт не найден.</p>;

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
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'transparent',
          border: '1px solid #c9a227',
          color: '#c9a227',
          padding: '0.3rem 1rem',
          borderRadius: '30px',
          cursor: 'pointer',
          marginBottom: '1rem',
        }}
      >
        ← {t('back')}
      </button>

      {recipe.image_url && (
        <img src={recipe.image_url} alt={getTitle()} style={{ maxWidth: '100%', borderRadius: '12px', marginBottom: '1.5rem' }} />
      )}

      <h1 style={{ color: '#c9a227', fontSize: '2rem', marginBottom: '0.5rem' }}>{getTitle()}</h1>

      <div style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '1rem' }}>
        ⏱ {recipe.cooking_time} {t('min')} · 🔥 {recipe.calories} {t('kcal')}
      </div>

      {getTags().length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {getTags().map(tag => (
            <span key={tag} style={{
              background: 'rgba(201,162,39,0.2)',
              padding: '0.2rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      <h3 style={{ color: '#c9a227', marginBottom: '0.5rem' }}>{t('ingredients')}:</h3>
      <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
        {getIngredients().map((item, idx) => (
          <li key={idx} style={{ marginBottom: '0.3rem' }}>{item}</li>
        ))}
      </ul>

      <h3 style={{ color: '#c9a227', marginBottom: '0.5rem' }}>{t('instructions')}:</h3>
      <ol style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
        {getInstructions().map((step, idx) => (
          <li key={idx} style={{ marginBottom: '0.8rem', lineHeight: '1.6' }}>{step}</li>
        ))}
      </ol>
    </div>
  );
};

export default RecipeDetail;