'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// ─── Constants ─────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A-Z' },
  { value: 'name-desc', label: 'Name: Z-A' },
] as const;

const LANGUAGE_OPTIONS = [
  { value: 'URDU', label: 'Urdu' },
  { value: 'ENGLISH', label: 'English' },
  { value: 'ARABIC', label: 'Arabic' },
  { value: 'PUNJABI', label: 'Punjabi' },
  { value: 'SPANISH', label: 'Spanish' },
] as const;

// ─── ShopToolbar Component ─────────────────────────────────────────────────────

interface ShopToolbarProps {
  currentSort: string;
  currentMinPrice: number | null;
  currentMaxPrice: number | null;
  currentLanguages: string[];
  totalCount: number;
}

export function ShopToolbar({
  currentSort,
  currentMinPrice,
  currentMaxPrice,
  currentLanguages,
  totalCount,
}: ShopToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const buildUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      // Reset page when filters change
      params.delete('page');

      const qs = params.toString();
      return `/shop${qs ? `?${qs}` : ''}`;
    },
    [searchParams]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      router.push(buildUrl({ sort: value }));
    },
    [buildUrl, router]
  );

  const handlePriceApply = useCallback(
    (min: string, max: string) => {
      const updates: Record<string, string | null> = {};
      updates.minPrice = min || null;
      updates.maxPrice = max || null;
      router.push(buildUrl(updates));
    },
    [buildUrl, router]
  );

  const handleLanguageToggle = useCallback(
    (lang: string) => {
      const current = new Set(currentLanguages);
      if (current.has(lang)) {
        current.delete(lang);
      } else {
        current.add(lang);
      }

      const langParam = current.size > 0 ? Array.from(current).join(',') : null;
      router.push(buildUrl({ lang: langParam }));
    },
    [currentLanguages, buildUrl, router]
  );

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('sort');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('lang');
    params.delete('page');
    const qs = params.toString();
    router.push(`/shop${qs ? `?${qs}` : ''}`);
  }, [searchParams, router]);

  const hasActiveFilters =
    currentSort !== 'newest' ||
    currentMinPrice !== null ||
    currentMaxPrice !== null ||
    currentLanguages.length > 0;

  return (
    <div className="flex items-center justify-between gap-4 py-3 mb-4 border-b border-border/50">
      {/* Left: result count + active filter badges */}
      <div className="flex items-center gap-2 flex-wrap min-w-0">
        <span className="text-sm text-muted-foreground shrink-0">
          {totalCount} {totalCount === 1 ? 'result' : 'results'}
        </span>

        {currentSort !== 'newest' && (
          <Badge
            variant="secondary"
            className="gap-1 text-xs rounded-full bg-golden/10 text-golden-dark border-golden/20"
          >
            {SORT_OPTIONS.find((o) => o.value === currentSort)?.label}
          </Badge>
        )}
        {currentMinPrice !== null && (
          <Badge variant="secondary" className="gap-1 text-xs rounded-full">
            Min: Rs. {currentMinPrice.toLocaleString('en-PK')}
          </Badge>
        )}
        {currentMaxPrice !== null && (
          <Badge variant="secondary" className="gap-1 text-xs rounded-full">
            Max: Rs. {currentMaxPrice.toLocaleString('en-PK')}
          </Badge>
        )}
        {currentLanguages.map((lang) => (
          <Badge
            key={lang}
            variant="secondary"
            className="gap-1 text-xs rounded-full cursor-pointer hover:bg-destructive/10"
            onClick={() => handleLanguageToggle(lang)}
          >
            {lang.charAt(0) + lang.slice(1).toLowerCase()}
            <X className="h-3 w-3" />
          </Badge>
        ))}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground shrink-0"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Right: sort + filter controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Sort dropdown */}
        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger
            className={`w-[170px] h-9 text-sm rounded-lg border-border/60 ${
              currentSort !== 'newest'
                ? 'border-golden/40 text-golden-dark'
                : ''
            }`}
          >
            <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="rounded-md text-sm">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filters popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-9 gap-1.5 text-sm rounded-lg ${
                hasActiveFilters
                  ? 'border-golden/50 text-golden-dark bg-golden/5'
                  : 'border-border/60'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4 rounded-xl" align="end">
            <div className="space-y-5">
              {/* Price Range */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2.5">
                  Price Range
                </h4>
                <PriceRangeInputs
                  currentMin={currentMinPrice}
                  currentMax={currentMaxPrice}
                  onApply={handlePriceApply}
                />
              </div>

              {/* Language Filter */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2.5">
                  Language
                </h4>
                <div className="flex flex-col gap-2.5">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <label
                      key={lang.value}
                      className="flex items-center gap-2.5 cursor-pointer"
                    >
                      <Checkbox
                        checked={currentLanguages.includes(lang.value)}
                        onCheckedChange={() => handleLanguageToggle(lang.value)}
                        className="data-[state=checked]:bg-golden data-[state=checked]:border-golden data-[state=checked]:text-golden-foreground"
                      />
                      <span className="text-sm text-muted-foreground">
                        {lang.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

// ─── Price Range Sub-component ─────────────────────────────────────────────────

function PriceRangeInputs({
  currentMin,
  currentMax,
  onApply,
}: {
  currentMin: number | null;
  currentMax: number | null;
  onApply: (min: string, max: string) => void;
}) {
  const [min, setMin] = useState(currentMin !== null ? String(currentMin) : '');
  const [max, setMax] = useState(currentMax !== null ? String(currentMax) : '');

  const handleApply = () => {
    const minNum = min ? parseFloat(min) : NaN;
    const maxNum = max ? parseFloat(max) : NaN;

    if (!isNaN(minNum) && !isNaN(maxNum) && minNum > maxNum) {
      onApply(max, min);
    } else {
      onApply(min, max);
    }
  };

  const handleClear = () => {
    setMin('');
    setMax('');
    onApply('', '');
  };

  const hasValues = min || max;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label htmlFor="min-price" className="text-xs text-muted-foreground mb-1">
            Min (Rs.)
          </Label>
          <Input
            id="min-price"
            type="number"
            placeholder="0"
            min={0}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="h-8 text-sm rounded-lg"
          />
        </div>
        <span className="text-muted-foreground mt-5">&mdash;</span>
        <div className="flex-1">
          <Label htmlFor="max-price" className="text-xs text-muted-foreground mb-1">
            Max (Rs.)
          </Label>
          <Input
            id="max-price"
            type="number"
            placeholder="∞"
            min={0}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="h-8 text-sm rounded-lg"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 h-8 text-xs rounded-lg bg-golden hover:bg-golden-hover text-golden-foreground"
          onClick={handleApply}
        >
          Apply
        </Button>
        {hasValues && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-muted-foreground rounded-lg"
            onClick={handleClear}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
