import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 1337], // Add your supported networks
});

export function useWeb3() {
  const { activate, deactivate, account, library, chainId } = useWeb3React();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await activate(injected);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  }, [activate]);

  const disconnect = useCallback(() => {
    try {
      deactivate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect wallet');
    }
  }, [deactivate]);

  useEffect(() => {
    // Check if user is already connected
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        activate(injected);
      }
    });
  }, [activate]);

  return {
    connect,
    disconnect,
    account,
    library,
    chainId,
    loading,
    error,
  };
}