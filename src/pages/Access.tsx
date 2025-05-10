import React, { useState } from 'react';
import { useRecords } from '../contexts/RecordsContext';
import { useNotification } from '../contexts/NotificationContext';
import { useWeb3 } from '../contexts/Web3Context';

const durations = [
  { label: '24 hours', value: '24h' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: 'Permanent', value: 'permanent' },
];

const Access: React.FC = () => {
  const { records, accessRequests, grantAccess, revokeAccess, approveAccess, rejectAccess } = useRecords();
  const { showNotification } = useNotification();
  const { account } = useWeb3();
  const [address, setAddress] = useState('');
  const [recordId, setRecordId] = useState(records[0]?.id || '');
  const [duration, setDuration] = useState(durations[0].value);
  const [success, setSuccess] = useState(false);

  // Pending requests for records owned by the current user
  const pendingRequests = accessRequests.filter(
    req => req.status === 'pending' && records.find(r => r.id === req.recordId)?.owner === account
  );

  const handleGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !recordId) return;
    grantAccess(
      Math.random().toString(36).substr(2, 9)
    );
    setSuccess(true);
    showNotification('Access granted successfully!', 'success');
    setTimeout(() => setSuccess(false), 2000);
    setAddress('');
    setRecordId(records[0]?.id || '');
    setDuration(durations[0].value);
  };

  const handleApprove = (requestId: string) => {
    approveAccess(requestId);
    showNotification('Access request approved!', 'success');
  };

  const handleReject = (requestId: string) => {
    rejectAccess(requestId);
    showNotification('Access request rejected.', 'info');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Access Management</h2>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Pending Requests</h3>
            <ul className="divide-y divide-gray-200">
              {pendingRequests.map(req => (
                <li key={req.id} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs text-gray-700">{req.address}</div>
                    <div className="text-sm text-gray-500">
                      {records.find(r => r.id === req.recordId)?.name || 'Unknown Record'}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="px-3 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Grant Access Form and Active Grants (existing code) */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={handleGrant} className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900">Grant Access</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="wallet-address" className="block text-sm font-medium text-gray-700">
                Recipient Wallet Address
              </label>
              <input
                type="text"
                name="wallet-address"
                id="wallet-address"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="0x..."
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="record-select" className="block text-sm font-medium text-gray-700">
                Select Record
              </label>
              <select
                id="record-select"
                name="record-select"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={recordId}
                onChange={e => setRecordId(e.target.value)}
                required
              >
                {records.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Access Duration
              </label>
              <select
                id="duration"
                name="duration"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={duration}
                onChange={e => setDuration(e.target.value)}
              >
                {durations.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Grant Access
              </button>
              {success && <span className="ml-4 text-green-600">Access granted!</span>}
            </div>
          </div>
        </form>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900">Active Access Grants</h3>
          <div className="mt-4">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {accessRequests.length === 0 && (
                  <li className="py-4 text-gray-500">No access grants yet.</li>
                )}
                {accessRequests.map(req => req.status === 'granted' && (
                  <li key={req.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {req.address}
                        </p>
                        <p className="text-sm text-gray-500">
                          {records.find(r => r.id === req.recordId)?.name || 'Unknown Record'} • {duration}
                        </p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => revokeAccess(req.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Access;