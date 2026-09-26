import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const UserInput = () => {
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleStartAnalysis = async (e) => {
    e.preventDefault();
    const cleanTopic = topic.trim();
    
    // Scenario 4: Topic missing AND File missing
    if (!cleanTopic && !file) {
      setError('Please enter a meaningful research topic, research problem, paper title, abstract, DOI, or upload a research paper.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Create project session (topic can be empty if file is provided)
      const projectRes = await api.post('/projects/', {
        name: cleanTopic || (file ? file.filename || 'Uploaded Paper Analysis' : 'Research Analysis'),
        topic: cleanTopic,
        description: 'AIRIP Dual-Input Research Analysis'
      });
      const projectId = projectRes.data.id || projectRes.data._id;
      
      // 2. Upload PDF file if attached
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        await api.post(`/projects/${projectId}/papers`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      // 3. Navigate to live pipeline
      navigate(`/app/pipeline/${projectId}`);
      
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Failed to initialize analysis. Please verify your research input or file.';
      setError(detail);
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '820px', margin: '3rem auto', padding: '0 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-block', padding: '0.4rem 1.25rem', borderRadius: '30px', backgroundColor: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', color: 'var(--accent-purple)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1.25rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Dual-Input Research Intelligence Engine
        </div>
        
        <h1 style={{ fontSize: '2.6rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '1rem', background: 'linear-gradient(135deg, var(--text-dark), var(--text-gray))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Analyze Research Topic or Upload PDF
        </h1>
        <p style={{ color: 'var(--text-gray)', fontSize: '1.15rem', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
          Start research intelligence by entering a research query, uploading a research paper PDF, or combining both for maximum analysis depth.
        </p>
      </div>

      <div className="card animate-slide-up" style={{ padding: '3rem', borderTop: '4px solid var(--accent-purple)', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7), rgba(6, 9, 19, 0.6))' }}>
        <form onSubmit={handleStartAnalysis} style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
          
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-dark)' }}>
                Option A: Research Topic / Problem / Question
              </label>
              <span style={{ fontSize: '0.8rem', color: file ? 'var(--accent-cyan)' : 'var(--text-muted)', fontWeight: '600' }}>
                {file ? '(Optional when PDF attached)' : '(Required if no PDF uploaded)'}
              </span>
            </div>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g., Artificial Intelligence in Precision Agriculture, LLMs in Healthcare" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{ fontSize: '1.05rem', padding: '1.15rem' }}
            />
          </div>

          <div style={{ position: 'relative', textAlign: 'center', margin: '0.25rem 0' }}>
            <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '1px', backgroundColor: 'var(--border-color)', zIndex: 1 }}></div>
            <span style={{ position: 'relative', zIndex: 2, backgroundColor: '#050814', padding: '0 1.25rem', color: 'var(--text-gray)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OR / AND</span>
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-dark)' }}>
                Option B: Upload Research Paper (PDF)
              </label>
              {file && (
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 'bold' }}>
                  ✓ PDF File Selected
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Have a research paper? Upload it here to use it as the <strong>Primary Paper Source</strong>. AIRIP will extract its context automatically.
            </p>
            <div style={{ position: 'relative' }}>
              <input 
                type="file" 
                accept=".pdf" 
                className="input-field" 
                onChange={(e) => setFile(e.target.files[0])}
                style={{ padding: '0.85rem 1.25rem' }}
              />
            </div>
            {file && (
              <div style={{ marginTop: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.75rem 1rem', borderRadius: '10px', color: '#10b981', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                <span>Attached: <strong>{file.name}</strong> — Will be set as <strong>PRIMARY PAPER (★)</strong></span>
              </div>
            )}
          </div>

          {error && (
            <div style={{ color: '#fca5a5', fontSize: '0.95rem', fontWeight: '600', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.25)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', borderRadius: '30px', justifyContent: 'center', alignSelf: 'center' }}
          >
            {loading ? 'Reading & Initializing Intelligence Engine...' : (file ? 'Analyze Uploaded Paper & Related Literature' : 'Start Research Analysis')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserInput;
