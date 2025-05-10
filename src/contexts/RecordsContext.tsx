import React, { createContext, useContext, useState } from 'react';
import { useNotification } from './NotificationContext';

export interface MedicalRecord {
  id: string;
  name: string;
  description: string;
  uploadDate: string;
  fileUrl: string;
  owner: string;
}

export interface AccessRequest {
  id: string;
  address: string;
  recordId: string;
  status: 'pending' | 'granted' | 'revoked' | 'rejected';
}

interface RecordsContextType {
  records: MedicalRecord[];
  addRecord: (record: Omit<MedicalRecord, 'id' | 'uploadDate'>) => void;
  deleteRecord: (id: string) => void;
  accessRequests: AccessRequest[];
  grantAccess: (requestId: string) => void;
  revokeAccess: (requestId: string) => void;
  requestAccess: (address: string, recordId: string) => void;
  approveAccess: (requestId: string) => void;
  rejectAccess: (requestId: string) => void;
}

const RecordsContext = createContext<RecordsContextType | undefined>(undefined);

export const RecordsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const { showNotification } = useNotification();

  const addRecord = (record: Omit<MedicalRecord, 'id' | 'uploadDate'>) => {
    setRecords(prev => [
      {
        ...record,
        id: Math.random().toString(36).substr(2, 9),
        uploadDate: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(record => record.id !== id));
  };

  const grantAccess = (requestId: string) => {
    setAccessRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'granted' } : r));
  };

  const revokeAccess = (requestId: string) => {
    setAccessRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'revoked' } : r));
  };

  const requestAccess = (address: string, recordId: string) => {
    // Find the record
    const record = records.find(r => r.id === recordId);
    if (record && record.owner !== address) {
      setAccessRequests(prev => [
        {
          id: Math.random().toString(36).substr(2, 9),
          address,
          recordId,
          status: 'pending',
        },
        ...prev,
      ]);
      // Notify the owner
      showNotification(
        `New access request for "${record.name}" from ${address.slice(0, 6)}...${address.slice(-4)}`,
        'info'
      );
    }
  };

  const approveAccess = (requestId: string) => {
    // Implementation of approveAccess
  };

  const rejectAccess = (requestId: string) => {
    // Implementation of rejectAccess
  };

  return (
    <RecordsContext.Provider value={{
      records,
      addRecord,
      deleteRecord,
      accessRequests,
      grantAccess,
      revokeAccess,
      requestAccess,
      approveAccess,
      rejectAccess,
    }}>
      {children}
    </RecordsContext.Provider>
  );
};

export const useRecords = () => {
  const context = useContext(RecordsContext);
  if (!context) throw new Error('useRecords must be used within a RecordsProvider');
  return context;
}; 