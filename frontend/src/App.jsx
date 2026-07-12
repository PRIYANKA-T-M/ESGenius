import React from 'react'
import Social from './pages/Social.jsx'
import { Leaf, Users2, Shield, LayoutDashboard, Globe } from 'lucide-react'

/**
 * Main application wrapper. Includes the sidebar navigation layout 
 * and imports the standalone Social & Gamification module dashboard.
 */
export default function App() {
  return (
    <div className="app-container">
      {/* Shared Module Nav Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)' }}>
          <Globe className="text-primary" style={{ color: 'var(--primary)' }} size={28} />
          <div>
            <h1 style={{ fontSize: '1.35rem', letterSpacing: '-0.03em', fontWeight: 'bold' }}>EcoSphere</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>ESG Management</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, marginTop: '1.5rem' }}>
          {/* Dashboard Module - Non-functional placeholder */}
          <div className="nav-item disabled" style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px',
            color: 'var(--text-muted)', cursor: 'not-allowed', fontSize: '0.95rem'
          }}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
            <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.3rem', borderRadius: '4px', marginLeft: 'auto' }}>Locked</span>
          </div>
          
          {/* Environmental Module - Non-functional placeholder */}
          <div className="nav-item disabled" style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px',
            color: 'var(--text-muted)', cursor: 'not-allowed', fontSize: '0.95rem'
          }}>
            <Leaf size={18} />
            <span>Environmental</span>
            <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.3rem', borderRadius: '4px', marginLeft: 'auto' }}>Locked</span>
          </div>

          {/* Social Module (Active Context) */}
          <div className="nav-item active" style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px',
            color: 'var(--text-primary)', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)',
            fontSize: '0.95rem', fontWeight: '600'
          }}>
            <Users2 size={18} style={{ color: 'var(--primary)' }} />
            <span>Social & Gamification</span>
          </div>

          {/* Governance Module - Non-functional placeholder */}
          <div className="nav-item disabled" style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px',
            color: 'var(--text-muted)', cursor: 'not-allowed', fontSize: '0.95rem'
          }}>
            <Shield size={18} />
            <span>Governance</span>
            <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.3rem', borderRadius: '4px', marginLeft: 'auto' }}>Locked</span>
          </div>
        </nav>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
          Hackathon Build v1.0.0
        </div>
      </aside>

      {/* Main Panel Content Frame */}
      <main className="main-content">
        <Social />
      </main>
    </div>
  )
}
