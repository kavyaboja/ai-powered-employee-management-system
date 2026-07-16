import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Award, 
  FileText, 
  Sparkles 
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'tasks', label: 'Tasks Board', icon: CheckSquare },
    { id: 'ai-reviews', label: 'AI Reviews', icon: Award },
    { id: 'resume-scanner', label: 'Resume Parser', icon: FileText }
  ];

  return (
    <aside style={styles.sidebar} className="glass-panel">
      <div style={styles.logoContainer}>
        <Sparkles size={24} color="#00f2fe" style={styles.logoIcon} />
        <span style={styles.logoText}>Empower<span style={{ color: '#9d4edd' }}>AI</span></span>
      </div>
      
      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {})
              }}
              className={isActive ? 'active-nav-item' : ''}
            >
              <Icon size={20} color={isActive ? '#00f2fe' : '#94a3b8'} />
              <span>{item.label}</span>
              {isActive && <div style={styles.activeIndicator} />}
            </button>
          );
        })}
      </nav>

      <div style={styles.footer}>
        <div style={styles.systemStatus}>
          <div style={styles.pulseDot} />
          <span>Gemini Core Active</span>
        </div>
        <p style={styles.version}>v1.1.0 (Local SQLite)</p>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    height: '100%',
    width: '260px',
    backgroundColor: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    padding: '2rem 1.5rem',
    borderRadius: '0', // Full height sidebar
    boxShadow: 'none',
    zIndex: 10
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '3rem',
    paddingLeft: '0.5rem'
  },
  logoIcon: {
    filter: 'drop-shadow(0 0 8px rgba(0, 242, 254, 0.6))'
  },
  logoText: {
    fontSize: '1.4rem',
    fontWeight: '800',
    letterSpacing: '-0.03em',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-heading)'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.85rem 1rem',
    background: 'none',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    fontWeight: '500',
    textAlign: 'left',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all var(--transition-fast)'
  },
  navItemActive: {
    color: 'var(--text-primary)',
    background: 'rgba(255, 255, 255, 0.03)',
    boxShadow: 'inset 0 0 0 1px rgba(0, 242, 254, 0.15)'
  },
  activeIndicator: {
    position: 'absolute',
    left: '0',
    top: '25%',
    height: '50%',
    width: '3px',
    backgroundColor: 'var(--color-primary)',
    borderRadius: '0 4px 4px 0',
    boxShadow: '0 0 10px var(--color-primary)'
  },
  footer: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    paddingLeft: '0.5rem'
  },
  systemStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)'
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    boxShadow: '0 0 8px #10b981',
    animation: 'pulse 2s infinite'
  },
  version: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  }
};
