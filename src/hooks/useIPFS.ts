import { useState, useCallback } from 'react';
import { Web3Storage } from 'web3.storage';

const WEB3_STORAGE_TOKEN = process.env.REACT_APP_WEB3_STORAGE_TOKEN || '';

export function useIPFS() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (!WEB3_STORAGE_TOKEN) {
      throw new Error('Web3.Storage token not found');
    }

    try {
      setLoading(true);
      setError(null);

      const client = new Web3Storage({ token: WEB3_STORAGE_TOKEN });
      const cid = await client.put([file], {
        name: file.name,
        maxRetries: 3,
      });

      return cid;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFile = useCallback(async (cid: string) => {
    if (!WEB3_STORAGE_TOKEN) {
      throw new Error('Web3.Storage token not found');
    }

    try {
      setLoading(true);
      setError(null);

      const client = new Web3Storage({ token: WEB3_STORAGE_TOKEN });
      const res = await client.get(cid);
      
      if (!res) {
        throw new Error('File not found');
      }

      const files = await res.files();
      return files[0];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve file');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    uploadFile,
    getFile,
    loading,
    error,
  };
} 