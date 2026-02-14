import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import DayFeed from './DayFeed';
import RecipeDetail from './components/RecipeDetail';
import styles from './styles/App.module.css';

const API_URL = 'http://192.168.235.128:8000'; // замените при необходимости

function App() {
  const { t, i18n } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      if (isLogin) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        const res = await axios.post(`${API_URL}/token`, formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        localStorage.setItem('token', res.data.access_token);
        setToken(res.data.access_token);
        setMessage(String(t('loginSuccess'))); // Приведение к строке
      } else {
        const res = await axios.post(`${API_URL}/register`, {
          username,
          email,
          password
        });
        setMessage(res.data.msg);
        setIsLogin(true);
        setUsername('');
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message;
      if (Array.isArray(errorMsg)) {
        setMessage(String(t('error', { message: errorMsg.map(e => e.msg).join(', ') })));
      } else {
        setMessage(String(t('error', { message: errorMsg })));
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setMessage(String(t('logoutMessage'))); // Приведение к строке
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // Если нет токена – показываем форму входа/регистрации
  if (!token) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>{t('appName')}</h1>

        <div className={styles.langSwitch}>
          <button onClick={() => changeLanguage('ru')}>Русский</button>
          <button onClick={() => changeLanguage('en')}>English</button>
          <button onClick={() => changeLanguage('tr')}>Türkçe</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <h2>{isLogin ? t('login') : t('register')}</h2>

          <input
            type="text"
            placeholder={t('username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={styles.input}
          />

          {!isLogin && (
            <input
              type="email"
              placeholder={t('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          )}

          <input
            type="password"
            placeholder={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />

          <button type="submit" className={styles.primaryButton}>
            {isLogin ? '🔑' : '👤'} {isLogin ? t('login') : t('register')}
          </button>

          <p className={styles.switchText}>
            {isLogin ? t('noAccount') : t('hasAccount')}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className={styles.linkButton}
            >
              {isLogin ? t('register') : t('login')}
            </button>
          </p>
        </form>

        {message && (
          <p
            className={`${styles.message} ${
              message.includes('✅') ? styles.success : message.includes('👋') ? styles.info : styles.error
            }`}
          >
            {message}
          </p>
        )}
      </div>
    );
  }

  // Если токен есть – подключаем роутинг
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DayFeed token={token} onLogout={handleLogout} />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;