import { useState, useEffect } from 'react';
import api from '../services/api';

const ResearchOpportunities = () => {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/projects/').then(res => {
      setProjects(res.data);
      if (res.data.length > 0) {
        setProjectId(res.data[res.data.length - 1].id || res.data[res.data.length - 1]._id);
      }
    });
  }, []);

  useEffect(() => {
    if (projectId) {
      setLoading(true);
      api.get(`/analysis/${projectId}/opportunities`)
        .then(res => {
          setOpportunities(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [projectId]);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)' }}>Opportunity Discovery</h2>
          <p style={{ color: 'var(--text-gray)' }}>Discover novel research directions and cross-domain connections based on evidence.</p>
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
            <div key={n} className="card skeleton" style={{ height: '220px' }}></div>
          ))}
        </div>
      ) : opportunities.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="animate-slide-up">
          {opportunities.map((opp, idx) => (
            <div key={opp._id || opp.id} className="card ai-insight-card" style={{ animationDelay: `${idx * 0.1}s`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <span className="badge badge-low" style={{ marginBottom: '0.75rem' }}>Cross-Domain Innovation</span>
                  <h3 style={{ color: 'var(--primary-blue)', fontSize: '1.35rem', margin: 0, lineHeight: '1.4' }}>{opp.title}</h3>
                </div>
                {opp.confidence_score !== undefined && (
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginRight: '0.5rem' }}>Confidence</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{opp.confidence_score}%</span>
                  </div>
                )}
              </div>

              {/* Network Diagram Concept */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-pink)' }}></div>
                  <span style={{ color: 'var(--accent-pink)', fontSize: '0.85rem', fontWeight: 'bold' }}>Source Limitation</span>
                </div>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, var(--accent-pink), rgba(255,255,255,0.1), var(--accent-cyan))' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)' }}></div>
                  <span style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {opp.cross_domain_connection ? opp.cross_domain_connection.split('.')[0] : 'Domain Synthesis'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <h4 style={{ color: 'var(--text-dark)', marginBottom: '0.5rem', fontSize: '1rem' }}>Problem Addressed</h4>
                  <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>{opp.problem_addressed}</p>
                  
                  <h4 style={{ color: 'var(--text-dark)', marginBottom: '0.5rem', fontSize: '1rem' }}>Proposed Direction</h4>
                  <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem', lineHeight: '1.6' }}>{opp.proposed_direction}</p>
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h4 style={{ color: 'var(--text-dark)', marginBottom: '0.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--accent-purple)" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                      Cross-Domain Synthesis
                    </h4>
                    <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem', lineHeight: '1.6' }}>{opp.cross_domain_connection}</p>
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--text-dark)', marginBottom: '0.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="#10b981" strokeWidth="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      Expected Benefit
                    </h4>
                    <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem', lineHeight: '1.6' }}>{opp.expected_benefit}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-gray)' }}>
          <p>No opportunities discovered yet.</p>
        </div>
      )}
    </div>
  );
};

export default ResearchOpportunities;
