import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Loader2, CheckCircle, Copy, AlertTriangle, ListChecks, ArrowRight } from 'lucide-react';
import { useGovernanceApi } from '../hooks/useGovernanceApi';

const PolicyUpload = () => {
  const { summarizePolicy } = useGovernanceApi();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('IDLE'); // IDLE, ANALYZING, SUCCESS, ERROR
  const [aiResult, setAiResult] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('IDLE');
      setAiResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setStatus('ANALYZING');
    
    const result = await summarizePolicy(file);
    if (result) {
      setAiResult(result);
      setStatus('SUCCESS');
    } else {
      setStatus('ERROR');
    }
  };

  const handleCopy = () => {
    if (aiResult) {
      navigator.clipboard.writeText(JSON.stringify(aiResult, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="h-5 w-5 text-blue-600 mr-2" />
          ESGenius AI Policy Analysis
        </h2>
        <p className="text-sm text-gray-500 mt-1">Upload a PDF policy to automatically generate summaries, extract risks, and build compliance checklists.</p>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        
        {/* UPLOAD STATE */}
        {status === 'IDLE' && (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-6 transition-colors hover:bg-gray-100">
            <UploadCloud className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">Upload Policy PDF</h3>
            <p className="text-xs text-gray-500 mb-4 text-center">Drag and drop or click to browse</p>
            
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            {!file ? (
              <button 
                onClick={() => fileInputRef.current.click()}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                Select File
              </button>
            ) : (
              <div className="flex flex-col items-center w-full">
                <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-2 rounded-md mb-4 text-sm w-full max-w-xs truncate">
                  <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>
                <button 
                  onClick={handleAnalyze}
                  className="w-full max-w-xs flex items-center justify-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  Analyze with ESGenius AI <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ANALYZING STATE */}
        {status === 'ANALYZING' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
            <h3 className="text-base font-medium text-gray-900">ESGenius AI is analyzing...</h3>
            <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">Scanning document for compliance rules, risk factors, and policy summaries.</p>
          </div>
        )}

        {/* ERROR STATE */}
        {status === 'ERROR' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
            <h3 className="text-base font-medium text-gray-900">Analysis Failed</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4 text-center">Unable to process the PDF. Please ensure the backend API is running.</p>
            <button 
              onClick={() => setStatus('IDLE')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Try Again
            </button>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === 'SUCCESS' && aiResult && (
          <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              
              {/* Summary */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2" /> Executive Summary
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">{aiResult.summary}</p>
              </div>

              {/* Risks */}
              <div className="bg-red-50/50 border border-red-100 rounded-lg p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-800 mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" /> Top Risks
                </h4>
                <ul className="list-disc pl-5 space-y-1">
                  {aiResult.top_risks?.map((risk, idx) => (
                    <li key={idx} className="text-sm text-gray-700">{risk}</li>
                  ))}
                </ul>
              </div>

              {/* Checklist */}
              <div className="bg-green-50/50 border border-green-100 rounded-lg p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-green-800 mb-2 flex items-center">
                  <ListChecks className="h-4 w-4 mr-2" /> Compliance Checklist
                </h4>
                <ul className="space-y-2">
                  {aiResult.checklist?.map((item, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-700">
                      <div className="h-5 w-5 rounded border border-gray-300 bg-white mr-2 mt-0.5 flex-shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-200 flex space-x-3">
              <button 
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                {copySuccess ? <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> : <Copy className="h-4 w-4 mr-2" />}
                {copySuccess ? 'Copied!' : 'Copy Data'}
              </button>
              <button 
                onClick={() => setStatus('IDLE')}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Save Policy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyUpload;
