import { useState, useRef } from 'react'
import { uploadInvoice } from '../services/environmentApi'

export default function InvoiceUploader({ onSuccess }) {
  const [file, setFile]         = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)
  const [error, setError]       = useState(null)
  const inputRef                = useRef()

  const ACCEPTED = ['image/png', 'image/jpeg', 'application/pdf']

  function pickFile(f) {
    if (!f) return
    if (!ACCEPTED.includes(f.type)) {
      setError('Unsupported file type. Please upload PNG, JPEG, or PDF.')
      return
    }
    setFile(f)
    setResult(null)
    setError(null)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    pickFile(e.dataTransfer.files[0])
  }

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const { data } = await uploadInvoice(file)
      setResult(data)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="uploader-wrapper">
      {/* Drop zone */}
      <div
        className={`drop-zone ${dragging ? 'drop-zone--active' : ''} ${file ? 'drop-zone--ready' : ''}`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          style={{ display: 'none' }}
          onChange={(e) => pickFile(e.target.files[0])}
        />
        <div className="drop-icon">
          {file ? '📄' : '☁️'}
        </div>
        {file ? (
          <p className="drop-filename">{file.name}</p>
        ) : (
          <>
            <p className="drop-title">Drop your invoice here</p>
            <p className="drop-sub">PNG · JPEG · PDF</p>
          </>
        )}
      </div>

      {/* Upload button */}
      {file && !result && (
        <button
          className="btn-upload"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? <span className="spinner-sm" /> : '✨ Process with EcoPilot AI'}
        </button>
      )}

      {/* Error */}
      {error && <div className="alert alert--error">{error}</div>}

      {/* Success result */}
      {result && (
        <div className="ai-result">
          <div className="ai-result__header">
            <span className="ai-result__icon">✅</span>
            <strong>{result.message}</strong>
          </div>
          <div className="ai-result__grid">
            <div className="ai-result__item">
              <span className="ai-result__label">Department</span>
              <span className="ai-result__val">{result.extracted_data.department}</span>
            </div>
            <div className="ai-result__item">
              <span className="ai-result__label">Activity</span>
              <span className="ai-result__val">{result.extracted_data.activity_type}</span>
            </div>
            <div className="ai-result__item">
              <span className="ai-result__label">Quantity</span>
              <span className="ai-result__val">{result.extracted_data.quantity} {result.extracted_data.unit}</span>
            </div>
            <div className="ai-result__item">
              <span className="ai-result__label">CO₂ Emitted</span>
              <span className="ai-result__val co2-highlight">{result.transaction.carbon_emission} kg</span>
            </div>
          </div>
          <button className="btn-reset" onClick={() => { setFile(null); setResult(null) }}>
            Upload Another
          </button>
        </div>
      )}
    </div>
  )
}
