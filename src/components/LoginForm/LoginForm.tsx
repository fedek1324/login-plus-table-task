import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import styles from './LoginForm.module.css';

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
    <div className={styles.card}>
      <form className={styles.cardInner} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.logo}>
          <img src="/icons/logo.svg" alt="Logo" width={35} height={34} />
        </div>

        <div className={styles.textBlock}>
          <h1 className={styles.title}>Добро пожаловать!</h1>
          <p className={styles.subtitle}>Пожалуйста, авторизируйтесь</p>
        </div>

        <div className={styles.formArea}>
          {error && <div className={styles.apiError}>{error}</div>}

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="username">Логин</label>
            <div className={`${styles.inputWrapper} ${errors.username ? styles.hasError : ''}`}>
              <span className={styles.inputIcon}>
                <img src="/icons/user-icon.svg" alt="" width={24} height={24} />
              </span>
              <input
                id="username"
                type="text"
                className={styles.input}
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
                <img src="/icons/cross.svg" alt="" width={14} height={16} />
              </button>
            </div>
            {errors.username && <div className={styles.fieldError}>{errors.username.message}</div>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="password">Пароль</label>
            <div className={`${styles.inputWrapper} ${errors.password ? styles.hasError : ''}`}>
              <span className={styles.inputIcon}>
                <img src="/icons/lock.svg" alt="" width={24} height={24} />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
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
                  width={24}
                  height={24}
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

          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>или</span>
            <span className={styles.dividerLine} />
          </div>
        </div>

        <p className={styles.signupRow}>
          Нет аккаунта?{' '}
          <a href="#" className={styles.signupLink}>Создать</a>
        </p>
      </form>
    </div>
  );
}
