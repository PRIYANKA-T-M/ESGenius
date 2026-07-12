import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Loader2, CheckCircle, Database } from 'lucide-react';
import { useEnvironmentalApi } from '../hooks/useEnvironmentalApi';

const InvoiceUploader = ({ onUploadSuccess }) => {
  const { importInvoice } = useEnvironmentalApi();
  const fileRef = useRef(null);
  const [status, setStatus] = useState('IDLE');
  const [result, setResult] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus('UPLOADING');
    const res = await importInvoice(file);
    if (res) {
      setResult(res);
      setStatus('SUCCESS');
      onUploadSuccess();
    } else {
      setStatus('ERROR');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full p-5 flex flex-col">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
        <FileText className="text-blue-600 mr-2 h-5 w-5" /> AI Invoice Parsing
      </h2>

      {status === 'IDLE' && (
        <div 
          onClick={() => fileRef.current.click()}
          className="flex-1 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-700">Upload Fuel/Electricity Bill</p>
          <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG</p>
          <input type="file" className="hidden" ref={fileRef} onChange={handleUpload} />
        </div>
      )}

      {status === 'UPLOADING' && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm font-medium text-gray-700">EcoPilot AI is extracting data...</p>
        </div>
      )}

      {status === 'SUCCESS' && result && (
        <div className="flex-1 flex flex-col justify-center space-y-3 bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center text-green-700 font-medium">
            <CheckCircle className="h-5 w-5 mr-2" /> Data Extracted!
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p><b>Activity:</b> {result.activity_type}</p>
            <p><b>Quantity:</b> {result.quantity}</p>
            <p><b>Carbon Calculated:</b> <span className="text-red-600 font-bold">{result.carbon_emission} tCO2e</span></p>
          </div>
          <button onClick={() => setStatus('IDLE')} className="mt-2 text-sm text-blue-600 font-medium hover:underline">Upload Another</button>
        </div>
      )}

      {status === 'ERROR' && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Database className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-sm font-medium text-gray-900">Upload Failed</p>
          <button onClick={() => setStatus('IDLE')} className="text-xs text-blue-600 mt-2">Try Again</button>
        </div>
      )}
    </div>
  );
};
export default InvoiceUploader;
