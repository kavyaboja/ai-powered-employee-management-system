import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Users, 
  CheckSquare, 
  Award, 
  Percent, 
  TrendingUp, 
  Calendar,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [empData, taskData] = await Promise.all([
          api.employees.getAll(),
          api.tasks.getAll()
        ]);
        setEmployees(empData);
        setTasks(taskData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch dashboard data. Please make sure the server is running.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading analytical insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorCard} className="glass-panel pulse-border">
        <AlertCircle size={40} color="var(--priority-high)" />
        <div>
          <h3>Database Connection Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Calculations
  const totalEmployees = employees.length;
  const activeTasks = tasks.filter(t => t.status !== 'Completed').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const avgRating = totalEmployees > 0 
    ? (employees.reduce((sum, e) => sum + e.rating, 0) / totalEmployees).toFixed(2)
    : '0.00';

  // Department Breakdown
  const deptCount = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {});

  const departments = Object.keys(deptCount).map(name => ({
    name,
    count: deptCount[name]
  })).sort((a,b) => b.count - a.count);

  // Task Status Breakdown
  const statusCount = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, { 'To Do': 0, 'In Progress': 0, 'Review': 0, 'Completed': 0 });

  // Generate dynamic AI Insights based on stats
  const getAIInsights = () => {
    const insights = [];
    if (parseFloat(avgRating) > 4.5) {
      insights.push({
        title: 'High Team Performance Index',
        desc: `Average team performance rating is at a high of ${avgRating}/5. Keep engaging employees with challenging workloads to sustain momentum.`,
        type: 'success'
      });
    } else if (parseFloat(avgRating) < 4.3) {
      insights.push({
        title: 'Performance Coaching Recommended',
        desc: `Overall rating sits at ${avgRating}/5. Plan structured review cycles to identify blockers and establish training targets.`,
        type: 'warning'
      });
    }

    if (activeTasks > totalEmployees * 1.5) {
      insights.push({
        title: 'Workload Congestion Risk',
        desc: `Active task count (${activeTasks}) is high relative to team size (${totalEmployees}). Consider delegating new requests or reassessing deadlines.`,
        type: 'danger'
      });
    } else {
      insights.push({
        title: 'Healthy Workload Allocation',
        desc: 'Task loading levels indicate optimal development capacity without high burnout risk.',
        type: 'success'
      });
    }

    if (taskCompletionRate < 50 && totalTasks > 3) {
      insights.push({
        title: 'Project Velocity Alert',
        desc: `Only ${taskCompletionRate}% of assigned roadmap tasks are completed. Recommend reviews on the 'In Review' pipeline to close pending items.`,
        type: 'warning'
      });
    }

    return insights;
  };

  const insights = getAIInsights();

  // SVG Chart Computations
  const maxDeptCount = departments.length > 0 ? Math.max(...departments.map(d => d.count)) : 1;
  const barChartHeight = 150;
  const barChartWidth = 320;
  const barWidth = 40;
  const barGap = 20;

  // Donut chart calculations
  const donutRadius = 50;
  const donutStrokeWidth = 14;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const totalStatuses = tasks.length || 1;
  
  const todoPercent = statusCount['To Do'] / totalStatuses;
  const ipPercent = statusCount['In Progress'] / totalStatuses;
  const reviewPercent = statusCount['Review'] / totalStatuses;
  const compPercent = statusCount['Completed'] / totalStatuses;

  const todoStrokeDashoffset = donutCircumference;
  const ipStrokeDashoffset = todoStrokeDashoffset - (donutCircumference * todoPercent);
  const reviewStrokeDashoffset = ipStrokeDashoffset - (donutCircumference * ipPercent);
  const compStrokeDashoffset = reviewStrokeDashoffset - (donutCircumference * reviewPercent);

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title">Operations Control</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Enterprise overview and predictive management metrics.</p>
        </div>
        <div style={styles.timeBadge} className="glass-panel">
          <Calendar size={16} color="var(--color-primary)" />
          <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ color: 'var(--color-primary)' }}>
            <Users size={28} />
          </div>
          <div className="stat-info">
            <p>Active Staff</p>
            <h3>{totalEmployees}</h3>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ color: 'var(--color-secondary)' }}>
            <Award size={28} />
          </div>
          <div className="stat-info">
            <p>Average Rating</p>
            <h3>{avgRating} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 5</span></h3>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ color: 'var(--priority-medium)' }}>
            <CheckSquare size={28} />
          </div>
          <div className="stat-info">
            <p>Active Workload</p>
            <h3>{activeTasks}</h3>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ color: 'var(--status-completed)' }}>
            <Percent size={28} />
          </div>
          <div className="stat-info">
            <p>Task Completion</p>
            <h3>{taskCompletionRate}%</h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Charts & AI Insights */}
      <div style={styles.mainGrid}>
        
        {/* Department Chart Card */}
        <div className="glass-panel" style={styles.chartCard}>
          <div style={styles.cardHeader}>
            <TrendingUp size={18} color="var(--color-primary)" />
            <h3 style={styles.cardTitle}>Staff Distribution</h3>
          </div>
          
          {departments.length === 0 ? (
            <div style={styles.emptyChart}>No department data available.</div>
          ) : (
            <div style={styles.chartWrapper}>
              <svg width="100%" height={barChartHeight + 40} viewBox={`0 0 ${barChartWidth} ${barChartHeight + 40}`} style={{ overflow: 'visible' }}>
                {departments.map((dept, index) => {
                  const x = index * (barWidth + barGap) + 30;
                  const barVal = (dept.count / maxDeptCount) * barChartHeight;
                  const y = barChartHeight - barVal + 20;

                  return (
                    <g key={dept.name}>
                      {/* Bar Background */}
                      <rect 
                        x={x} 
                        y={20} 
                        width={barWidth} 
                        height={barChartHeight} 
                        fill="rgba(255,255,255,0.02)" 
                        rx={4}
                      />
                      {/* Interactive Colored Bar */}
                      <rect 
                        x={x} 
                        y={y} 
                        width={barWidth} 
                        height={barVal} 
                        fill="url(#deptGradient)" 
                        rx={4}
                        style={{ transition: 'all 1s ease' }}
                      />
                      {/* Text value */}
                      <text 
                        x={x + barWidth / 2} 
                        y={y - 8} 
                        fill="var(--text-primary)" 
                        fontSize="11" 
                        fontWeight="600" 
                        textAnchor="middle"
                      >
                        {dept.count}
                      </text>
                      {/* Label */}
                      <text 
                        x={x + barWidth / 2} 
                        y={barChartHeight + 35} 
                        fill="var(--text-secondary)" 
                        fontSize="10" 
                        textAnchor="middle"
                      >
                        {dept.name.substring(0, 7)}
                      </text>
                    </g>
                  );
                })}
                <defs>
                  <linearGradient id="deptGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-primary)" />
                    <stop offset="100%" stopColor="var(--color-secondary)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}
        </div>

        {/* Task Donut Chart Card */}
        <div className="glass-panel" style={styles.chartCard}>
          <div style={styles.cardHeader}>
            <CheckSquare size={18} color="var(--color-secondary)" />
            <h3 style={styles.cardTitle}>Task Progress Breakdown</h3>
          </div>
          
          {totalTasks === 0 ? (
            <div style={styles.emptyChart}>No task allocation data.</div>
          ) : (
            <div style={styles.donutContainer}>
              <svg width="150" height="150" viewBox="0 0 120 120">
                <circle 
                  cx="60" 
                  cy="60" 
                  r={donutRadius} 
                  fill="transparent" 
                  stroke="rgba(255,255,255,0.03)" 
                  strokeWidth={donutStrokeWidth} 
                />
                
                {/* Completed (Green) */}
                {compPercent > 0 && (
                  <circle 
                    cx="60" 
                    cy="60" 
                    r={donutRadius} 
                    fill="transparent" 
                    stroke="var(--status-completed)" 
                    strokeWidth={donutStrokeWidth} 
                    strokeDasharray={donutCircumference}
                    strokeDashoffset={compStrokeDashoffset}
                    transform="rotate(-90 60 60)"
                  />
                )}

                {/* Review (Purple) */}
                {reviewPercent > 0 && (
                  <circle 
                    cx="60" 
                    cy="60" 
                    r={donutRadius} 
                    fill="transparent" 
                    stroke="var(--status-review)" 
                    strokeWidth={donutStrokeWidth} 
                    strokeDasharray={donutCircumference}
                    strokeDashoffset={reviewStrokeDashoffset}
                    transform="rotate(-90 60 60)"
                  />
                )}

                {/* In Progress (Orange) */}
                {ipPercent > 0 && (
                  <circle 
                    cx="60" 
                    cy="60" 
                    r={donutRadius} 
                    fill="transparent" 
                    stroke="var(--status-inprogress)" 
                    strokeWidth={donutStrokeWidth} 
                    strokeDasharray={donutCircumference}
                    strokeDashoffset={ipStrokeDashoffset}
                    transform="rotate(-90 60 60)"
                  />
                )}

                {/* To Do (Blue) */}
                {todoPercent > 0 && (
                  <circle 
                    cx="60" 
                    cy="60" 
                    r={donutRadius} 
                    fill="transparent" 
                    stroke="var(--status-todo)" 
                    strokeWidth={donutStrokeWidth} 
                    strokeDasharray={donutCircumference}
                    strokeDashoffset={todoStrokeDashoffset}
                    transform="rotate(-90 60 60)"
                  />
                )}
              </svg>

              <div style={styles.donutLabels}>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, backgroundColor: 'var(--status-todo)' }} />
                  <span style={styles.legendText}>To Do ({statusCount['To Do']})</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, backgroundColor: 'var(--status-inprogress)' }} />
                  <span style={styles.legendText}>In Progress ({statusCount['In Progress']})</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, backgroundColor: 'var(--status-review)' }} />
                  <span style={styles.legendText}>Review ({statusCount['Review']})</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, backgroundColor: 'var(--status-completed)' }} />
                  <span style={styles.legendText}>Completed ({statusCount['Completed']})</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Management Insights Panel */}
        <div className="glass-panel" style={styles.aiPanel}>
          <div style={styles.aiHeader}>
            <Sparkles size={20} color="var(--color-primary)" style={styles.aiSparkle} />
            <h3 style={styles.cardTitle}>Gemini AI Co-Pilot Insights</h3>
          </div>
          
          <div style={styles.insightsList}>
            {insights.map((ins, index) => (
              <div key={index} style={styles.insightCard} className="glass-card">
                <div style={{
                  ...styles.insightTypeIndicator,
                  backgroundColor: ins.type === 'success' ? 'var(--status-completed)' :
                                   ins.type === 'warning' ? 'var(--status-inprogress)' : 'var(--priority-high)'
                }} />
                <div>
                  <h4 style={styles.insightTitle}>{ins.title}</h4>
                  <p style={styles.insightDesc}>{ins.desc}</p>
                </div>
              </div>
            ))}

            {insights.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                Analyzing workforce patterns... Register employees and assign roadmap milestones to compute indicators.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  timeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    borderRadius: '20px'
  },
  errorCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '2rem',
    margin: '2rem 0',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: 'rgba(239, 68, 68, 0.2)'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  chartCard: {
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '260px'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.75rem'
  },
  cardTitle: {
    fontSize: '1.05rem',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  chartWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flex: 1,
    paddingTop: '1rem'
  },
  emptyChart: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    color: 'var(--text-muted)',
    fontSize: '0.9rem'
  },
  donutContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1
  },
  donutLabels: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%'
  },
  legendText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)'
  },
  aiPanel: {
    gridColumn: '1 / -1',
    padding: '1.75rem',
    minHeight: '200px'
  },
  aiHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.75rem'
  },
  aiSparkle: {
    filter: 'drop-shadow(0 0 4px var(--color-primary))'
  },
  insightsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem'
  },
  insightCard: {
    padding: '1.25rem',
    display: 'flex',
    gap: '1rem',
    position: 'relative',
    overflow: 'hidden'
  },
  insightTypeIndicator: {
    width: '4px',
    position: 'absolute',
    left: '0',
    top: '0',
    bottom: '0'
  },
  insightTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '0.25rem'
  },
  insightDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4'
  }
};
