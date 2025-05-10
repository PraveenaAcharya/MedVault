import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Web3Provider } from './contexts/Web3Context';
import { RecordsProvider } from './contexts/RecordsContext';
import { NotificationProvider, ActivityLogProvider } from './contexts/NotificationContext';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <NotificationProvider>
      <Web3Provider>
        <RecordsProvider>
          <ActivityLogProvider>
            <App />
          </ActivityLogProvider>
        </RecordsProvider>
      </Web3Provider>
    </NotificationProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
