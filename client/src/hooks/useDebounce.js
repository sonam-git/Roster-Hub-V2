// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useStableData(data, delay = 100) {
  const [stableData, setStableData] = useState(data);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (JSON.stringify(data) !== JSON.stringify(stableData)) {
      setIsUpdating(true);
      const timer = setTimeout(() => {
        setStableData(data);
        setIsUpdating(false);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [data, stableData, delay]);

  return { data: stableData, isUpdating };
}
