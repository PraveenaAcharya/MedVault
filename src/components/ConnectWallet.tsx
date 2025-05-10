import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useNavigate } from 'react-router-dom';

export const ConnectWallet: React.FC = () => {
  const { isConnected, connectWallet, disconnectWallet, shortAddress, error } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [showInstallMetaMask, setShowInstallMetaMask] = useState(false);
  const navigate = useNavigate();

  // Reset connection state on mount
  useEffect(() => {
    disconnectWallet();
  }, []);

  const handleClick = async () => {
    if (isConnected) {
      disconnectWallet();
      navigate('/');
    } else {
      try {
        setIsLoading(true);
        // Check if MetaMask is installed
        if (!window.ethereum) {
          setShowInstallMetaMask(true);
          return;
        }
        // Wait for the connection to complete
        await connectWallet();
        // Add a small delay to ensure MetaMask has time to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Only navigate after successful connection
        if (isConnected) {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Error in handleClick:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInstallMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleClick}
        className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
          isConnected
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]`}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </span>
        ) : isConnected ? (
          shortAddress
        ) : (
          'Connect Wallet'
        )}
      </button>
      {error && (
        <div className="mt-2 text-sm text-red-600 max-w-xs text-right">
          {error}
        </div>
      )}
      {showInstallMetaMask && (
        <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800 mb-2">
            MetaMask is not installed. Please install MetaMask to continue.
          </p>
          <button
            onClick={handleInstallMetaMask}
            className="text-sm text-yellow-800 underline hover:text-yellow-900"
          >
            Install MetaMask
          </button>
        </div>
      )}
    </div>
  );
}; 