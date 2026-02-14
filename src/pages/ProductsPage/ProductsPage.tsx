import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useProductsStore } from '../../store/productsStore';
import ProductsTable from '../../components/ProductsTable/ProductsTable';
import AddProductModal from '../../components/AddProductModal/AddProductModal';
import styles from './ProductsPage.module.css';

export default function ProductsPage() {
  const { search, loadProducts, setSearch } = useProductsStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearch(value);
    }, 400);
  }, [setSearch]);

  const handleRefresh = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  const handleAddProduct = useCallback(() => {
    setIsAddModalOpen(false);
    toast.success('Товар успешно добавлен');
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Товары</h1>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>
            <img src="/icons/search.svg" alt="" width={18} height={18} />
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Найти"
            defaultValue={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>Все позиции</span>
          <div className={styles.tableActions}>
            <button className={styles.refreshBtn} onClick={handleRefresh} title="Обновить">
              <img src="/icons/refresh.svg" alt="Обновить" width={20} height={20} />
            </button>
            <button className={styles.addBtn} onClick={() => setIsAddModalOpen(true)}>
              <span className={styles.addBtnIcon}>
                <img src="/icons/plus.svg" alt="" width={14} height={14} style={{ filter: 'brightness(0) invert(1)' }} />
              </span>
              Добавить
            </button>
          </div>
        </div>

        <ProductsTable />
      </div>

      {isAddModalOpen && (
        <AddProductModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddProduct}
        />
      )}
    </div>
  );
}
