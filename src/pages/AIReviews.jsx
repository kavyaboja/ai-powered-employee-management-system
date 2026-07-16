import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Award, 
  Calendar, 
  Trash2, 
  Eye, 
  X, 
  User, 
  Sparkles,
  Search,
  BookOpen
} from 'lucide-react';

export default function AIReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search/Filter
  const [search, setSearch] = useState('');

  // Modals
  const [selectedReview, setSelectedReview] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      setLoading(true);
      const data = await api.ai.getReviews();
      setReviews(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch appraisal archives.');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Avoid triggering card click
    if (window.confirm('Are you sure you want to permanently delete this performance review record?')) {
      try {
        await api.ai.deleteReview(id);
        loadReviews();
      } catch (err) {
        alert('Failed to remove review record.');
      }
    }
  };

  const handleOpenReview = (rev) => {
    setSelectedReview(rev);
    setShowViewModal(true);
  };

  const filteredReviews = reviews.filter(rev => 
    rev.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    rev.employeeRole.toLowerCase().includes(search.toLowerCase()) ||
    rev.employeeDepartment.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title">AI Performance Review Archive</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>View, study and audit previously compiled AI personnel evaluations.</p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div style={styles.toolbar} className="glass-panel">
        <div style={styles.searchContainer}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Filter reviews by employee name, role or department..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {loading && reviews.length === 0 ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Decrypting review archives...</p>
        </div>
      ) : error ? (
        <div style={styles.emptyContainer} className="glass-panel">
          <p>{error}</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div style={styles.emptyContainer} className="glass-panel">
          <Award size={48} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
          <p>No appraisal archives found. Navigate to the Employees page and trigger an appraisal review first!</p>
        </div>
      ) : (
        /* Reviews Grid */
        <div style={styles.reviewsGrid}>
          {filteredReviews.map(rev => (
            <div 
              key={rev.id} 
              className="glass-card" 
              style={styles.reviewCard}
              onClick={() => handleOpenReview(rev)}
            >
              <div style={styles.cardHeader}>
                <div style={styles.dateBlock}>
                  <Calendar size={13} color="var(--text-secondary)" />
                  <span>{rev.reviewDate}</span>
                </div>
                <button 
                  onClick={(e) => handleDelete(rev.id, e)} 
                  className="btn-icon"
                  style={styles.deleteBtn}
                  title="Delete Record"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div style={styles.employeeBlock}>
                <h3 style={styles.employeeName}>{rev.employeeName}</h3>
                <p style={styles.employeeRole}>{rev.employeeRole}</p>
                <span style={styles.deptBadge}>{rev.employeeDepartment}</span>
              </div>

              <div style={styles.scoreBlock}>
                <span>Appraisal Rating: </span>
                <strong style={{ color: 'var(--color-primary)' }}>{rev.overallRating.toFixed(1)} / 5.0</strong>
              </div>

              <button 
                className="btn-secondary"
                style={styles.viewButton}
              >
                <Eye size={14} />
                <span>View Full Review</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Review Details Reader Modal */}
      {showViewModal && selectedReview && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div 
            className="modal-content glass-panel pulse-border" 
            style={{ maxWidth: '750px' }}
            onClick={(e) => e.stopPropagation()} // Stop closing on content click
          >
            <X className="modal-close" onClick={() => setShowViewModal(false)} />
            
            <div style={styles.modalMetaHeader}>
              <Award size={24} color="var(--color-primary)" style={{ filter: 'drop-shadow(0 0 6px var(--color-primary))' }} />
              <div>
                <h2>Personnel Performance Appraisal Report</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  Generated on {selectedReview.reviewDate}
                </p>
              </div>
            </div>

            <div style={styles.modalEmployeeBox} className="glass-card">
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedReview.employeeName}</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedReview.employeeRole}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned Score: </span>
                <h3 style={{ color: 'var(--color-primary)', fontSize: '1.25rem', fontWeight: '700' }}>{selectedReview.overallRating.toFixed(1)} / 5.0</h3>
              </div>
            </div>

            <div style={styles.reviewMarkdown}>
              {selectedReview.content.split('\n').map((line, idx) => {
                if (line.startsWith('# ')) {
                  return <h1 key={idx} style={{ fontSize: '1.4rem', margin: '1rem 0 0.5rem 0', color: 'var(--color-primary)' }}>{line.replace('# ', '')}</h1>;
                }
                if (line.startsWith('## ')) {
                  return <h2 key={idx} style={{ fontSize: '1.2rem', margin: '1.25rem 0 0.65rem 0', color: 'var(--color-secondary)' }}>{line.replace('## ', '')}</h2>;
                }
                if (line.startsWith('### ')) {
                  return <h3 key={idx} style={{ fontSize: '1.05rem', margin: '1rem 0 0.5rem 0' }}>{line.replace('### ', '')}</h3>;
                }
                if (line.startsWith('* ') || line.startsWith('- ')) {
                  return <li key={idx} style={{ marginLeft: '1.25rem', fontSize: '0.9rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>{line.replace(/^[\*\-]\s+/, '')}</li>;
                }
                if (line.trim().length === 0) return <br key={idx} />;
                return <p key={idx} style={{ fontSize: '0.9rem', lineHeight: '1.55', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{line}</p>;
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button 
                onClick={() => setShowViewModal(false)}
                className="btn-primary"
              >
                Close Appraisal Reader
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  toolbar: {
    display: 'flex',
    padding: '1rem',
    marginBottom: '2rem'
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '0 0.85rem',
    flex: 1
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    padding: '0.75rem 0',
    width: '100%',
    fontSize: '0.95rem'
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
    gap: '1rem',
    color: 'var(--text-secondary)',
    textAlign: 'center'
  },
  reviewsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  reviewCard: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '230px',
    cursor: 'pointer'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  dateBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)'
  },
  deleteBtn: {
    padding: '0.25rem',
    color: 'var(--text-muted)',
    borderColor: 'transparent',
    background: 'transparent',
    '&:hover': {
      color: 'var(--priority-high)',
      borderColor: 'rgba(239, 68, 68, 0.15)'
    }
  },
  employeeBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.25rem',
    marginBottom: '1.25rem',
    flex: 1
  },
  employeeName: {
    fontSize: '1.05rem',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  employeeRole: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)'
  },
  deptBadge: {
    fontSize: '0.7rem',
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-color)',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
    color: 'var(--text-muted)',
    marginTop: '0.25rem'
  },
  scoreBlock: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '0.75rem',
    marginBottom: '1rem'
  },
  viewButton: {
    width: '100%',
    justifyContent: 'center',
    fontSize: '0.8rem',
    padding: '0.5rem'
  },
  modalMetaHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.85rem'
  },
  modalEmployeeBox: {
    padding: '1rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    backgroundColor: 'rgba(255,255,255,0.015)'
  },
  reviewMarkdown: {
    maxHeight: '380px',
    overflowY: 'auto',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: '1.5rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    fontFamily: 'inherit'
  }
};
