import { useState, useCallback, useEffect } from 'react';
import { connect, getLocalStorage } from '@stacks/connect';
import { WALLETCONNECT_PROJECT_ID } from '@/lib/stacks';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
}

export function useStacksWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    isConnecting: false,
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const storage = getLocalStorage();
        if (storage && storage.addresses?.stx && storage.addresses.stx.length > 0) {
          // Find testnet address (starts with ST) or use first available
          const stxAddresses = storage.addresses.stx;
          const testnetAddr = stxAddresses.find((a: { address: string }) => a.address.startsWith('ST'));
          const address = testnetAddr?.address || stxAddresses[0]?.address;
          
          if (address) {
            setWalletState({
              isConnected: true,
              address,
              isConnecting: false,
            });
          }
        }
      } catch (error) {
        console.log('No existing session found');
      }
    };
    checkExistingSession();
  }, []);

  const connectWallet = useCallback(async () => {
    setWalletState(prev => ({ ...prev, isConnecting: true }));

    try {
      const response = await connect({
        walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
      });

      if (response && response.addresses && response.addresses.length > 0) {
        // Find testnet address (starts with ST) or use first available
        const testnetAddr = response.addresses.find(
          (addr) => addr.address.startsWith('ST')
        );
        const address = testnetAddr?.address || response.addresses[0]?.address;

        setWalletState({
          isConnected: true,
          address: address || null,
          isConnecting: false,
        });

        return address;
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setWalletState(prev => ({ ...prev, isConnecting: false }));
      throw error;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    // Clear local storage
    try {
      localStorage.removeItem('stacks-session');
    } catch {}
    
    setWalletState({
      isConnected: false,
      address: null,
      isConnecting: false,
    });
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
  };
}
