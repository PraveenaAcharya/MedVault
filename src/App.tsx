import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Web3Provider } from './contexts/Web3Context';
import { ConnectWallet } from './components/ConnectWallet';
import { ProtectedRoute } from './components/ProtectedRoute';
import { VaccinationProvider } from './contexts/VaccinationContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { RecordsProvider } from './contexts/RecordsContext';
import { ActivityLogProvider } from './contexts/ActivityLogContext';

// Import your page components
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Records from './pages/Records';
import Access from './pages/Access';
import ShareRecord from './pages/ShareRecord';

const App: React.FC = () => {
  return (
    <Web3Provider>
      <NotificationProvider>
        <RecordsProvider>
          <ActivityLogProvider>
            <VaccinationProvider>
              <Router>
                <div className="min-h-screen bg-gray-50">
                  {/* Header with Connect Wallet button */}
                  <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                      <h1 className="text-2xl font-bold text-gray-900">MedVault</h1>
                      <ConnectWallet />
                    </div>
                  </header>

                  {/* Main content */}
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/upload"
                        element={
                          <ProtectedRoute>
                            <Upload />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/records"
                        element={
                          <ProtectedRoute>
                            <Records />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/access"
                        element={
                          <ProtectedRoute>
                            <Access />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/share/:recordId" element={<ShareRecord />} />
                    </Routes>
                  </main>
                </div>
              </Router>
            </VaccinationProvider>
          </ActivityLogProvider>
        </RecordsProvider>
      </NotificationProvider>
    </Web3Provider>
  );
};

export default App;
