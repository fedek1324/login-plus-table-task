import { useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import styles from './AddProductModal.module.css';

interface AddProductModalProps {
  onClose: () => void;
  onAdd: () => void;
}

interface AddProductForm {
  title: string;
  price: string;
  brand: string;
  sku: string;
}

export default function AddProductModal({ onClose, onAdd }: AddProductModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddProductForm>({ mode: 'onSubmit' });

  const onSubmit = useCallback(() => {
    onAdd();
  }, [onAdd]);

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const modalRoot = document.getElementById('modal-root')!;

  return createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>Добавить товар</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>Наименование</label>
            <input
              className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
              type="text"
              placeholder="Введите наименование"
              {...register('title', { required: 'Введите наименование' })}
            />
            {errors.title && <div className={styles.errorText}>{errors.title.message}</div>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Цена, $</label>
            <input
              className={`${styles.input} ${errors.price ? styles.inputError : ''}`}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              {...register('price', {
                required: 'Введите цену',
                validate: (v) => (Number(v) > 0) || 'Введите корректную цену',
              })}
            />
            {errors.price && <div className={styles.errorText}>{errors.price.message}</div>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Вендор</label>
            <input
              className={`${styles.input} ${errors.brand ? styles.inputError : ''}`}
              type="text"
              placeholder="Введите вендора"
              {...register('brand', { required: 'Введите вендора' })}
            />
            {errors.brand && <div className={styles.errorText}>{errors.brand.message}</div>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Артикул</label>
            <input
              className={`${styles.input} ${errors.sku ? styles.inputError : ''}`}
              type="text"
              placeholder="Введите артикул"
              {...register('sku', { required: 'Введите артикул' })}
            />
            {errors.sku && <div className={styles.errorText}>{errors.sku.message}</div>}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Отмена</button>
            <button type="submit" className={styles.submitBtn}>Добавить</button>
          </div>
        </form>
      </div>
    </div>,
    modalRoot,
  );
}
