import { useState, useEffect } from 'react';
import type { ConformanceMatrix } from '@/types/report';
import { getLatestConformanceData } from '@/lib/github';

interface UseConformanceDataResult {
  data: ConformanceMatrix | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useConformanceData(): UseConformanceDataResult {
  const [data, setData] = useState<ConformanceMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const matrix = await getLatestConformanceData();
      setData(matrix);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
