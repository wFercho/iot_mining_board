import { useState, useCallback, useMemo, useEffect } from "react";
import axios from "axios";
import { Mine } from "../interfaces/mines";

const MINES_API_HOST = "localhost:8080";

interface MineQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

interface MinesResponse {
  data: Mine[];
  total: number;
  page: number;
  limit: number;
}

export const useMines = (initialParams: MineQueryParams = {}) => {
  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalMines, setTotalMines] = useState<number>(0);

  const [queryParams, setQueryParams] = useState<MineQueryParams>({
    page: initialParams.page || 1,
    limit: initialParams.limit || 10,
    search: initialParams.search || "",
    status: initialParams.status || "",
  });

  const fetchMines = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<MinesResponse>(
        `${MINES_API_HOST}/mines`,
        {
          params: queryParams,
        }
      );

      // @ts-expect-error Espera que mines esté en data.data, pero está es en el primer data
      setMines(response.data);
      setTotalMines(response.data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching mines");
      setMines([]);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchMines();
  }, [fetchMines]);

  const memoizedMines = useMemo(() => mines, [mines]);

  const updateQueryParams = useCallback(
    (newParams: Partial<MineQueryParams>) => {
      setQueryParams((prev) => ({
        ...prev,
        ...newParams,
      }));
    },
    []
  );

  const resetQuery = useCallback(() => {
    setQueryParams({
      page: 1,
      limit: 10,
      search: "",
      status: "",
    });
  }, []);

  const pageCount = useMemo(
    () => Math.ceil(totalMines / (queryParams.limit || 10)),
    [totalMines, queryParams.limit]
  );

  return {
    mines: memoizedMines,
    loading,
    error,
    totalMines,
    pageCount,
    queryParams,
    updateQueryParams,
    resetQuery,
    refetch: fetchMines,
  };
};
