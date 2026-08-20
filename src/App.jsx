//  TrackFlow – Bug Report Form
//  Validation, submission lifecycle, and error handling are intentionally explicit.
//  Do NOT modify api.js or index.css.
// ============================================================

import { useState } from 'react'
import { submitBugReport } from './api'

const SEVERITIES = ['Critical', 'High', 'Medium', 'Low']
const COMPONENTS = ['Authentication', 'Dashboard', 'Billing', 'API', 'Notifications', 'Settings']
const EMPTY_FORM = {
  title: '',
  severity: '',
  component: '',
  description: '',
  steps: '',
  stepsCount: '',
}

const validate = (data) => {
  const errs = {}

  if (!data.title.trim()) errs.title = 'Bug title is required.'
  if (!data.severity) errs.severity = 'Please select a severity level.'
  if (!data.component) errs.component = 'Please select an affected component.'
  if (!data.description.trim()) errs.description = 'A description is required.'

  if (!data.stepsCount.trim()) {
    errs.stepsCount = 'Number of steps is required.'
  } else if (!Number.isInteger(Number(data.stepsCount)) || Number(data.stepsCount) < 1) {
    errs.stepsCount = 'Enter a positive whole number of steps.'
  }

  return errs
}

export default function App() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(null)

  const [submitted, setSubmitted] = useState([])
  const [successId, setSuccessId] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((current) => {
      const { [name]: _clearedError, ...remaining } = current
      return remaining
    })
    setServerError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return

    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      setServerError(null)
      return
    }

    setErrors({})
    setServerError(null)
    setSuccessId(null)
    setLoading(true)

    try {
      const result = await submitBugReport(form)
      setSuccessId(result.id)
      setSubmitted((prev) => [result, ...prev])
      setForm(EMPTY_FORM)
    } catch (err) {
      if (err.field) {
        setErrors({ [err.field]: err.message })
      } else {
        setServerError(err.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const sevClass = (s) =>
    ({ Critical: 'sev-critical', High: 'sev-high', Medium: 'sev-medium', Low: 'sev-low' }[s] ?? '')

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="badge">⬡ TrackFlow Internal Tools</div>
        <h1>Report a Bug</h1>
        <p>
          You're on the <strong>QA Engineering</strong> team at <strong>TrackFlow Inc.</strong> The
          team uses this form to log bugs before sprint planning every Monday. Help your teammates
          by making sure the form works correctly.
        </p>
      </header>

      <div className="card">
        <p className="section-label">New Bug Report</p>
        <form onSubmit={handleSubmit} noValidate>

          {/* SUCCESS BANNER — shown after a successful submit */}
          {successId && (
            <div style={{ background: 'rgba(76,175,125,0.1)', border: '1px solid rgba(76,175,125,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#4caf7d' }}>
              ✓ Bug <strong>{successId}</strong> filed successfully!
            </div>
          )}

          {/* SERVER ERROR BANNER — shown for general API failures */}
          {serverError && (
            <div style={{ background: 'rgba(247,95,95,0.1)', border: '1px solid rgba(247,95,95,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#f75f5f' }}>
              {serverError}
            </div>
          )}

          <div className="form-group">
            <label>Bug Title <span className="req">*</span></label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              aria-invalid={Boolean(errors.title)}
              style={errors.title ? { borderColor: 'var(--danger)' } : {}}
              placeholder="e.g. Checkout button unresponsive on mobile Safari"
            />
            {errors.title && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Severity <span className="req">*</span></label>
              <select
                name="severity"
                value={form.severity}
                onChange={handleChange}
                aria-invalid={Boolean(errors.severity)}
                style={errors.severity ? { borderColor: 'var(--danger)' } : {}}
              >
                <option value="">— Select —</option>
                {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
              </select>
              {errors.severity && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.severity}</span>}
            </div>
            <div className="form-group">
              <label>Affected Component <span className="req">*</span></label>
              <select
                name="component"
                value={form.component}
                onChange={handleChange}
                aria-invalid={Boolean(errors.component)}
                style={errors.component ? { borderColor: 'var(--danger)' } : {}}
              >
                <option value="">— Select —</option>
                {COMPONENTS.map((c) => <option key={c}>{c}</option>)}
              </select>
              {errors.component && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.component}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Description <span className="req">*</span></label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              aria-invalid={Boolean(errors.description)}
              style={errors.description ? { borderColor: 'var(--danger)' } : {}}
              placeholder="Describe what's happening and what the expected behaviour should be…"
            />
            {errors.description && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.description}</span>}
          </div>

          <hr className="divider" />

          <div className="form-row">
            <div className="form-group">
              <label>Steps to Reproduce</label>
              <textarea
                name="steps"
                value={form.steps}
                onChange={handleChange}
                style={{ minHeight: 72 }}
                placeholder="1. Go to…&#10;2. Click…&#10;3. Observe…"
              />
            </div>
            <div className="form-group">
              <label>No. of Steps <span className="req">*</span></label>
              <input
                type="number"
                name="stepsCount"
                value={form.stepsCount}
                onChange={handleChange}
                aria-invalid={Boolean(errors.stepsCount)}
                style={errors.stepsCount ? { borderColor: 'var(--danger)' } : {}}
                placeholder="e.g. 3"
              />
              {errors.stepsCount && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.stepsCount}</span>}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit Bug Report'}
          </button>

        </form>
      </div>

      {/* Filed bugs list */}
      {submitted.length > 0 && (
        <div className="submitted-list">
          <p className="section-label" style={{ marginBottom: 8 }}>Filed This Session</p>
          {submitted.map((bug, i) => (
            <div key={i} className="submitted-item">
              <div>
                <div className="title">{bug.title}</div>
                <div className="meta">{bug.component} · {bug.stepsCount} steps</div>
              </div>
              <span className={`severity-badge ${sevClass(bug.severity)}`}>{bug.severity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
