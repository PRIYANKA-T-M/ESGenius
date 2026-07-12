import React from 'react';
import { Lock, Check } from 'lucide-react';

/**
 * Reusable BadgeCard displaying credentials for system achievement badges.
 * Dynamically adjusts styling: unlocked badges display with colored glows,
 * while locked ones appear in grayscale with unlock progress indicators.
 */
export default function BadgeCard({ badge, currentXp = 0, isUnlocked = false }) {
  return (
    <div 
      className={`glass-card badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '1.5rem',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
        border: isUnlocked ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-glass)',
        background: isUnlocked ? 'rgba(16, 185, 129, 0.03)' : 'rgba(255, 255, 255, 0.01)',
        boxShadow: isUnlocked ? '0 8px 30px rgba(16, 185, 129, 0.06)' : 'none',
        filter: isUnlocked ? 'none' : 'grayscale(0.7) opacity(0.85)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Icon frame */}
      <div 
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: isUnlocked 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))' 
            : 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.2rem',
          marginBottom: '1rem',
          border: isUnlocked ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
          boxShadow: isUnlocked ? '0 0 16px rgba(16, 185, 129, 0.3)' : 'none',
          position: 'relative',
        }}
      >
        {badge.icon_url || '🏅'}
        
        {/* Unlocked / Locked mini pill */}
        <div 
          style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: isUnlocked ? 'var(--success)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--bg-secondary)',
          }}
        >
          {isUnlocked ? (
            <Check size={12} color="#0b0f19" strokeWidth={3} />
          ) : (
            <Lock size={10} color="#fff" />
          )}
        </div>
      </div>

      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '700' }}>
        {badge.name}
      </h3>
      
      <p style={{ 
        fontSize: '0.82rem', 
        color: 'var(--text-secondary)', 
        lineHeight: '1.4',
        marginBottom: '1rem',
        flex: 1
      }}>
        {badge.description}
      </p>

      {/* Target Progress Bar */}
      <div style={{ width: '100%', marginTop: 'auto' }}>
        <div style={{ 
          fontSize: '0.75rem', 
          fontWeight: '700', 
          color: isUnlocked ? 'var(--primary)' : 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.25rem'
        }}>
          <span>Req: {badge.xp_required} XP</span>
          <span>{isUnlocked ? 'Unlocked' : `${currentXp}/${badge.xp_required}`}</span>
        </div>
        
        {!isUnlocked && (
          <div className="progress-bar-bg" style={{ height: '4px' }}>
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${Math.min(100, Math.max(0, (currentXp / badge.xp_required) * 100))}%`,
                background: 'var(--text-muted)'
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
