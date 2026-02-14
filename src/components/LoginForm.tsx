import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import styles from '../pages/LoginPage.module.css';

interface LoginFormData {
  username: string;
  password: string;
  remember: boolean;
}

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<LoginFormData>({
    mode: 'onBlur',
    defaultValues: { username: '', password: '', remember: false },
  });

  const handleClearUsername = useCallback(() => {
    if (getValues('username')) {
      setValue('username', '', { shouldValidate: true });
    }
  }, [setValue, getValues]);

  const handleTogglePassword = useCallback(() => {
    setShowPassword((v) => !v);
  }, []);

  const onSubmit = useCallback(async (data: LoginFormData) => {
    clearError();
    await login(data.username.trim(), data.password, data.remember);

    if (useAuthStore.getState().token) {
      navigate('/products', { replace: true });
    }
  }, [clearError, login, navigate]);

  return (
    <form className={styles.card} onSubmit={handleSubmit(onSubmit)} noValidate>
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
            className={`${styles.input} ${errors.username ? styles.hasError : ''}`}
            placeholder=""
            autoComplete="username"
            {...register('username', {
              required: 'Введите логин',
              validate: (v) => v.trim().length > 0 || 'Введите логин',
            })}
          />
          <button
            type="button"
            className={styles.inputAction}
            onClick={handleClearUsername}
            tabIndex={-1}
            aria-label="Очистить"
          >
            <img src="/icons/close.svg" alt="" width={16} height={16} />
          </button>
        </div>
        {errors.username && <div className={styles.fieldError}>{errors.username.message}</div>}
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
            className={`${styles.input} ${errors.password ? styles.hasError : ''}`}
            placeholder=""
            autoComplete="current-password"
            {...register('password', { required: 'Введите пароль' })}
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
        {errors.password && <div className={styles.fieldError}>{errors.password.message}</div>}
      </div>

      <div className={styles.rememberRow}>
        <input
          id="remember"
          type="checkbox"
          className={styles.checkbox}
          {...register('remember')}
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
  );
}
