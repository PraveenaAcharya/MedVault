import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
  account: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  shortAddress: string | null;
  error: string | null;
  chainId: number | null;
  networkName: string | null;
  isMetaMaskInstalled: boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const NETWORKS: Record<number, string> = {
  1: 'Ethereum Mainnet',
  3: 'Ropsten',
  4: 'Rinkeby',
  5: 'Goerli',
  42: 'Kovan',
  137: 'Polygon',
  80001: 'Mumbai',
  1337: 'Localhost',
};

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  // Check if MetaMask is installed
  useEffect(() => {
    setIsMetaMaskInstalled(!!window.ethereum);
  }, []);

  // Get shortened address for display
  const shortAddress = account 
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  // Check if MetaMask is installed
  const checkIfWalletIsInstalled = () => {
    if (!window.ethereum) {
      const error = 'Please install MetaMask to use this application';
      setError(error);
      throw new Error(error);
    }
  };

  // Connect wallet function
  const connectWallet = async () => {
    if (isConnecting) return;
    
    try {
      setIsConnecting(true);
      setError(null);
      checkIfWalletIsInstalled();

      // First, disconnect any existing connection
      disconnectWallet();

      // Force MetaMask to forget the connection
      if (window.ethereum.disconnect) {
        await window.ethereum.disconnect();
      }

      // Force MetaMask to show the popup by using request method directly
      if (!window.ethereum.request) {
        throw new Error('MetaMask request method not available');
      }

      // This should force the MetaMask popup to appear
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts',
        params: [] 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      setChainId(network.chainId);
      setNetworkName(NETWORKS[network.chainId] || `Chain ${network.chainId}`);
      setAccount(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setError(errorMessage);
      setIsConnected(false);
      setAccount(null);
      setChainId(null);
      setNetworkName(null);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setError(null);
    setChainId(null);
    setNetworkName(null);
  };

  // Listen for account and chain changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      });
      window.ethereum.on('chainChanged', (chainIdHex: string) => {
        const chainIdNum = parseInt(chainIdHex, 16);
        setChainId(chainIdNum);
        setNetworkName(NETWORKS[chainIdNum] || `Chain ${chainIdNum}`);
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return (
    <Web3Context.Provider value={{
      account,
      isConnected,
      connectWallet,
      disconnectWallet,
      shortAddress,
      error,
      chainId,
      networkName,
      isMetaMaskInstalled,
    }}>
      {children}
    </Web3Context.Provider>
  );
};

// Custom hook to use Web3 context
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}; 