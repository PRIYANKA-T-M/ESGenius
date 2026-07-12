import { useState, useRef, useCallback } from 'react'
import { uploadInvoice } from '../services/environmentApi'

const ACCEPTED     = ['image/png', 'image/jpeg', 'application/pdf']
const FILE_TYPES   = ['PNG', 'JPEG', 'PDF']

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function InvoiceUploader({ onSuccess }) {
  const [dragging,  setDragging]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState(null)
  const [error,     setError]     = useState(null)
  const inputRef = useRef()

  // Single entry point — called by both drop and browse
  const processFile = useCallback(async (f) => {
    if (!f) return
    if (!ACCEPTED.includes(f.type)) {
      setError('Unsupported file type. Please upload PNG, JPEG, or PDF.')
      return
    }
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const { data } = await uploadInvoice(f)
      setResult(data)
      onSuccess()                    // refresh dashboard + transactions + goals
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
      // reset input so the same file can be re-uploaded if needed
      if (inputRef.current) inputRef.current.value = ''
    }
  }, [onSuccess])

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files[0])
  }

  function reset() { setResult(null); setError(null) }

  return (
    <div className="uploader-wrapper">

      {/* File type chips */}
      <div className="file-type-chips">
        {FILE_TYPES.map(t => <span key={t} className="file-chip">{t}</span>)}
      </div>

      {/* Drop zone — always visible unless showing result */}
      {!result && (
        <div
          className={`drop-zone ${dragging ? 'drop-zone--active' : ''} ${loading ? 'drop-zone--loading' : ''}`}
          onClick={() => !loading && inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); if (!loading) setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={loading ? undefined : onDrop}
          role="button"
          tabIndex={0}
          aria-disabled={loading}
          onKeyDown={(e) => e.key === 'Enter' && !loading && inputRef.current.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            style={{ display: 'none' }}
            onChange={(e) => processFile(e.target.files[0])}
          />

          {loading ? (
            <>
              <div className="drop-spinner">
                <div className="spinner spinner--green" />
              </div>
              <p className="drop-title" style={{ marginTop: 12 }}>Analyzing invoice with Gemini...</p>
              <p className="drop-sub">This may take a few seconds</p>
            </>
          ) : (
            <>
              <div className="drop-icon">☁️</div>
              <p className="drop-title">Drag &amp; drop your invoice here</p>
              <p className="drop-sub">or click to browse files</p>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert--error" style={{ marginTop: 12 }}>
          ⚠️ {error}
          <button className="alert-dismiss" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Success result */}
      {result && (
        <div className="ai-result ai-result--animate">
          <div className="ai-result__header">
            <span className="ai-result__icon">✅</span>
            <strong>Invoice Processed Successfully</strong>
          </div>

          <div className="ai-result__grid">
            <div className="ai-result__item">
              <span className="ai-result__label">Department</span>
              <span className="ai-result__val">{result.extracted_data.department}</span>
            </div>
            <div className="ai-result__item">
              <span className="ai-result__label">Activity Type</span>
              <span className="ai-result__val">{result.extracted_data.activity_type}</span>
            </div>
            <div className="ai-result__item">
              <span className="ai-result__label">Quantity</span>
              <span className="ai-result__val">
                {result.extracted_data.quantity} {result.extracted_data.unit}
              </span>
            </div>
            <div className="ai-result__item">
              <span className="ai-result__label">Carbon Emission</span>
              <span className="ai-result__val co2-highlight">
                {result.transaction.carbon_emission} kg CO₂
              </span>
            </div>
            <div className="ai-result__item">
              <span className="ai-result__label">Recorded At</span>
              <span className="ai-result__val">{formatDate(result.transaction.created_at)}</span>
            </div>
            <div className="ai-result__item">
              <span className="ai-result__label">Transaction ID</span>
              <span className="ai-result__val">#{result.transaction.id}</span>
            </div>
          </div>

          <div className="ai-result__summary">
            <span>📊 Dashboard updated</span>
            <span>⚡ {result.dashboard_summary.total_transactions} total transactions</span>
            <span>🌿 {result.dashboard_summary.total_emissions.toFixed(2)} kg total CO₂</span>
          </div>

          <button className="btn-reset" onClick={reset}>Upload Another Invoice</button>
        </div>
      )}
    </div>
  )
}
