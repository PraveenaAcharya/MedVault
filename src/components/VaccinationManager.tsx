import React, { useState } from 'react';
import { useVaccination } from '../contexts/VaccinationContext';
import { useNotification } from '../contexts/NotificationContext';

const VaccinationManager: React.FC = () => {
  const { vaccinations, verifyVaccination, verifiedCount } = useVaccination();
  const { showNotification } = useNotification();
  const [selectedVaccination, setSelectedVaccination] = useState<string | null>(null);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVerificationFile(e.target.files[0]);
    }
  };

  const handleVerify = (vaccinationId: string) => {
    if (!verificationFile) {
      showNotification('Please upload a verification document', 'error');
      return;
    }

    // Here you would typically:
    // 1. Upload the file to IPFS or your preferred storage
    // 2. Verify the document's authenticity
    // 3. Update the blockchain with the verification status
    
    // For now, we'll just simulate the verification
    verifyVaccination(vaccinationId, 'Govt. Portal');
    showNotification('Vaccination verified successfully!', 'success');
    setSelectedVaccination(null);
    setVerificationFile(null);
  };

  const filteredVaccinations = vaccinations.filter(vaccination =>
    vaccination.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Vaccination Records</h3>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {verifiedCount} of {vaccinations.length} verified
          </div>
          <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-300"
              style={{ width: `${(verifiedCount / vaccinations.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search vaccinations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Vaccination List */}
      <div className="space-y-4 max-h-64 overflow-y-auto sm:max-h-none sm:overflow-visible pr-1">
        {filteredVaccinations.map(vaccination => (
          <div
            key={vaccination.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              {vaccination.verified ? (
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {vaccination.name}
                </span>
                {vaccination.verified && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    Verified on {vaccination.verificationDate ? new Date(vaccination.verificationDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                    {vaccination.issuer && (
                      <>
                        {' '}by {vaccination.issuer}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            {!vaccination.verified && (
              <button
                onClick={() => setSelectedVaccination(vaccination.id)}
                className="px-3 py-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                Verify
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Verification Modal */}
      {selectedVaccination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Verify Vaccination
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Verification Document
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedVaccination(null);
                    setVerificationFile(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerify(selectedVaccination)}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                >
                  Submit Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccinationManager; 