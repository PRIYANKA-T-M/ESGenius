import React, { useState } from 'react';
import { useGovernanceApi } from '../hooks/useGovernanceApi';

export default function PolicyUpload({ onUploadSuccess }) {
  const { summarizePolicy, loading, error } = useGovernanceApi();
  const [file, setFile] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    const result = await summarizePolicy(file);
    if (result) {
      setAiResult(result);
      if (onUploadSuccess) onUploadSuccess();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Upload New Policy</h2>
      <form onSubmit={handleUpload}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Policy PDF</label>
          <input 
            type="file" 
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <button 
          type="submit" 
          disabled={!file || loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Analyzing with AI...' : 'Upload & Analyze'}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {aiResult && (
        <div className="mt-6 space-y-4 border-t pt-4">
          <h3 className="font-semibold text-gray-800">AI Summary</h3>
          <p className="text-sm text-gray-600">{aiResult.summary}</p>
          
          <h4 className="font-semibold text-gray-800 text-sm">Top Risks:</h4>
          <ul className="list-disc pl-5 text-sm text-red-600">
            {aiResult.top_risks?.map((risk, i) => <li key={i}>{risk}</li>)}
          </ul>
          
          <h4 className="font-semibold text-gray-800 text-sm">Compliance Checklist:</h4>
          <ul className="list-disc pl-5 text-sm text-green-600">
            {aiResult.checklist?.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
