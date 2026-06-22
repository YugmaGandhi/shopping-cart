import { useEffect, useState } from 'react';
import { PackageSearch } from 'lucide-react';
import { useDebounce } from '@/lib/useDebounce';
import { useGetProductsQuery } from './productsApi';
import { ProductsToolbar } from './ProductsToolbar';
import { ProductGrid } from './ProductGrid';
import { Pagination } from '@/components/Pagination';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import type { ProductSort } from './types';

const LIMIT = 12;

function parsePrice(value: string): number | undefined {
  const n = Number(value);
  return value.trim() !== '' && Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<ProductSort>('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);
  const debouncedMin = useDebounce(minPrice);
  const debouncedMax = useDebounce(maxPrice);

  // Any filter change resets to the first page.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort, debouncedMin, debouncedMax]);

  const { data, isLoading, isFetching, isError, refetch } = useGetProductsQuery({
    search: debouncedSearch || undefined,
    sort,
    minPrice: parsePrice(debouncedMin),
    maxPrice: parsePrice(debouncedMax),
    page,
    limit: LIMIT,
  });

  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <p className="text-sm text-muted-foreground">
          Browse the catalog and add items to your cart.
        </p>
      </div>

      <ProductsToolbar
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
      />

      {isError ? (
        <ErrorBanner message="Failed to load products." onRetry={refetch} />
      ) : !isLoading && items.length === 0 ? (
        <EmptyState
          icon={<PackageSearch className="h-8 w-8" />}
          title="No products found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className={isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <ProductGrid products={items} loading={isLoading} limit={LIMIT} />
        </div>
      )}

      {meta && <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />}
    </div>
  );
}
