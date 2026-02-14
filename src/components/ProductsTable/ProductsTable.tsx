import { useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, type ColDef, type SortChangedEvent, type ICellRendererParams } from 'ag-grid-community';
import { useProductsStore } from '../../store/productsStore';
import type { Product } from '../../types/product';
import styles from './ProductsTable.module.css';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function ProductsTable() {
  const {
    products,
    total,
    page,
    pageSize,
    sort,
    isLoading,
    error,
    setPage,
    setSort,
  } = useProductsStore();

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

  const ActionsCellRenderer = useCallback(() => {
    return (
      <div className={styles.actionsCell}>
        <button className={`${styles.actionBtn} ${styles.actionBtnAdd}`} title="Добавить">
          <img src="/icons/plus.svg" alt="+" width={24} height={24} style={{ filter: 'brightness(0) invert(1)' }} />
        </button>
        <button className={`${styles.actionBtn} ${styles.actionBtnMore}`} title="Ещё">
          <img src="/icons/more.svg" alt="..." width={32} height={32} />
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
      minWidth: 280,
      sortable: true,
      sort: sort?.field === 'title' ? sort.order : undefined,
      cellRenderer: NameCellRenderer,
    },
    {
      headerName: 'Вендор',
      field: 'brand',
      flex: 1,
      minWidth: 125,
      sortable: true,
      sort: sort?.field === 'brand' ? sort.order : undefined,
      cellStyle: { fontFamily: "'Open Sans', sans-serif", fontWeight: 700, fontSize: '16px', textAlign: 'center', justifyContent: 'center', color: '#000000' },
      cellRenderer: (params: ICellRendererParams<Product>) => {
        const val = params.value as string | undefined;
        if (!val) return <span className={styles.emptyValue}>Нет вендора</span>;
        return <span>{val}</span>;
      },
    },
    {
      headerName: 'Артикул',
      field: 'sku',
      flex: 1,
      minWidth: 160,
      sortable: false,
      cellStyle: { fontFamily: "'Open Sans', sans-serif", fontWeight: 400, fontSize: '16px', textAlign: 'center', justifyContent: 'center', color: '#000000' },
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
      minWidth: 125,
      sortable: true,
      sort: sort?.field === 'rating' ? sort.order : undefined,
      cellStyle: { fontFamily: "'Open Sans', sans-serif", fontWeight: 400, fontSize: '16px', textAlign: 'center', justifyContent: 'center', color: '#000000' },
      cellRenderer: RatingCellRenderer,
    },
    {
      headerName: 'Цена, $',
      field: 'price',
      flex: 1,
      minWidth: 160,
      sortable: true,
      sort: sort?.field === 'price' ? sort.order : undefined,
      cellStyle: { fontFamily: "'Roboto Mono', monospace", fontWeight: 400, fontSize: '16px', textAlign: 'center', justifyContent: 'center', color: '#222222' },
      cellRenderer: (params: ICellRendererParams<Product>) => {
        const val = params.value as number | undefined;
        if (val == null) return <span className={styles.emptyValue}>Нет цены</span>;
        return <span>{val.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}</span>;
      },
    },
    {
      headerName: '',
      field: 'id',
      width: 160,
      maxWidth: 160,
      sortable: false,
      resizable: false,
      cellRenderer: ActionsCellRenderer,
    },
  ], [NameCellRenderer, RatingCellRenderer, ActionsCellRenderer, sort]);

  const defaultColDef = useMemo<ColDef>(() => ({
    suppressMovable: true,
  }), []);

  return (
    <>
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
          rowHeight={71}
          headerHeight={73}
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
            Показано {from}-{to} из {total}
          </span>
          <div className={styles.paginationButtons}>
            <button
              className={styles.pageArrow}
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              aria-label="Предыдущая страница"
            >
              &#9666;
            </button>
            <div className={styles.paginationNumbers}>
              {paginationPages.map((p) => (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              className={styles.pageArrow}
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              aria-label="Следующая страница"
            >
              &#9656;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
