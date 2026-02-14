import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
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

const RecipeList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'suhoor' | 'iftar'>('all');

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const url = filter === 'all' ? '/recipes' : `/recipes?category=${filter}`;
        const res = await axios.get(`${API_URL}${url}`);
        setRecipes(res.data);
      } catch (error) {
        console.error('Ошибка загрузки рецептов:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [filter]);

  const getTitle = (recipe: Recipe) => {
    const lang = i18n.language;
    if (lang.startsWith('ru')) return recipe.title_ru;
    if (lang.startsWith('tr')) return recipe.title_tr;
    return recipe.title_en;
  };

  const getTags = (recipe: Recipe): string[] => {
    const lang = i18n.language;
    if (lang.startsWith('ru')) return recipe.tags_ru || [];
    if (lang.startsWith('tr')) return recipe.tags_tr || [];
    return recipe.tags_en || [];
  };

  if (loading) return <p style={{ textAlign: 'center' }}>⏳ {t('loading')}...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
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
      </div>

      {recipes.length === 0 && <p style={{ textAlign: 'center' }}>Рецептов пока нет.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {recipes.map((recipe) => {
          const tags = getTags(recipe);
          return (
            <div
              key={recipe.id}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(201,162,39,0.3)',
                borderRadius: '12px',
                padding: '1rem',
              }}
            >
              <h3 style={{ color: '#c9a227', marginBottom: '0.5rem' }}>{getTitle(recipe)}</h3>
              <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                ⏱ {recipe.cooking_time} {t('min')} · 🔥 {recipe.calories} {t('kcal')}
              </div>
              {tags && tags.length > 0 ? (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        background: 'rgba(201,162,39,0.2)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>{t('no_tags')}</p>
              )}
              <Link
                to={`/recipe/${recipe.id}`}
                style={{
                  display: 'inline-block',
                  background: 'transparent',
                  border: '1px solid #c9a227',
                  color: '#c9a227',
                  padding: '0.3rem 1rem',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  textDecoration: 'none',
                }}
              >
                {t('details')}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecipeList;