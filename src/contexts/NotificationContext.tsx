import React, { createContext, useContext, useState, useCallback } from 'react';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Activity log types
export type ActivityType = 'upload' | 'download' | 'delete' | 'share' | 'request-access';
export interface ActivityLogEntry {
  id: string;
  type: ActivityType;
  recordName: string;
  timestamp: string;
  details?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (message: string, type?: Notification['type']) => void;
  removeNotification: (id: string) => void;
}

// Activity log context
const ActivityLogContext = createContext<{
  log: ActivityLogEntry[];
  addActivity: (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'> & { details?: string }) => void;
} | undefined>(undefined);

export const ActivityLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [log, setLog] = useState<ActivityLogEntry[]>([]);

  const addActivity = useCallback((entry: Omit<ActivityLogEntry, 'id' | 'timestamp'> & { details?: string }) => {
    setLog(prev => [
      {
        ...entry,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleString(),
      },
      ...prev,
    ]);
  }, []);

  return (
    <ActivityLogContext.Provider value={{ log, addActivity }}>
      {children}
    </ActivityLogContext.Provider>
  );
};

export const useActivityLog = () => {
  const context = useContext(ActivityLogContext);
  if (!context) throw new Error('useActivityLog must be used within an ActivityLogProvider');
  return context;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: Notification['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 3000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`px-4 py-2 rounded shadow text-white ${
              n.type === 'success' ? 'bg-green-600' : n.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
            }`}
          >
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
}; 