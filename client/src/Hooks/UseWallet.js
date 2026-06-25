// Hooks/UseWallet.js
import { useEffect, useState } from "react";
import { getWalletBalance } from "../Service/wallet.js";

const useWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const fetchWallet = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const response = await getWalletBalance();
      
      // Handle different response formats
      let walletData = null;
      if (response?.data) {
        // If data is a string (like "6000000.00"), convert to number and store in a standardized format
        if (typeof response.data === 'string' || typeof response.data === 'number') {
          walletData = {
            balance: parseFloat(response.data) || 0,
            // Add other properties if needed
          };
        } else if (typeof response.data === 'object' && response.data !== null) {
          // If data is already an object with balance property
          walletData = {
            balance: parseFloat(response.data.balance) || 0,
            ...response.data
          };
        }
      }
      
      setWallet(walletData);
      return response;
    } catch (err) {
      setIsError(true);
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadWallet = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        setError(null);

        const response = await getWalletBalance();

        if (!isMounted) {
          return;
        }

        // Handle different response formats
        let walletData = null;
        if (response?.data) {
          // If data is a string (like "6000000.00"), convert to number and store in a standardized format
          if (typeof response.data === 'string' || typeof response.data === 'number') {
            walletData = {
              balance: parseFloat(response.data) || 0,
              // Add other properties if needed
            };
          } else if (typeof response.data === 'object' && response.data !== null) {
            // If data is already an object with balance property
            walletData = {
              balance: parseFloat(response.data.balance) || 0,
              ...response.data
            };
          }
        }
        
        if (isMounted) {
          setWallet(walletData);
        }
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setIsError(true);
        setError(err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadWallet();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    wallet,
    balance: wallet?.balance || 0,
    isLoading,
    isError,
    error,
    refetch: fetchWallet,
  };
};

export default useWallet;