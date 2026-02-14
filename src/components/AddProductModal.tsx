import { useState, useCallback } from 'react';
import styles from './AddProductModal.module.css';

interface AddProductModalProps {
  onClose: () => void;
  onAdd: () => void;
}

interface FormErrors {
  title?: string;
  price?: string;
  brand?: string;
  sku?: string;
}

export default function AddProductModal({ onClose, onAdd }: AddProductModalProps) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = useCallback((): FormErrors => {
    const errs: FormErrors = {};
    if (!title.trim()) errs.title = 'Введите наименование';
    if (!price.trim()) {
      errs.price = 'Введите цену';
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      errs.price = 'Введите корректную цену';
    }
    if (!brand.trim()) errs.brand = 'Введите вендора';
    if (!sku.trim()) errs.sku = 'Введите артикул';
    return errs;
  }, [title, price, brand, sku]);

  const handleSubmit = useCallback(() => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onAdd();
  }, [validate, onAdd]);

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>Добавить товар</h2>

        <div className={styles.field}>
          <label className={styles.label}>Наименование</label>
          <input
            className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Введите наименование"
          />
          {errors.title && <div className={styles.errorText}>{errors.title}</div>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Цена, $</label>
          <input
            className={`${styles.input} ${errors.price ? styles.inputError : ''}`}
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
          />
          {errors.price && <div className={styles.errorText}>{errors.price}</div>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Вендор</label>
          <input
            className={`${styles.input} ${errors.brand ? styles.inputError : ''}`}
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Введите вендора"
          />
          {errors.brand && <div className={styles.errorText}>{errors.brand}</div>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Артикул</label>
          <input
            className={`${styles.input} ${errors.sku ? styles.inputError : ''}`}
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Введите артикул"
          />
          {errors.sku && <div className={styles.errorText}>{errors.sku}</div>}
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>Отмена</button>
          <button className={styles.submitBtn} onClick={handleSubmit}>Добавить</button>
        </div>
      </div>
    </div>
  );
}
