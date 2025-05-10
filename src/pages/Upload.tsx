import React, { useRef, useState } from 'react';
import { useRecords } from '../contexts/RecordsContext';
import { useNotification } from '../contexts/NotificationContext';
import { useWeb3 } from '../contexts/Web3Context';

const Upload: React.FC = () => {
  const { addRecord } = useRecords();
  const { showNotification } = useNotification();
  const { account } = useWeb3();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setName(e.target.files[0].name);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name || !account) return;
    // Mock file storage: create a local URL
    const fileUrl = URL.createObjectURL(file);
    addRecord({ name, description, fileUrl, owner: account });
    setSuccess(true);
    showNotification('Record uploaded successfully!', 'success');
    setFile(null);
    setDescription('');
    setName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Upload Medical Records</h2>
      <form onSubmit={handleUpload} className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6 space-y-4">
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
              Select Medical Record
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                    <span>{file ? file.name : 'Upload a file'}</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" ref={fileInputRef} onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={3}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Add a description for this medical record..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={!file}
            >
              Upload to Blockchain
            </button>
            {success && <span className="ml-4 text-green-600">Uploaded!</span>}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Upload; 