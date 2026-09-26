import { useState, useEffect } from 'react';
import api from '../services/api';

const Ranking = () => {
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
      // Backend already returns these sorted by rank_score DESC
      api.get(`/analysis/${projectId}/opportunities`)
        .then(res => {
          setOpportunities(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [projectId]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)' }}>Evidence-Based Research Ranking</h2>
          <p style={{ color: 'var(--text-gray)' }}>Opportunities evaluated dynamically using multi-factor feasibility, impact, and novelty analysis.</p>
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
      ) : opportunities.length > 0 ? (
        <div style={{ display: 'grid', gap: '1.5rem' }} className="animate-slide-up">
          {opportunities.map((opp, index) => {
            const isTop3 = index < 3;
            const rankColors = ['var(--accent-pink)', 'var(--accent-cyan)', 'var(--primary-blue)'];
            const rankColor = isTop3 ? rankColors[index] : 'var(--text-gray)';
            
            return (
              <div key={opp._id || opp.id} className={`card ${isTop3 ? 'ai-insight-card' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.5rem 2rem', background: index === 0 ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(15, 23, 42, 0.6))' : 'var(--card-bg)', animationDelay: `${index * 0.1}s`, transform: 'scale(1)', transition: 'all 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <div style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '800', 
                  color: rankColor,
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: isTop3 ? `rgba(255,255,255,0.05)` : 'rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: isTop3 ? `2px solid ${rankColor}` : '1px solid var(--border-color)',
                  boxShadow: isTop3 ? `0 0 20px ${rankColor}33` : 'none',
                  textShadow: isTop3 ? `0 0 10px ${rankColor}66` : 'none'
                }}>
                  #{index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.3rem', color: 'var(--text-dark)', margin: 0 }}>{opp.title}</h3>
                    {index === 0 && <span className="badge" style={{ backgroundColor: 'rgba(236,72,153,0.15)', color: 'var(--accent-pink)', border: '1px solid rgba(236,72,153,0.3)' }}>Top Recommendation</span>}
                  </div>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-gray)', lineHeight: '1.6', maxWidth: '800px', marginBottom: '0.75rem' }}>
                    <strong style={{ color: 'var(--text-dark)' }}>Direction:</strong> {opp.proposed_direction}
                  </p>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', backgroundColor: 'rgba(6,182,212,0.1)', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid rgba(6,182,212,0.2)' }}>
                    <strong style={{ color: 'var(--text-dark)', marginRight: '0.5rem' }}>Rationale:</strong> 
                    {opp.ranking_rationale}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '130px', borderLeft: '1px solid var(--border-color)', paddingLeft: '2rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Rank Score</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: '800', background: `linear-gradient(to right, ${rankColor}, var(--accent-purple))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {opp.rank_score.toFixed(1)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-gray)' }}>
          <p>No ranking data available.</p>
        </div>
      )}
    </div>
  );
};

export default Ranking;
