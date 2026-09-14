import { useCallback, useEffect, useState } from "react";
import {
  getCart,
  addProductToCart,
  removeCartItem,
  increaseCartItemQuantity,
  decreaseCartItemQuantity,
} from "../Service/gifting.js";

const useCart = () => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await getCart();
      setCart(res?.data ?? null);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Unable to fetch cart.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    const res = await addProductToCart(productId, quantity);
    setCart(res?.data ?? null);
    return res;
  }, []);

  const removeItem = useCallback(async (productId) => {
    const res = await removeCartItem(productId);
    setCart(res?.data ?? null);
    return res;
  }, []);

  const increaseQuantity = useCallback(async (productId) => {
    const res = await increaseCartItemQuantity(productId);
    setCart(res?.data ?? null);
    return res;
  }, []);

  const decreaseQuantity = useCallback(async (productId) => {
    const res = await decreaseCartItemQuantity(productId);
    setCart(res?.data ?? null);
    return res;
  }, []);

  const items = cart?.items ?? [];
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart,
    items,
    cartCount,
    isLoading,
    error,
    refetch: fetchCart,
    addToCart,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
  };
};

export default useCart;
