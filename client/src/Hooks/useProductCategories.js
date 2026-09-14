import { useCallback, useEffect, useState } from "react";
import { getProductCategories } from "../Service/admin.js";

const useProductCategories = ({
  page = 1,
  limit = 50,
  search = "",
  fetcher = getProductCategories,
} = {}) => {
  const [state, setState] = useState({
    categories: [],
    pagination: { page, limit, total: 0, totalPages: 0 },
    isLoading: false,
    error: "",
  });

  const fetchCategories = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: "" }));
    try {
      const res = await fetcher({ page, limit, search });
      setState((prev) => ({
        ...prev,
        categories: res?.data ?? [],
        pagination: res?.pagination ?? prev.pagination,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error:
          err?.response?.data?.message ||
          err.message ||
          "Unable to fetch categories.",
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [page, limit, search, fetcher]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories: state.categories,
    pagination: state.pagination,
    isLoading: state.isLoading,
    error: state.error,
    refetch: fetchCategories,
  };
};

export default useProductCategories;
