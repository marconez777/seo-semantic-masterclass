import { useState, useEffect, useCallback } from 'react';

export interface BacklinkFilters {
  daRange: string;
  setDaRange: (v: string) => void;
  trafficRange: string;
  setTrafficRange: (v: string) => void;
  maxPrice: number | "";
  setMaxPrice: (v: number | "") => void;
  parseRange: (value: string) => [number, number] | null;
  resetFilters: () => void;
}

export function useBacklinkFilters(): BacklinkFilters {
  const [daRange, setDaRange] = useState<string>('todos');
  const [trafficRange, setTrafficRange] = useState<string>('todos');
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  // Parse range helper
  const parseRange = useCallback((value: string): [number, number] | null => {
    if (!value || value === 'todos') return null;
    if (value === 'gt-100000') return [100001, Number.POSITIVE_INFINITY];
    const [minStr, maxStr] = value.split('-');
    const min = Number(minStr.replace(/\./g, ''));
    const max = Number(maxStr.replace(/\./g, ''));
    if (Number.isNaN(min) || Number.isNaN(max)) return null;
    return [min, max];
  }, []);

  // Read from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const da = params.get('da');
    const traffic = params.get('traffic');
    const price = params.get('price');
    if (da) setDaRange(da);
    if (traffic) setTrafficRange(traffic);
    if (price) {
      const priceNum = Number(price);
      if (!Number.isNaN(priceNum)) setMaxPrice(priceNum);
    }
  }, []);

  // Sync to URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (daRange && daRange !== 'todos') params.set('da', daRange); else params.delete('da');
    if (trafficRange && trafficRange !== 'todos') params.set('traffic', trafficRange); else params.delete('traffic');
    if (maxPrice !== "") params.set('price', String(maxPrice)); else params.delete('price');
    const query = params.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
    window.history.replaceState({}, '', url);
  }, [daRange, trafficRange, maxPrice]);

  const resetFilters = useCallback(() => {
    setDaRange('todos');
    setTrafficRange('todos');
    setMaxPrice("");
  }, []);

  return {
    daRange,
    setDaRange,
    trafficRange,
    setTrafficRange,
    maxPrice,
    setMaxPrice,
    parseRange,
    resetFilters,
  };
}
