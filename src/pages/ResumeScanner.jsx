import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  AlertCircle,
  Briefcase,
  Layers,
  Award,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  UserPlus
} from 'lucide-react';

export default function ResumeScanner() {
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [addedEmployee, setAddedEmployee] = useState(false);

  // File Upload handler (Reads plain text files)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'text/plain') {
      alert('Currently, this scanner parses plain text (.txt) files. For other formats (PDF/DOCX), please copy and paste the text content directly into the editor box.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setResumeText(event.target.result);
    };
    reader.onerror = () => {
      alert('Error reading resume text file.');
    };
    reader.readAsText(file);
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      alert('Please copy-paste or upload a resume content string to start analysis.');
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      setError(null);
      setAddedEmployee(false);
      
      const analysis = await api.ai.scanResume(resumeText);
      setResult(analysis);
    } catch (err) {
      setError(err.message || 'Resume scanning analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsEmployee = async () => {
    if (!result) return;
    try {
      // Split role title and clean salary estimation based on role
      const isSenior = result.suggestedRole.toLowerCase().includes('senior') || result.suggestedRole.toLowerCase().includes('lead');
      const estimatedSalary = result.suggestedDepartment === 'Engineering' ? (isSenior ? 125000 : 85000) :
                               result.suggestedDepartment === 'Design' ? (isSenior ? 100000 : 70000) :
                               result.suggestedDepartment === 'Product' ? (isSenior ? 115000 : 80000) : 65000;

      const employeePayload = {
        name: result.candidateName,
        email: `${result.candidateName.toLowerCase().replace(/\s+/g, '.')}@enterprise.ai`,
        role: result.suggestedRole,
        department: result.suggestedDepartment,
        salary: estimatedSalary,
        skills: result.skills,
        rating: (result.fitScore / 20).toFixed(1) // translate score 0-100 to rating 0-5
      };

      await api.employees.create(employeePayload);
      setAddedEmployee(true);
      alert(`${result.candidateName} has been successfully added to the employee database under ${result.suggestedDepartment} department!`);
    } catch (err) {
      alert(err.message || 'Failed to add parsed candidate to the database.');
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title">AI Resume Parser & Matcher</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Extract capabilities from applicant dossiers and map organizational fits.</p>
        </div>
      </div>

      <div style={styles.contentLayout}>
        {/* Input Card */}
        <div className="glass-panel" style={styles.inputCard}>
          <div style={styles.cardHeader}>
            <FileText size={18} color="var(--color-primary)" />
            <h3 style={styles.cardTitle}>Applicant Document Input</h3>
          </div>

          <form onSubmit={handleScan} style={styles.form}>
            {/* File Drag/Upload mock */}
            <div style={styles.uploadArea}>
              <Upload size={24} color="var(--text-secondary)" style={{ marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Upload plain text resume (.txt)
              </p>
              <input 
                type="file" 
                accept=".txt" 
                onChange={handleFileUpload}
                style={styles.fileInput}
                id="resume-file-picker"
              />
              <label htmlFor="resume-file-picker" className="btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
                Browse File
              </label>
            </div>

            <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className="form-label">Resume Text Content</label>
              <textarea 
                className="input-field"
                style={styles.textArea}
                placeholder="Paste structural resume text here... (Including: contact details, professional experience, skill listings, academic backgrounds, projects)"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
            >
              {loading ? (
                <>
                  <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                  <span>Analyzing Resume Profile...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Start AI Scans</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Card */}
        <div className="glass-panel" style={styles.resultsCard}>
          <div style={styles.cardHeader}>
            <Sparkles size={18} color="var(--color-secondary)" />
            <h3 style={styles.cardTitle}>AI Profile Breakdown</h3>
          </div>

          {error && (
            <div style={styles.errorAlert}>
              <AlertCircle size={20} color="var(--priority-high)" />
              <p>{error}</p>
            </div>
          )}

          {!result && !error && !loading && (
            <div style={styles.emptyResults}>
              <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <p>Paste copy or select applicant documents on the left and fire scanning pipelines to visualize reports.</p>
            </div>
          )}

          {loading && (
            <div style={styles.emptyResults}>
              <div className="loading-spinner" style={{ width: '32px', height: '32px', marginBottom: '1rem' }}></div>
              <p>Gemini LLM reading qualifications, parsing career timelines, and mapping job matching scores...</p>
            </div>
          )}

          {result && !loading && (
            <div style={styles.resultsWrapper}>
              
              {/* Header profile */}
              <div style={styles.resultHeader}>
                <div style={styles.candidateBadge}>
                  {result.candidateName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 style={styles.candidateName}>{result.candidateName}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Suggested Role: <strong style={{ color: 'var(--color-primary)' }}>{result.suggestedRole}</strong>
                  </p>
                </div>
              </div>

              {/* Fit Meter */}
              <div style={styles.fitScoreContainer} className="glass-card">
                <div style={styles.scoreMetric}>
                  <TrendingUp size={20} color="var(--color-primary)" />
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>{result.fitScore}% Fit Score</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Matching organizational benchmarks.</p>
                  </div>
                </div>
                {/* Visual bar */}
                <div style={styles.progressBarBg}>
                  <div style={styles.progressBarFill(result.fitScore)} />
                </div>
              </div>

              {/* Details grid */}
              <div style={styles.detailsGrid}>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>
                    <Layers size={14} color="var(--text-muted)" />
                    <span>Matched Department</span>
                  </div>
                  <strong style={styles.infoValue}>{result.suggestedDepartment}</strong>
                </div>

                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>
                    <Award size={14} color="var(--text-muted)" />
                    <span>Experience timeline</span>
                  </div>
                  <strong style={styles.infoValue}>{result.experience.split(' ').slice(0, 3).join(' ')}...</strong>
                </div>
              </div>

              {/* Skills */}
              <div style={styles.sectionBlock}>
                <h4 style={styles.sectionSub}>
                  <BookOpen size={14} color="var(--color-primary)" />
                  <span>Parsed Skills & Tags:</span>
                </h4>
                <div style={styles.tagsContainer}>
                  {result.skills.split(',').map((skill, i) => (
                    <span key={i} style={styles.resultTag}>{skill.trim()}</span>
                  ))}
                </div>
              </div>

              {/* AI Explanation */}
              <div style={styles.sectionBlock}>
                <h4 style={styles.sectionSub}>
                  <Sparkles size={14} color="var(--color-secondary)" />
                  <span>AI Structural Reasoning:</span>
                </h4>
                <p style={styles.explanationText}>{result.fitExplanation}</p>
              </div>

              {/* Recruiter Action */}
              <div style={styles.actionBlock}>
                <button 
                  onClick={handleAddAsEmployee}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={addedEmployee}
                >
                  <UserPlus size={16} />
                  <span>{addedEmployee ? 'Added to Directory' : 'Onboard as Employee'}</span>
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  contentLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    alignItems: 'start'
  },
  inputCard: {
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '520px'
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  uploadArea: {
    border: '1px dashed var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '1.25rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginBottom: '1.25rem',
    position: 'relative'
  },
  fileInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
    zIndex: -1
  },
  textArea: {
    minHeight: '200px',
    flex: 1,
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    lineHeight: '1.5',
    resize: 'vertical'
  },
  resultsCard: {
    padding: '1.75rem',
    minHeight: '520px',
    display: 'flex',
    flexDirection: 'column'
  },
  emptyResults: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    color: 'var(--text-secondary)',
    textAlign: 'center',
    padding: '2rem'
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '1rem',
    color: 'var(--priority-high)'
  },
  resultsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    flex: 1
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  candidateBadge: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#050510',
    fontWeight: '700',
    fontSize: '1rem'
  },
  candidateName: {
    fontSize: '1.15rem',
    fontWeight: '700'
  },
  fitScoreContainer: {
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  scoreMetric: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  progressBarBg: {
    height: '6px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressBarFill: (score) => ({
    height: '100%',
    width: `${score}%`,
    background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
    borderRadius: '3px',
    boxShadow: '0 0 8px var(--color-primary)'
  }),
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  infoCard: {
    padding: '0.85rem 1rem',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)'
  },
  infoLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.35rem'
  },
  infoValue: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  sectionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  sectionSub: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem'
  },
  resultTag: {
    backgroundColor: 'rgba(0, 242, 254, 0.04)',
    color: 'var(--text-primary)',
    border: '1px solid rgba(0, 242, 254, 0.15)',
    padding: '0.15rem 0.5rem',
    borderRadius: '10px',
    fontSize: '0.75rem'
  },
  explanationText: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.45',
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: '0.85rem 1rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(255,255,255,0.01)'
  },
  actionBlock: {
    marginTop: 'auto',
    paddingTop: '0.5rem'
  }
};
