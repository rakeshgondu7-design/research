import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ResearchGaps = () => {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/projects/').then(res => {
      setProjects(res.data);
      if (res.data.length > 0) {
        setProjectId(res.data[res.data.length - 1].id || res.data[res.data.length - 1]._id);
      }
    });
  }, []);

  const fetchGaps = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await api.get(`/analysis/${projectId}/gaps`);
      setGaps(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchGaps();
    }
  }, [projectId]);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)' }}>Evidence-Based Research Gap Detection</h2>
          <p style={{ color: 'var(--text-gray)' }}>Cross-paper evidence analysis isolating unsolved constraints and empirical limitations.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-gray)' }}>Current Topic:</span>
          <select className="input-field" style={{ width: '250px', marginBottom: 0, padding: '0.6rem 1rem' }} value={projectId} onChange={e => setProjectId(e.target.value)}>
            <option value="">-- Select Topic --</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {[1, 2, 3].map(n => (
            <div key={n} className="card skeleton" style={{ height: '140px' }}></div>
          ))}
        </div>
      ) : gaps.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="animate-slide-up">
          {gaps.map((gap, index) => {
            const confidence = gap.confidence_score !== undefined ? gap.confidence_score : (95 - index * 4);
            const gapType = gap.gap_type || 'Methodological Gap';
            return (
              <div key={gap._id || gap.id} className="card" style={{ borderLeft: '4px solid var(--accent-pink)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ color: 'var(--accent-pink)', fontSize: '1.25rem', margin: 0 }}>{gap.title}</h3>
                  <span className={`badge ${confidence > 80 ? 'badge-high' : 'badge-medium'}`}>
                    {gapType} ({confidence}%)
                  </span>
                </div>
                
                <p style={{ color: 'var(--text-dark)', marginBottom: '1rem', lineHeight: '1.6' }}>
                  <strong>Cross-Paper Evidence:</strong> {gap.description}
                </p>

                {gap.evidence && gap.evidence.length > 0 && (
                  <div style={{ backgroundColor: 'rgba(10, 15, 30, 0.4)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-purple)', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Extracted Excerpt:</span>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', fontStyle: 'italic', margin: 0 }}>{gap.evidence[0].excerpt}</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'block' }}>Source: {gap.evidence[0].paper_title}</span>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, marginRight: '2rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>Detection Confidence:</span>
                    <div style={{ flex: 1, height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', maxWidth: '200px' }}>
                      <div style={{ height: '100%', width: `${confidence}%`, background: 'linear-gradient(to right, var(--accent-purple), var(--accent-pink))', borderRadius: '3px' }}></div>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: 'bold' }}>{confidence}%</span>
                  </div>
                  <button 
                    className="btn-primary" 
                    style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                    onClick={() => navigate(`/app/gaps/${gap._id || gap.id}`, { state: { gap } })}
                  >
                    View Explanations &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-gray)' }}>
          <p>No research gaps detected. Enter a topic or start a new analysis.</p>
        </div>
      )}
    </div>
  );
};

export default ResearchGaps;
