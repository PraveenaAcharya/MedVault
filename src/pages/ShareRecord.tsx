import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecords } from '../contexts/RecordsContext';

const ShareRecord: React.FC = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const { records } = useRecords();
  const record = records.find(r => r.id === recordId);

  if (!record) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Record Not Found</h2>
        <p className="mt-2 text-gray-600">The requested record could not be found or has expired.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Shared Medical Record
          </h3>
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-500">Record Name</h4>
            <p className="mt-1 text-sm text-gray-900">{record.name}</p>
          </div>
          {record.description && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="mt-1 text-sm text-gray-900">{record.description}</p>
            </div>
          )}
          <div className="mt-6">
            <a
              href={record.fileUrl}
              download={record.name}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Download Record
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareRecord; 