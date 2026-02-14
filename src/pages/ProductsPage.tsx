import { useEffect, useCallback, useRef, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, type ColDef, type SortChangedEvent, type ICellRendererParams } from 'ag-grid-community';
import { useProductsStore } from '../store/productsStore';
import type { Product } from '../types/product';
import styles from './ProductsPage.module.css';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function ProductsPage() {
  const {
    products,
    total,
    page,
    pageSize,
    search,
    sort,
    isLoading,
    error,
    loadProducts,
    setPage,
    setSearch,
    setSort,
  } = useProductsStore();

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

  const handleSortChanged = useCallback((event: SortChangedEvent) => {
    const colState = event.api.getColumnState();
    const sorted = colState.find((c) => c.sort);
    if (sorted && sorted.sort) {
      setSort({ field: sorted.colId, order: sorted.sort });
    } else {
      setSort(null);
    }
  }, [setSort]);

  const totalPages = Math.ceil(total / pageSize);
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const paginationPages = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  const NameCellRenderer = useCallback((params: ICellRendererParams<Product>) => {
    const data = params.data;
    if (!data) return null;
    return (
      <div className={styles.nameCell}>
        <img className={styles.thumbnail} src={data.thumbnail} alt={data.title || ''} />
        <div className={styles.nameText}>
          <span className={styles.nameTitle} title={data.title}>
            {data.title || <span className={styles.emptyValue}>Без названия</span>}
          </span>
          <span className={styles.nameCategory}>
            {data.category || <span className={styles.emptyValue}>Без категории</span>}
          </span>
        </div>
      </div>
    );
  }, []);

  const RatingCellRenderer = useCallback((params: ICellRendererParams<Product>) => {
    const rating = params.value as number | undefined;
    if (rating == null) return <span className={styles.emptyValue}>Нет оценки</span>;
    const isLow = rating < 3;
    return (
      <span className={isLow ? styles.ratingLow : undefined}>
        {rating.toFixed(1)}/5
      </span>
    );
  }, []);

  const ActionsCellRenderer = useCallback((_params: ICellRendererParams<Product>) => {
    return (
      <div className={styles.actionsCell}>
        <button className={`${styles.actionBtn} ${styles.actionBtnAdd}`} title="Добавить">
          <img src="/icons/plus.svg" alt="+" width={14} height={14} style={{ filter: 'brightness(0) invert(1)' }} />
        </button>
        <button className={`${styles.actionBtn} ${styles.actionBtnMore}`} title="Ещё">
          <img src="/icons/more.svg" alt="..." width={16} height={16} />
        </button>
      </div>
    );
  }, []);

  const columnDefs = useMemo<ColDef<Product>[]>(() => [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      width: 50,
      maxWidth: 50,
      sortable: false,
      resizable: false,
      suppressMovable: true,
    },
    {
      headerName: 'Наименование',
      field: 'title',
      flex: 2,
      minWidth: 250,
      sortable: true,
      sort: sort?.field === 'title' ? sort.order : undefined,
      cellRenderer: NameCellRenderer,
    },
    {
      headerName: 'Вендор',
      field: 'brand',
      flex: 1,
      minWidth: 120,
      sortable: true,
      sort: sort?.field === 'brand' ? sort.order : undefined,
      cellRenderer: (params: ICellRendererParams<Product>) => {
        const val = params.value as string | undefined;
        if (!val) return <span className={styles.emptyValue}>Нет вендора</span>;
        return <span style={{ fontWeight: 600 }}>{val}</span>;
      },
    },
    {
      headerName: 'Артикул',
      field: 'sku',
      flex: 1,
      minWidth: 120,
      sortable: false,
      cellRenderer: (params: ICellRendererParams<Product>) => {
        const val = params.value as string | undefined;
        if (!val) return <span className={styles.emptyValue}>Нет артикула</span>;
        return <span>{val}</span>;
      },
    },
    {
      headerName: 'Оценка',
      field: 'rating',
      flex: 1,
      minWidth: 100,
      sortable: true,
      sort: sort?.field === 'rating' ? sort.order : undefined,
      cellRenderer: RatingCellRenderer,
    },
    {
      headerName: 'Цена, $',
      field: 'price',
      flex: 1,
      minWidth: 120,
      sortable: true,
      sort: sort?.field === 'price' ? sort.order : undefined,
      cellRenderer: (params: ICellRendererParams<Product>) => {
        const val = params.value as number | undefined;
        if (val == null) return <span className={styles.emptyValue}>Нет цены</span>;
        return <span>{val.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}</span>;
      },
    },
    {
      headerName: '',
      field: 'id',
      width: 100,
      maxWidth: 100,
      sortable: false,
      resizable: false,
      cellRenderer: ActionsCellRenderer,
    },
  ], [NameCellRenderer, RatingCellRenderer, ActionsCellRenderer, sort]);

  const defaultColDef = useMemo<ColDef>(() => ({
    suppressMovable: true,
  }), []);

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
            <button className={styles.addBtn}>
              <img src="/icons/plus.svg" alt="" width={14} height={14} style={{ filter: 'brightness(0) invert(1)' }} />
              Добавить
            </button>
          </div>
        </div>

        {isLoading && (
          <div className={styles.progressBar}>
            <div className={styles.progressFill} />
          </div>
        )}

        {error && <div className={styles.errorMsg}>{error}</div>}

        <div className={styles.gridWrapper}>
          <AgGridReact<Product>
            rowData={products}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowHeight={56}
            headerHeight={48}
            domLayout="autoHeight"
            rowSelection="multiple"
            onSortChanged={handleSortChanged}
            suppressPaginationPanel
            suppressCellFocus
          />
        </div>

        {total > 0 && (
          <div className={styles.paginationRow}>
            <span className={styles.paginationInfo}>
              Показано <strong>{from}-{to}</strong> из <strong>{total}</strong>
            </span>
            <div className={styles.paginationButtons}>
              <button
                className={styles.pageBtn}
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                &lt;
              </button>
              {paginationPages.map((p) => (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className={styles.pageBtn}
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
