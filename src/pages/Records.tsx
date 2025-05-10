import React, { useState } from 'react';
import { useRecords } from '../contexts/RecordsContext';
import { useWeb3 } from '../contexts/Web3Context';
import { useNotification, useActivityLog } from '../contexts/NotificationContext';

const Records: React.FC = () => {
  const { records, accessRequests, requestAccess, deleteRecord } = useRecords();
  const { account } = useWeb3();
  const { showNotification } = useNotification();
  const { log, addActivity } = useActivityLog();

  // Search/filter state
  const [search, setSearch] = useState('');

  // Share modal state
  const [shareModal, setShareModal] = useState<{ open: boolean; link: string; expiry: string; recordName?: string } | null>(null);

  // Preview modal state
  const [previewModal, setPreviewModal] = useState<{ open: boolean; record: any } | null>(null);

  const handleRequestAccess = (recordId: string, recordName: string) => {
    if (!account) return;
    requestAccess(account, recordId);
    showNotification('Access request sent!', 'info');
    addActivity({ type: 'request-access', recordName });
  };

  const handleDelete = (recordId: string, recordName: string) => {
    if (window.confirm(`Are you sure you want to delete "${recordName}"? This action cannot be undone.`)) {
      deleteRecord(recordId);
      showNotification('Record deleted successfully!', 'success');
      addActivity({ type: 'delete', recordName });
    }
  };

  const handleShare = (recordId: string, recordName: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/share/${recordId}?token=${Math.random().toString(36).substr(2, 10)}`;
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString();
    setShareModal({ open: true, link, expiry, recordName });
    addActivity({ type: 'share', recordName, details: link });
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    showNotification('Link copied to clipboard!', 'success');
  };

  // Filtered records
  const filteredRecords = records.filter(record => {
    const searchLower = search.toLowerCase();
    return (
      record.name.toLowerCase().includes(searchLower) ||
      record.description.toLowerCase().includes(searchLower) ||
      record.name.toLowerCase().endsWith(searchLower)
    );
  });

  // Download handler (log activity)
  const handleDownload = (record: any) => {
    addActivity({ type: 'download', recordName: record.name });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Medical Records</h2>
      {/* Search/filter bar */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, description, or file type (e.g. pdf, jpg)"
          className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
        />
        <span className="text-xs text-gray-500 mt-1 sm:mt-0">{filteredRecords.length} record(s) found</span>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredRecords.length === 0 ? (
          <div className="p-6 text-gray-500">No records found.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredRecords.map(record => {
              const isOwner = record.owner === account;
              const pending = accessRequests.some(
                r => r.recordId === record.id && r.address === account && r.status === 'pending'
              );
              // Determine file type for preview
              const ext = record.name.split('.').pop()?.toLowerCase();
              let preview: React.ReactNode = null;
              if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '')) {
                preview = (
                  <img
                    src={record.fileUrl}
                    alt={record.name}
                    className="w-16 h-16 object-cover rounded shadow border border-gray-200 mr-4"
                  />
                );
              } else if (ext === 'pdf') {
                preview = (
                  <div className="w-16 h-16 flex items-center justify-center bg-red-50 rounded shadow border border-gray-200 mr-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                );
              } else {
                preview = (
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded shadow border border-gray-200 mr-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4z" />
                    </svg>
                  </div>
                );
              }
              return (
                <li key={record.id}>
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center">
                      <button
                        type="button"
                        className="focus:outline-none"
                        onClick={() => setPreviewModal({ open: true, record })}
                      >
                        {preview}
                      </button>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{record.name}</h3>
                        <p className="text-sm text-gray-500">Uploaded on {new Date(record.uploadDate).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-400 mt-1">{record.description}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 items-center">
                      <a
                        href={record.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        onClick={() => addActivity({ type: 'upload', recordName: record.name })}
                      >
                        View
                      </a>
                      <a
                        href={record.fileUrl}
                        download={record.name}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        onClick={() => handleDownload(record)}
                      >
                        Download
                      </a>
                      {isOwner && (
                        <button
                          onClick={() => handleShare(record.id, record.name)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Share
                        </button>
                      )}
                      {!isOwner && (
                        pending ? (
                          <span className="text-xs text-yellow-600 font-semibold ml-2">Pending</span>
                        ) : (
                          <button
                            onClick={() => handleRequestAccess(record.id, record.name)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ml-2"
                          >
                            Request Access
                          </button>
                        )
                      )}
                      {isOwner && (
                        <button
                          onClick={() => handleDelete(record.id, record.name)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {/* Share Modal */}
      {shareModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Share Record Link</h3>
            <p className="text-sm text-gray-600 mb-2">This link will expire on:</p>
            <p className="text-sm font-mono text-gray-800 mb-4">{shareModal.expiry}</p>
            <div className="flex items-center mb-4">
              <input
                type="text"
                value={shareModal.link}
                readOnly
                className="flex-1 px-2 py-1 border rounded-l bg-gray-100 text-xs font-mono"
              />
              <button
                onClick={() => handleCopy(shareModal.link)}
                className="px-3 py-1 bg-primary-600 text-white rounded-r hover:bg-primary-700 text-xs"
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setShareModal(null)}
              className="mt-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Preview Modal */}
      {previewModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => setPreviewModal(null)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold mb-4">{previewModal.record.name}</h3>
            {(() => {
              const ext = previewModal.record.name.split('.').pop()?.toLowerCase();
              if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext || "")) {
                return (
                  <img
                    src={previewModal.record.fileUrl}
                    alt={previewModal.record.name}
                    className="w-full max-h-[60vh] object-contain rounded shadow mb-4"
                  />
                );
              } else if (ext === "pdf") {
                return (
                  <iframe
                    src={previewModal.record.fileUrl}
                    title="PDF Preview"
                    className="w-full h-[60vh] rounded border mb-4"
                  />
                );
              } else {
                return (
                  <div className="flex flex-col items-center justify-center py-8">
                    <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4z" />
                    </svg>
                    <span className="text-gray-600">No preview available</span>
                    <a
                      href={previewModal.record.fileUrl}
                      download={previewModal.record.name}
                      className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                    >
                      Download File
                    </a>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      )}
      {/* Activity Log Section */}
      <div className="mt-8 bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Activity Log</h3>
        {log.length === 0 ? (
          <p className="text-gray-400 text-sm">No activity yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
            {log.map(entry => (
              <li key={entry.id} className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="font-medium text-gray-800 capitalize">{entry.type.replace('-', ' ')}</span>
                  <span className="ml-2 text-gray-600">{entry.recordName}</span>
                  {entry.details && (
                    <span className="ml-2 text-xs text-gray-400">{entry.details}</span>
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-1 sm:mt-0">{entry.timestamp}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Records; 