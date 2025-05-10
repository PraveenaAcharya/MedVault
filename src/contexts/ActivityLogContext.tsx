import React, { createContext, useContext, useState } from 'react';

interface ActivityLogEntry {
  id: string;
  type: string;
  recordName: string;
  details?: string;
  timestamp: string;
}

interface ActivityLogContextType {
  log: ActivityLogEntry[];
  addActivity: (activity: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => void;
}

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined);

export const ActivityLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [log, setLog] = useState<ActivityLogEntry[]>([]);

  const addActivity = (activity: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: ActivityLogEntry = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleString()
    };
    setLog(prev => [newEntry, ...prev].slice(0, 50)); // Keep last 50 entries
  };

  return (
    <ActivityLogContext.Provider value={{ log, addActivity }}>
      {children}
    </ActivityLogContext.Provider>
  );
};

export const useActivityLog = () => {
  const context = useContext(ActivityLogContext);
  if (context === undefined) {
    throw new Error('useActivityLog must be used within an ActivityLogProvider');
  }
  return context;
}; 