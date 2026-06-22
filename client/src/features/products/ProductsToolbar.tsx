import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ProductSort } from './types';

interface ToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  sort: ProductSort;
  onSortChange: (v: ProductSort) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
}

export function ProductsToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}: ToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 sm:min-w-[240px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products…"
          className="pl-9"
          aria-label="Search products"
        />
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          inputMode="numeric"
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
          placeholder="Min ₹"
          aria-label="Minimum price"
          className="w-24"
        />
        <span className="text-muted-foreground">–</span>
        <Input
          type="number"
          min={0}
          inputMode="numeric"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
          placeholder="Max ₹"
          aria-label="Maximum price"
          className="w-24"
        />
      </div>

      <Select value={sort} onValueChange={(v) => onSortChange(v as ProductSort)}>
        <SelectTrigger className="w-[180px]" aria-label="Sort products">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="price_asc">Price: low to high</SelectItem>
          <SelectItem value="price_desc">Price: high to low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
