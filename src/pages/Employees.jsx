import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Plus, 
  Search, 
  Briefcase, 
  Trash2, 
  Edit3, 
  Award, 
  X, 
  User, 
  Sparkles,
  DollarSign,
  Tag,
  Star
} from 'lucide-react';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: 'Engineering',
    salary: '',
    skills: '',
    rating: '3.0'
  });

  // AI Review Form State
  const [reviewForm, setReviewForm] = useState({
    achievements: '',
    improvement: ''
  });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [generatedReview, setGeneratedReview] = useState(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);
      const data = await api.employees.getAll();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch employees. Please verify database availability.');
    } finally {
      setLoading(false);
    }
  }

  // Handle CRUD submissions
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await api.employees.update(editingEmployee.id, formData);
      } else {
        await api.employees.create(formData);
      }
      setShowFormModal(false);
      resetForm();
      loadEmployees();
    } catch (err) {
      alert(err.message || 'An error occurred while saving employee record.');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      salary: employee.salary,
      skills: employee.skills,
      rating: employee.rating
    });
    setShowFormModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this employee? This will delete all associated task records.')) {
      try {
        await api.employees.delete(id);
        loadEmployees();
      } catch (err) {
        alert(err.message || 'Failed to delete employee.');
      }
    }
  };

  const resetForm = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      email: '',
      role: '',
      department: 'Engineering',
      salary: '',
      skills: '',
      rating: '3.0'
    });
  };

  // AI Review submission
  const handleAIReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      setReviewLoading(true);
      setGeneratedReview(null);
      const result = await api.ai.generateReview(
        selectedEmployee.id,
        reviewForm.achievements,
        reviewForm.improvement
      );
      setGeneratedReview(result);
      loadEmployees(); // Reload to pick up updated rating
    } catch (err) {
      alert(err.message || 'Failed to trigger performance review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const openReviewModal = (emp) => {
    setSelectedEmployee(emp);
    setReviewForm({ achievements: '', improvement: '' });
    setGeneratedReview(null);
    setShowReviewModal(true);
  };

  // Filtering Logic
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) || 
                          emp.role.toLowerCase().includes(search.toLowerCase()) ||
                          emp.skills.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === '' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const uniqueDepts = Array.from(new Set(employees.map(e => e.department)));

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title">Workforce Directory</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Track organizational roles, technical competencies, and appraisals.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowFormModal(true); }}
          className="btn-primary"
        >
          <Plus size={18} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div style={styles.toolbar} className="glass-panel">
        <div style={styles.searchContainer}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search by name, role, skills..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <select 
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          style={styles.selectFilter}
        >
          <option value="">All Departments</option>
          {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading && employees.length === 0 ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading workforce registry...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div style={styles.emptyContainer} className="glass-panel">
          <User size={48} color="var(--text-muted)" />
          <p>No matching employee profiles found.</p>
        </div>
      ) : (
        /* Grid Layout */
        <div style={styles.employeeGrid}>
          {filteredEmployees.map(emp => (
            <div key={emp.id} className="glass-card" style={styles.empCard}>
              <div style={styles.cardHeader}>
                <div style={styles.avatar}>
                  {emp.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={styles.headerInfo}>
                  <h3 style={styles.name}>{emp.name}</h3>
                  <p style={styles.role}>{emp.role}</p>
                </div>
              </div>

              <div style={styles.cardDetails}>
                <div style={styles.detailRow}>
                  <Briefcase size={15} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.85rem' }}>{emp.department}</span>
                </div>
                <div style={styles.detailRow}>
                  <DollarSign size={15} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.85rem' }}>${emp.salary.toLocaleString()} / yr</span>
                </div>
                <div style={styles.detailRow}>
                  <Star size={15} color="#fbbf24" fill="#fbbf24" />
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{emp.rating.toFixed(1)} / 5.0</span>
                </div>
              </div>

              {/* Skills Tags */}
              <div style={styles.skillsContainer}>
                {emp.skills.split(',').filter(Boolean).map(skill => (
                  <span key={skill} style={styles.skillTag}>{skill.trim()}</span>
                ))}
              </div>

              {/* Card Footer Actions */}
              <div style={styles.cardActions}>
                <button 
                  onClick={() => openReviewModal(emp)} 
                  style={styles.reviewBtn}
                  className="btn-secondary"
                  title="Generate AI Performance Review"
                >
                  <Award size={16} color="var(--color-primary)" />
                  <span>AI Review</span>
                </button>
                <div style={styles.actionGroup}>
                  <button 
                    onClick={() => handleEdit(emp)} 
                    className="btn-icon" 
                    title="Edit Record"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button 
                    onClick={() => handleDelete(emp)} 
                    className="btn-icon" 
                    title="Delete Record"
                    style={{ color: 'var(--priority-high)', borderColor: 'rgba(239, 68, 68, 0.15)' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel pulse-border">
            <X className="modal-close" onClick={() => setShowFormModal(false)} />
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="var(--color-primary)" />
              {editingEmployee ? 'Edit Staff Profile' : 'Register New Staff'}
            </h2>
            
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="input-field"
                  placeholder="e.g. Alex Rivera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="input-field"
                  placeholder="e.g. alex.rivera@enterprise.ai"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Role Title</label>
                  <input 
                    type="text" 
                    required
                    className="input-field"
                    placeholder="e.g. Frontend Engineer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select 
                    className="input-field"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Product</option>
                    <option>HR</option>
                    <option>Marketing</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Salary (USD)</label>
                  <input 
                    type="number" 
                    required
                    className="input-field"
                    placeholder="e.g. 95000"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Performance Rating</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    className="input-field"
                    placeholder="e.g. 4.2"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Skills (Comma-separated)</label>
                <input 
                  type="text" 
                  className="input-field"
                  placeholder="e.g. React, TypeScript, Redux"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowFormModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Review Appraiser Modal */}
      {showReviewModal && selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel pulse-border" style={{ maxWidth: '700px' }}>
            <X className="modal-close" onClick={() => setShowReviewModal(false)} />
            
            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={22} color="var(--color-primary)" />
              <span>AI Appraiser Portal - {selectedEmployee.name}</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Leverage Gemini models to compile structural appraisals. System inputs will automatically calibrate active database ratings.
            </p>

            {!generatedReview ? (
              <form onSubmit={handleAIReviewSubmit}>
                <div className="form-group">
                  <label className="form-label">Key Achievements & Contributions</label>
                  <textarea 
                    className="input-field"
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    placeholder="e.g. Successfully launched the cloud migration project 2 weeks ahead of schedule. Refactored checkout state logic reducing bundle sizes by 12%."
                    value={reviewForm.achievements}
                    onChange={(e) => setReviewForm({ ...reviewForm, achievements: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Areas of Improvement / Growth Goals</label>
                  <textarea 
                    className="input-field"
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    placeholder="e.g. Needs to actively present in weekly design calls. Focus on mastering automated backend integration pipelines."
                    value={reviewForm.improvement}
                    onChange={(e) => setReviewForm({ ...reviewForm, improvement: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                  <button type="button" onClick={() => setShowReviewModal(false)} className="btn-secondary">Close</button>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={reviewLoading}
                    style={{ minWidth: '180px', justifyContent: 'center' }}
                  >
                    {reviewLoading ? (
                      <>
                        <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Generate AI Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div style={styles.reviewOutputContainer}>
                <div style={styles.reviewMarkdown}>
                  {generatedReview.content.split('\n').map((line, idx) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={idx} style={{ fontSize: '1.4rem', margin: '1rem 0 0.5rem 0', color: 'var(--color-primary)' }}>{line.replace('# ', '')}</h1>;
                    }
                    if (line.startsWith('## ')) {
                      return <h2 key={idx} style={{ fontSize: '1.2rem', margin: '1rem 0 0.5rem 0', color: 'var(--color-secondary)' }}>{line.replace('## ', '')}</h2>;
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={idx} style={{ fontSize: '1.05rem', margin: '0.8rem 0 0.4rem 0' }}>{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('* ') || line.startsWith('- ')) {
                      return <li key={idx} style={{ marginLeft: '1.25rem', fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>{line.replace(/^[\*\-]\s+/, '')}</li>;
                    }
                    if (line.trim().length === 0) return <br key={idx} />;
                    return <p key={idx} style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{line}</p>;
                  })}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                  <div style={styles.reviewRatingIndicator}>
                    <span>Appraisal Score: </span>
                    <strong style={{ color: 'var(--color-primary)' }}>{generatedReview.overallRating.toFixed(1)} / 5.0</strong>
                  </div>
                  <button 
                    onClick={() => setShowReviewModal(false)}
                    className="btn-primary"
                  >
                    Finalize Review
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    marginBottom: '2rem',
    gap: '1rem'
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '0 0.85rem',
    flex: 1,
    maxWidth: '450px'
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
  selectFilter: {
    background: 'rgba(10, 14, 26, 0.6)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    padding: '0.75rem 1rem',
    outline: 'none',
    minWidth: '180px',
    cursor: 'pointer'
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
    gap: '1rem',
    color: 'var(--text-secondary)'
  },
  employeeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
    gap: '1.5rem'
  },
  empCard: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '290px'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.25rem'
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#050510',
    fontWeight: '700',
    fontSize: '1.1rem',
    letterSpacing: '0.05em'
  },
  headerInfo: {
    flex: 1
  },
  name: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  role: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginTop: '0.1rem'
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1.25rem',
    padding: '0.85rem 1rem',
    background: 'rgba(0,0,0,0.15)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(255,255,255,0.02)'
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: 'var(--text-secondary)'
  },
  skillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem',
    marginBottom: '1.5rem',
    flex: 1
  },
  skillTag: {
    background: 'rgba(255, 255, 255, 0.03)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    padding: '0.15rem 0.5rem',
    borderRadius: '10px',
    fontSize: '0.75rem'
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1rem',
    marginTop: 'auto'
  },
  reviewBtn: {
    padding: '0.5rem 0.85rem',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontWeight: '600'
  },
  actionGroup: {
    display: 'flex',
    gap: '0.5rem'
  },
  reviewOutputContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  reviewMarkdown: {
    maxHeight: '400px',
    overflowY: 'auto',
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: '1.5rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    fontFamily: 'inherit'
  },
  reviewRatingIndicator: {
    marginRight: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem'
  }
};
