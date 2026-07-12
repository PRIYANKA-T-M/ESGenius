import { useState, useEffect, useRef } from 'react'
import { createGoal } from '../services/environmentApi'

const EMPTY = { department_id: '', target: '', current: '', deadline: '' }

export default function GoalModal({ departments, onClose, onCreated }) {
  const [form,       setForm]       = useState(EMPTY)
  const [errors,     setErrors]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError,   setApiError]   = useState(null)
  const firstRef = useRef()

  // focus first field and lock body scroll when modal opens
  useEffect(() => {
    firstRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: null }))
    setApiError(null)
  }

  function validate() {
    const e = {}
    if (!form.department_id)              e.department_id = 'Department is required.'
    if (!form.target || +form.target <= 0) e.target       = 'Target must be greater than 0.'
    if (form.current === '' || +form.current < 0) e.current = 'Current progress must be 0 or more.'
    if (!form.deadline)                   e.deadline      = 'Deadline is required.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    if (submitting) return                          // prevent duplicate submit

    setSubmitting(true)
    setApiError(null)
    try {
      await createGoal({
        department_id: Number(form.department_id),
        target:        Number(form.target),
        current:       Number(form.current),
        deadline:      new Date(form.deadline).toISOString(),
      })
      onCreated()   // triggers toast + refresh in parent
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Failed to create goal. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">

        {/* Header */}
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            <span>🎯</span> Add Environmental Goal
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* API error */}
        {apiError && (
          <div className="alert alert--error" style={{ margin: '0 0 16px' }}>
            ⚠️ {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Department */}
          <div className="form-group">
            <label className="form-label" htmlFor="goal-dept">Department *</label>
            <select
              id="goal-dept"
              ref={firstRef}
              className={`form-select ${errors.department_id ? 'form-input--error' : ''}`}
              value={form.department_id}
              onChange={e => set('department_id', e.target.value)}
            >
              <option value="">Select a department…</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {errors.department_id && <p className="form-error">{errors.department_id}</p>}
          </div>

          {/* Target + Current — side by side */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="goal-target">Target (kg CO₂) *</label>
              <input
                id="goal-target"
                type="number"
                min="0.01"
                step="any"
                className={`form-input ${errors.target ? 'form-input--error' : ''}`}
                placeholder="e.g. 500"
                value={form.target}
                onChange={e => set('target', e.target.value)}
              />
              {errors.target && <p className="form-error">{errors.target}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="goal-current">Current Progress (kg CO₂)</label>
              <input
                id="goal-current"
                type="number"
                min="0"
                step="any"
                className={`form-input ${errors.current ? 'form-input--error' : ''}`}
                placeholder="e.g. 0"
                value={form.current}
                onChange={e => set('current', e.target.value)}
              />
              {errors.current && <p className="form-error">{errors.current}</p>}
            </div>
          </div>

          {/* Deadline */}
          <div className="form-group">
            <label className="form-label" htmlFor="goal-deadline">Deadline *</label>
            <input
              id="goal-deadline"
              type="date"
              className={`form-input ${errors.deadline ? 'form-input--error' : ''}`}
              min={new Date().toISOString().split('T')[0]}
              value={form.deadline}
              onChange={e => set('deadline', e.target.value)}
            />
            {errors.deadline && <p className="form-error">{errors.deadline}</p>}
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting
                ? <><span className="spinner-sm spinner-sm--dark" /> Creating…</>
                : '+ Create Goal'
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
