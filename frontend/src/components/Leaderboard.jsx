import React from 'react';
import { Trophy, Medal, Award, Flame } from 'lucide-react';

/**
 * Reusable Leaderboard component showing ranked employees, highlighting top performers,
 * and identifying the active logged-in employee context.
 */
export default function Leaderboard({ users = [], currentUserEmail = '' }) {
  // Order rankings by XP score descending
  const sortedUsers = [...users].sort((a, b) => b.xp - a.xp);

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy className="rank-trophy text-gold animate-bounce" style={{ color: '#fbbf24' }} size={20} />;
      case 1:
        return <Medal className="rank-trophy text-silver" style={{ color: '#cbd5e1' }} size={20} />;
      case 2:
        return <Award className="rank-trophy text-bronze" style={{ color: '#b45309' }} size={20} />;
      default:
        return <span className="rank-number" style={{ color: '#64748b', fontWeight: 'bold' }}>{index + 1}</span>;
    }
  };

  return (
    <div className="glass-panel leaderboard-container animate-fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Flame className="text-secondary" style={{ color: '#06b6d4' }} size={22} />
        <h2 style={{ fontSize: '1.4rem', letterSpacing: '-0.02em' }}>Leaderboard</h2>
      </div>

      <div className="leaderboard-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {sortedUsers.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0', fontSize: '0.9rem' }}>
            No rankings tracked yet.
          </p>
        ) : (
          sortedUsers.map((user, index) => {
            const isSelf = user.email === currentUserEmail;
            return (
              <div
                key={user.id}
                className={`leaderboard-item ${isSelf ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  background: isSelf ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSelf ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-glass)',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelf ? '0 0 12px rgba(16, 185, 129, 0.1)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '28px', display: 'flex', justifyContent: 'center' }}>
                    {getRankIcon(index)}
                  </div>
                  <div>
                    <span style={{ 
                      fontWeight: isSelf ? '700' : '500', 
                      color: isSelf ? 'var(--primary)' : 'var(--text-primary)',
                      fontSize: '0.95rem'
                    }}>
                      {user.name}
                    </span>
                    {isSelf && (
                      <span style={{
                        fontSize: '0.75rem',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: 'var(--primary)',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        marginLeft: '0.5rem',
                        fontWeight: '600'
                      }}>
                        You
                      </span>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ 
                    fontWeight: '700', 
                    fontSize: '1rem', 
                    color: isSelf ? 'var(--primary)' : 'var(--text-primary)' 
                  }}>
                    {user.xp}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>XP</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
