import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });

  const usernameError = touched.username && !username.trim() ? 'Введите логин' : '';
  const passwordError = touched.password && !password.trim() ? 'Введите пароль' : '';

  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handleRememberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRemember(e.target.checked);
  }, []);

  const handleUsernameBlur = useCallback(() => {
    setTouched((t) => ({ ...t, username: true }));
  }, []);

  const handlePasswordBlur = useCallback(() => {
    setTouched((t) => ({ ...t, password: true }));
  }, []);

  const handleClearUsername = useCallback(() => {
    setUsername('');
  }, []);

  const handleTogglePassword = useCallback(() => {
    setShowPassword((v) => !v);
  }, []);

  const handleSubmit = useCallback(async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setTouched({ username: true, password: true });

    if (!username.trim() || !password.trim()) return;

    clearError();
    await login(username.trim(), password, remember);

    if (useAuthStore.getState().token) {
      navigate('/products', { replace: true });
    }
  }, [username, password, remember, clearError, login, navigate]);

  return (
    <div className={styles.wrapper}>
      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <div className={styles.logo}>
          <img src="/icons/logo.svg" alt="Logo" width={36} height={36} />
        </div>

        <h1 className={styles.title}>Добро пожаловать!</h1>
        <p className={styles.subtitle}>Пожалуйста, авторизируйтесь</p>

        {error && <div className={styles.apiError}>{error}</div>}

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="username">Логин</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>
              <img src="/icons/user.svg" alt="" width={16} height={16} />
            </span>
            <input
              id="username"
              type="text"
              className={`${styles.input} ${usernameError ? styles.hasError : ''}`}
              value={username}
              onChange={handleUsernameChange}
              onBlur={handleUsernameBlur}
              placeholder=""
              autoComplete="username"
            />
            {username && (
              <button
                type="button"
                className={styles.inputAction}
                onClick={handleClearUsername}
                tabIndex={-1}
                aria-label="Очистить"
              >
                <img src="/icons/close.svg" alt="" width={16} height={16} />
              </button>
            )}
          </div>
          {usernameError && <div className={styles.fieldError}>{usernameError}</div>}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="password">Пароль</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>
              <img src="/icons/lock.svg" alt="" width={16} height={16} />
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`${styles.input} ${passwordError ? styles.hasError : ''}`}
              value={password}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              placeholder=""
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.inputAction}
              onClick={handleTogglePassword}
              tabIndex={-1}
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            >
              <img
                src={showPassword ? '/icons/eye-off.svg' : '/icons/eye.svg'}
                alt=""
                width={18}
                height={18}
              />
            </button>
          </div>
          {passwordError && <div className={styles.fieldError}>{passwordError}</div>}
        </div>

        <div className={styles.rememberRow}>
          <input
            id="remember"
            type="checkbox"
            className={styles.checkbox}
            checked={remember}
            onChange={handleRememberChange}
          />
          <label className={styles.rememberLabel} htmlFor="remember">Запомнить данные</label>
        </div>

        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? 'Вход...' : 'Войти'}
        </button>

        <p className={styles.divider}>или</p>

        <p className={styles.signupRow}>
          Нет аккаунта?{' '}
          <a href="#" className={styles.signupLink}>Создать</a>
        </p>
      </form>
    </div>
  );
}
