export const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;
