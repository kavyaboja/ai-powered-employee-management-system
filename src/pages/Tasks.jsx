import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  X, 
  AlertCircle,
  Calendar,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '',
    assigneeId: ''
  });

  // AI Matching state
  const [aiMatching, setAiMatching] = useState(false);
  const [aiMatches, setAiMatches] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [taskData, empData] = await Promise.all([
        api.tasks.getAll(),
        api.employees.getAll()
      ]);
      setTasks(taskData);
      setEmployees(empData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks registry. Make sure server is running.');
    } finally {
      setLoading(false);
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        assigneeId: formData.assigneeId === '' ? null : Number(formData.assigneeId)
      };

      if (editingTask) {
        await api.tasks.update(editingTask.id, payload);
      } else {
        await api.tasks.create(payload);
      }
      setShowFormModal(false);
      resetForm();
      loadData();
    } catch (err) {
      alert(err.message || 'Error occurred while saving task.');
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await api.tasks.update(task.id, { ...task, status: newStatus });
      loadData();
    } catch (err) {
      alert('Failed to update task pipeline state.');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assigneeId: task.assigneeId || ''
    });
    setAiMatches(null);
    setShowFormModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.tasks.delete(id);
        loadData();
      } catch (err) {
        alert('Failed to remove task.');
      }
    }
  };

  const triggerAIMatcher = async () => {
    if (!formData.title || !formData.description) {
      alert('Please fill out the Task Title and Description first so the AI can analyze requirements!');
      return;
    }

    try {
      setAiMatching(true);
      setAiMatches(null);
      
      const suggestions = await api.ai.matchTask({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate
      });
      
      setAiMatches(suggestions);
    } catch (err) {
      alert(err.message || 'AI task matching failed.');
    } finally {
      setAiMatching(false);
    }
  };

  const selectSuggestedAssignee = (empId) => {
    setFormData(prev => ({ ...prev, assigneeId: empId.toString() }));
    // Clear matches indicator
    setAiMatches(null);
  };

  const resetForm = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'To Do',
      priority: 'Medium',
      dueDate: new Date().toISOString().split('T')[0],
      assigneeId: ''
    });
    setAiMatches(null);
  };

  // Kanban lanes definition
  const columns = ['To Do', 'In Progress', 'Review', 'Completed'];

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title">Milestones & Task Board</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Map out operational duties and utilize AI to match workload capacities.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowFormModal(true); }}
          className="btn-primary"
        >
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {loading && tasks.length === 0 ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Analyzing sprints...</p>
        </div>
      ) : error ? (
        <div style={styles.errorCard} className="glass-panel pulse-border">
          <AlertCircle size={40} color="var(--priority-high)" />
          <div>
            <h3>Error Loading Tasks</h3>
            <p>{error}</p>
          </div>
        </div>
      ) : (
        /* Kanban Layout */
        <div style={styles.boardGrid}>
          {columns.map(col => {
            const laneTasks = tasks.filter(t => t.status === col);
            return (
              <div key={col} style={styles.boardColumn} className="glass-panel">
                <div style={styles.columnHeader}>
                  <div style={{
                    ...styles.columnDot,
                    backgroundColor: col === 'To Do' ? 'var(--status-todo)' :
                                     col === 'In Progress' ? 'var(--status-inprogress)' :
                                     col === 'Review' ? 'var(--status-review)' : 'var(--status-completed)'
                  }} />
                  <h3 style={styles.columnTitle}>{col}</h3>
                  <span style={styles.columnCount}>{laneTasks.length}</span>
                </div>

                <div style={styles.tasksList}>
                  {laneTasks.map(task => (
                    <div key={task.id} className="glass-card" style={styles.taskCard}>
                      <div style={styles.taskHeader}>
                        <span style={styles.priorityBadge(task.priority)} className={`badge badge-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                        <div style={styles.taskActions}>
                          <button onClick={() => handleEdit(task)} className="btn-icon" style={{ padding: '0.25rem' }} title="Edit Task">
                            <Plus size={12} />
                          </button>
                          <button onClick={() => handleDelete(task.id)} className="btn-icon" style={{ padding: '0.25rem', color: 'var(--priority-high)' }} title="Delete Task">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <h4 style={styles.taskTitle}>{task.title}</h4>
                      <p style={styles.taskDesc}>{task.description}</p>

                      <div style={styles.taskMeta}>
                        <div style={styles.metaRow}>
                          <Calendar size={13} color="var(--text-muted)" />
                          <span>{task.dueDate}</span>
                        </div>
                        {task.assigneeName ? (
                          <div style={styles.assigneeBadge} title={`${task.assigneeName} (${task.assigneeRole})`}>
                            <User size={12} color="var(--color-primary)" />
                            <span>{task.assigneeName.split(' ')[0]}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </div>

                      {/* Lane movements */}
                      <div style={styles.cardNavs}>
                        {col !== 'To Do' && (
                          <button 
                            onClick={() => handleStatusChange(task, columns[columns.indexOf(col) - 1])}
                            style={styles.navBtn}
                          >
                            <ArrowLeft size={13} />
                          </button>
                        )}
                        <span style={{ flex: 1 }} />
                        {col !== 'Completed' && (
                          <button 
                            onClick={() => handleStatusChange(task, columns[columns.indexOf(col) + 1])}
                            style={styles.navBtn}
                          >
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {laneTasks.length === 0 && (
                    <div style={styles.emptyLane}>Lane Empty</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Creation / Editing Modal */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel pulse-border" style={{ maxWidth: '650px' }}>
            <X className="modal-close" onClick={() => setShowFormModal(false)} />
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="var(--color-primary)" />
              {editingTask ? 'Modify Task Details' : 'Create Project Task'}
            </h2>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required
                  placeholder="e.g. Build API Schema"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Task Description</label>
                <textarea 
                  className="input-field" 
                  required
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Summarize the core requirements, deliverables and criteria for this ticket."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select 
                    className="input-field"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input 
                    type="date" 
                    className="input-field"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Lane Status</label>
                  <select 
                    className="input-field"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Review</option>
                    <option>Completed</option>
                  </select>
                </div>
                
                {/* Assignee Input + AI Assistant Trigger */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Assignee</span>
                    <button 
                      type="button" 
                      onClick={triggerAIMatcher}
                      style={styles.aiButton}
                      disabled={aiMatching}
                    >
                      <Sparkles size={12} color="var(--color-primary)" />
                      <span>{aiMatching ? 'Analyzing...' : 'AI Suggest'}</span>
                    </button>
                  </label>
                  <select 
                    className="input-field"
                    value={formData.assigneeId}
                    onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* AI Matching suggestions display */}
              {aiMatches && (
                <div style={styles.aiResultContainer} className="glass-panel">
                  <h4 style={styles.aiResultHeader}>
                    <Sparkles size={14} color="var(--color-primary)" />
                    <span>Gemini Smart Matches:</span>
                  </h4>
                  <div style={styles.aiMatchesList}>
                    {aiMatches.map(match => (
                      <div key={match.employeeId} style={styles.aiMatchCard} className="glass-card">
                        <div style={styles.matchStats}>
                          <span style={styles.matchEmpName}>{match.employeeName}</span>
                          <span style={styles.matchScoreIndicator}>{match.matchScore}% Fit</span>
                        </div>
                        <p style={styles.matchReason}>{match.reasoning}</p>
                        <button 
                          type="button"
                          onClick={() => selectSuggestedAssignee(match.employeeId)}
                          style={styles.assignSelectBtn}
                        >
                          <CheckCircle2 size={13} />
                          <span>Assign</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowFormModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  boardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.25rem',
    alignItems: 'start'
  },
  boardColumn: {
    padding: '1.25rem',
    borderRadius: 'var(--radius-md)',
    minHeight: '450px',
    backgroundColor: 'rgba(15, 21, 39, 0.45)'
  },
  columnHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1.25rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.75rem'
  },
  columnDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginRight: '0.65rem'
  },
  columnTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  columnCount: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: '0.15rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)'
  },
  tasksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  taskCard: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  priorityBadge: (priority) => ({
    fontSize: '0.7rem',
    padding: '0.15rem 0.5rem'
  }),
  taskActions: {
    display: 'flex',
    gap: '0.35rem'
  },
  taskTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  taskDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    wordBreak: 'break-word'
  },
  taskMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255,255,255,0.03)',
    paddingTop: '0.75rem',
    marginTop: '0.25rem'
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)'
  },
  assigneeBadge: {
    backgroundColor: 'rgba(0, 242, 254, 0.05)',
    border: '1px solid rgba(0, 242, 254, 0.15)',
    padding: '0.15rem 0.5rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontSize: '0.75rem',
    color: 'var(--text-primary)'
  },
  cardNavs: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.25rem'
  },
  navBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
    '&:hover': {
      color: 'var(--color-primary)',
      backgroundColor: 'rgba(255,255,255,0.05)'
    }
  },
  emptyLane: {
    border: '1px dashed rgba(255,255,255,0.03)',
    borderRadius: 'var(--radius-sm)',
    padding: '2rem',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.8rem'
  },
  aiButton: {
    background: 'rgba(0, 242, 254, 0.05)',
    border: '1px solid rgba(0, 242, 254, 0.2)',
    borderRadius: '4px',
    padding: '0.15rem 0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.75rem',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  aiResultContainer: {
    marginTop: '1.5rem',
    padding: '1.25rem',
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  aiResultHeader: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.85rem'
  },
  aiMatchesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  aiMatchCard: {
    padding: '0.85rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    backgroundColor: 'rgba(22, 30, 54, 0.4)'
  },
  matchStats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  matchEmpName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  matchScoreIndicator: {
    fontSize: '0.8rem',
    color: 'var(--color-primary)',
    fontWeight: '700'
  },
  matchReason: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.45'
  },
  assignSelectBtn: {
    alignSelf: 'flex-end',
    background: 'rgba(0, 242, 254, 0.07)',
    border: '1px solid rgba(0, 242, 254, 0.25)',
    borderRadius: '4px',
    color: 'var(--color-primary)',
    padding: '0.25rem 0.65rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    transition: 'all 0.2s',
    marginTop: '0.25rem'
  },
  errorCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '2rem',
    margin: '2rem 0',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: 'rgba(239, 68, 68, 0.2)'
  }
};
