import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useRecords } from '../contexts/RecordsContext';
import { Link } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { useVaccination } from '../contexts/VaccinationContext';
import VerificationBadge from '../components/VerificationBadge';
import VaccinationManager from '../components/VaccinationManager';

const SUPPORTED_NETWORKS = [1, 5, 137, 80001, 1337];

const Dashboard: React.FC = () => {
  const { isConnected, account, disconnectWallet, networkName, chainId } = useWeb3();
  const { records, accessRequests } = useRecords();
  const recentRecords = records.slice(0, 3);
  const profile = useUserProfile();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editProfile, setEditProfile] = useState({
    name: profile.name,
    age: profile.age,
    profilePicture: profile.profilePicture,
  });
  const [pictureMode, setPictureMode] = useState<'url' | 'upload'>('url');
  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const { isVerified } = useVaccination();

  const pendingRequestsCount = accessRequests.filter(
    req => req.status === 'pending' && records.find(r => r.id === req.recordId)?.owner === account
  ).length;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleCopy = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
  };

  const handleEditSave = () => {
    profile.setProfile({
      name: editProfile.name,
      age: Number(editProfile.age),
      profilePicture: editProfile.profilePicture,
    });
    setEditing(false);
  };

  const handleEditCancel = () => {
    setEditProfile({
      name: profile.name,
      age: profile.age,
      profilePicture: profile.profilePicture,
    });
    setEditing(false);
  };

  return (
    <div className="space-y-8 px-2 sm:px-4 md:px-8">
      {/* User Details Section */}
      <h2 className="text-2xl font-bold mb-2 border-b border-gray-200 pb-2">User Details</h2>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between flex-wrap gap-4">
        {isConnected && (
          <div className="relative">
            {/* Visually attractive profile card */}
            <div className="flex items-center bg-gradient-to-r from-primary-100 to-primary-200 dark:from-gray-800 dark:to-gray-900 shadow-lg rounded-2xl px-6 py-4 min-w-[340px] max-w-full border border-primary-200 dark:border-gray-700 transition-all">
              <div className="relative">
                <img
                  src={profile.profilePicture}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md dark:border-gray-800 transition-all"
                />
                {pendingRequestsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-lg animate-bounce">
                    {pendingRequestsCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 ml-6">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 truncate">{profile.name}</span>
                  {isVerified && <VerificationBadge />}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300 truncate mb-1">{profile.ensName}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">Age: <span className="font-semibold text-gray-700 dark:text-gray-200">{profile.age}</span></div>
                <div className="text-sm text-primary-700 dark:text-primary-300 font-medium mb-1">Records: {records.length}</div>
                <div className="text-xs text-gray-400">{networkName || 'Unknown Network'}</div>
                {chainId && !SUPPORTED_NETWORKS.includes(chainId) && (
                  <span className="block text-xs text-red-600 mt-1">Unsupported network!</span>
                )}
              </div>
              <button
                className="ml-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                onClick={() => setDropdownOpen((v) => !v)}
                aria-label="Open profile menu"
              >
                <svg className="w-6 h-6 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-24 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 p-6">
                {/* Dark mode toggle */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500 dark:text-gray-300">Dark Mode</span>
                  <button
                    onClick={() => setDarkMode((d) => !d)}
                    className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-200 ${darkMode ? 'bg-primary-600' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${darkMode ? 'translate-x-5' : ''}`}
                    />
                  </button>
                </div>
                <div className="mb-4">
                  <span className="block text-xs text-gray-400">Wallet Address</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="font-mono text-xs text-gray-700 dark:text-gray-200 truncate">{account}</span>
                    <button
                      onClick={handleCopy}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-xs text-primary-600"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="block text-xs text-gray-400">ENS Name</span>
                  <span className="font-mono text-xs text-gray-700 dark:text-gray-200 truncate">{profile.ensName}</span>
                </div>
                <div className="mb-4">
                  <span className="block text-xs text-gray-400">Age</span>
                  <span className="font-mono text-xs text-gray-700 dark:text-gray-200 truncate">{profile.age}</span>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="w-full mt-2 px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200 rounded hover:bg-primary-200 dark:hover:bg-primary-800 text-sm font-medium"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => { disconnectWallet(); setDropdownOpen(false); }}
                  className="w-full mt-2 px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800 text-sm font-medium"
                >
                  Disconnect Wallet
                </button>
              </div>
            )}
            {/* Edit Profile Modal */}
            {editing && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
                  <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={handleEditCancel}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="flex flex-col items-center mb-6">
                    <img
                      src={editProfile.profilePicture}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-primary-200 dark:border-primary-700 shadow mb-2"
                    />
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{editProfile.name || 'Your Name'}</span>
                  </div>
                  <form onSubmit={e => { e.preventDefault(); handleEditSave(); }} className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Profile Picture</label>
                      <div className="flex space-x-2 mb-2">
                        <button
                          type="button"
                          className={`px-3 py-1 rounded ${pictureMode === 'url' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
                          onClick={() => setPictureMode('url')}
                        >
                          Use URL
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 rounded ${pictureMode === 'upload' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
                          onClick={() => setPictureMode('upload')}
                        >
                          Upload
                        </button>
                      </div>
                      {pictureMode === 'url' ? (
                        <input
                          type="text"
                          name="profilePicture"
                          value={editProfile.profilePicture}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border rounded text-sm focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Paste image URL"
                        />
                      ) : (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = ev => {
                                setEditProfile(prev => ({ ...prev, profilePicture: ev.target?.result as string }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full px-3 py-2 border rounded text-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-900"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={editProfile.name}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border rounded text-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={editProfile.age}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border rounded text-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm font-medium">Save</button>
                      <button type="button" onClick={handleEditCancel} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded hover:bg-gray-300 dark:hover:bg-gray-700 text-sm font-medium">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {!isConnected ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 dark:bg-yellow-900 dark:border-yellow-700">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                Please connect your wallet to access the full features of MedVault.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 min-w-[340px]">
            {/* Recent Records Section */}
            <div className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <h2 className="text-xl font-semibold mb-3 border-b border-gray-100 pb-2">Recent Records</h2>
              {recentRecords.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-300">No records uploaded yet.</p>
              ) : (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentRecords.map(record => (
                    <li key={record.id} className="py-2">
                        <span className="font-medium text-gray-800 dark:text-gray-100">{record.name}</span>
                        <span className="ml-2 text-xs text-gray-400 dark:text-gray-300">{new Date(record.uploadDate).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              )}
                <div className="flex justify-end mt-3">
                  <Link to="/records" className="text-primary-600 dark:text-primary-300 text-xs hover:underline">View All</Link>
                </div>
              </div>
            </div>
            {/* Upload New Section */}
            <div className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <h2 className="text-xl font-semibold mb-3 border-b border-gray-100 pb-2">Upload New</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">Add new medical records to your vault</p>
              <Link to="/upload" className="inline-block mt-3 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">Upload</Link>
            </div>
          </div>
            {/* Access Requests Section */}
            <div className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <h2 className="text-xl font-semibold mb-3 border-b border-gray-100 pb-2">Access Requests</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">Manage access to your medical records</p>
                <Link to="/access" className="inline-block mt-3 px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200 rounded hover:bg-primary-200 dark:hover:bg-primary-800">Manage</Link>
              </div>
            </div>
            {/* Vaccination Records Section (full width) */}
            <div className="col-span-full mt-8">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Vaccination Records</h2>
                <VaccinationManager />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 