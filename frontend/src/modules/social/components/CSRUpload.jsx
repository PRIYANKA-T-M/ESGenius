import React, { useRef, useState } from 'react';
import { UploadCloud, Image, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useSocialApi } from '../hooks/useSocialApi';

const CSRUpload = ({ onUploadSuccess }) => {
  const { uploadCSRProof } = useSocialApi();
  const fileRef = useRef(null);
  const [status, setStatus] = useState('IDLE');
  const [result, setResult] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus('VERIFYING');
    
    // Hardcoded employee_id and activity_id for demo
    const res = await uploadCSRProof(1, 1, file);
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
        <Image className="text-blue-600 mr-2 h-5 w-5" /> AI Proof Verification
      </h2>

      {status === 'IDLE' && (
        <div 
          onClick={() => fileRef.current.click()}
          className="flex-1 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-700">Upload CSR Event Photo</p>
          <p className="text-xs text-gray-500 mt-1">EcoPilot Vision verification</p>
          <input type="file" className="hidden" ref={fileRef} accept="image/*" onChange={handleUpload} />
        </div>
      )}

      {status === 'VERIFYING' && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm font-medium text-gray-700">Analyzing Image...</p>
        </div>
      )}

      {status === 'SUCCESS' && result && (
        <div className={`flex-1 flex flex-col justify-center space-y-3 p-4 rounded-lg border ${result.approval_status === 'APPROVED' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <div className={`flex items-center font-medium ${result.approval_status === 'APPROVED' ? 'text-green-700' : 'text-red-700'}`}>
            {result.approval_status === 'APPROVED' ? <CheckCircle className="h-5 w-5 mr-2" /> : <XCircle className="h-5 w-5 mr-2" />}
            {result.approval_status}
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p><b>XP Earned:</b> {result.points}</p>
          </div>
          <button onClick={() => setStatus('IDLE')} className="mt-2 text-sm text-blue-600 font-medium hover:underline">Upload Another</button>
        </div>
      )}

      {status === 'ERROR' && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-sm font-medium text-gray-900">Verification Failed</p>
          <button onClick={() => setStatus('IDLE')} className="text-xs text-blue-600 mt-2">Try Again</button>
        </div>
      )}
    </div>
  );
};
export default CSRUpload;
