import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const [project, setProject] = useState(null);
  const [papers, setPapers] = useState([]);
  const [report, setReport] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLatestAnalysis();
  }, []);

  const fetchLatestAnalysis = async () => {
    try {
      const projRes = await api.get('/projects/');
      if (projRes.data.length === 0) {
        setLoading(false);
        return;
      }
      const latestProject = projRes.data[projRes.data.length - 1];
      await loadAnalysisData(latestProject);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      setLoading(false);
    }
  };

  const loadAnalysisData = async (proj) => {
    setProject(proj);
    const [papersRes, reportRes, gapsRes, oppRes] = await Promise.all([
      api.get(`/analysis/${proj.id || proj._id}/papers`).catch(() => ({ data: [] })),
      api.get(`/analysis/${proj.id || proj._id}/report`).catch(() => ({ data: null })),
      api.get(`/analysis/${proj.id || proj._id}/gaps`).catch(() => ({ data: [] })),
      api.get(`/analysis/${proj.id || proj._id}/opportunities`).catch(() => ({ data: [] }))
    ]);

    setPapers(papersRes.data || []);
    setReport(reportRes.data);
    setGaps(gapsRes.data || []);
    setOpportunities(oppRes.data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--accent-purple)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1.5rem' }}></div>
        <h2 style={{ color: 'var(--text-dark)' }}>Loading Research Intelligence Dashboard...</h2>
      </div>
    );
  }

  // EMPTY STATE
  if (!project) return (
    <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
      <h1 style={{ fontSize: '2.5rem', color: 'var(--text-dark)', marginBottom: '1rem', background: 'linear-gradient(to right, var(--text-dark), var(--text-gray))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome to AIRIP Dashboard</h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-gray)', marginBottom: '3rem' }}>Enter a research topic or upload a publication PDF to analyze scholarly literature and uncover gaps.</p>
      
      <div className="card animate-slide-up" style={{ padding: '3.5rem 2rem', borderTop: '4px solid var(--accent-purple)' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-dark)' }}>Start Your First Research Analysis</h2>
        <p style={{ color: 'var(--text-gray)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>Provide a research topic or upload a publication PDF to retrieve literature and identify evidence-based research gaps.</p>
        <button onClick={() => navigate('/app')} className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
          Go to Research Input
        </button>
      </div>
    </div>
  );

  const primaryPaper = papers.find(p => p.is_primary || p.relevance_tier?.includes('Primary'));
  const bestOpportunity = opportunities.length > 0 ? [...opportunities].sort((a,b) => b.rank_score - a.rank_score)[0] : null;

  return (
    <div className="animate-fade-in">
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.4), rgba(13, 20, 38, 0.2))', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, var(--primary-blue), var(--accent-purple), var(--accent-pink))' }}></div>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Analysis Active</span>
          <h1 style={{ color: 'var(--text-dark)', fontSize: '2rem', margin: '0.25rem 0 0.5rem' }}>
            {project.topic || 'Uploaded Research Document Analysis'}
          </h1>
          <p style={{ color: 'var(--text-gray)', margin: 0, fontSize: '0.95rem' }}>Evidence-First Scholarly Intelligence Summary</p>
        </div>
        <button onClick={() => navigate('/app')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          New Analysis
        </button>
      </div>

      {/* PRIMARY PAPER HIGHLIGHT BANNER (If uploaded) */}
      {primaryPaper && (
        <div className="card animate-slide-up" style={{ marginBottom: '2.5rem', borderLeft: '4px solid var(--accent-purple)', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(15, 23, 42, 0.6))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-pink)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ★ PRIMARY SOURCE PAPER (UPLOADED PDF)
            </span>
            <span className="badge" style={{ backgroundColor: 'rgba(236, 72, 153, 0.2)', color: 'var(--accent-pink)' }}>Primary Input</span>
          </div>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--text-dark)', margin: '0 0 0.5rem 0' }}>{primaryPaper.title}</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--accent-purple)', margin: '0 0 0.75rem 0' }}>
            Authors: {Array.isArray(primaryPaper.authors) ? primaryPaper.authors.join(', ') : 'Primary Authors'} | Year: {primaryPaper.year || '2024'}
          </p>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-gray)', lineHeight: '1.6', margin: 0 }}>
            {primaryPaper.abstract ? primaryPaper.abstract.substring(0, 300) + '...' : 'Full text parsed directly from primary uploaded publication.'}
          </p>
        </div>
      )}

      {/* METRICS Bento Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card animate-slide-up" style={{ animationDelay: '0.05s', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: 0 }}>
          <div style={{ padding: '0.85rem', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-blue)' }}>
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-gray)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '600' }}>Publications Analyzed</h4>
            <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-dark)', marginTop: '0.15rem' }}>{papers.length}</p>
          </div>
        </div>

        <div className="card animate-slide-up" style={{ animationDelay: '0.1s', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: 0 }}>
          <div style={{ padding: '0.85rem', borderRadius: '12px', backgroundColor: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent-pink)' }}>
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-gray)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '600' }}>Research Gaps</h4>
            <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-dark)', marginTop: '0.15rem' }}>{gaps.length}</p>
          </div>
        </div>

        <div className="card animate-slide-up" style={{ animationDelay: '0.15s', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: 0 }}>
          <div style={{ padding: '0.85rem', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-purple)' }}>
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"></circle><circle cx="12" cy="19" r="3"></circle><circle cx="5" cy="12" r="3"></circle><circle cx="19" cy="12" r="3"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-gray)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '600' }}>Opportunities</h4>
            <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-dark)', marginTop: '0.15rem' }}>{opportunities.length}</p>
          </div>
        </div>

        <div className="card animate-slide-up" style={{ animationDelay: '0.2s', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: 0 }}>
          <div style={{ padding: '0.85rem', borderRadius: '12px', backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-gray)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '600' }}>High Feasibility</h4>
            <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-dark)', marginTop: '0.15rem' }}>{opportunities.filter(o => o.feasibility && o.feasibility.overall_score > 7).length}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* Research Landscape */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.25s', marginBottom: 0 }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem', fontSize: '1.2rem', color: 'var(--text-dark)' }}>Research Overview</h3>
          {report ? (
            <div style={{ color: 'var(--text-gray)' }}>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.95rem', lineHeight: '1.6' }}>AIRIP analyzed scholarly literature to extract themes and techniques.</p>
              <ul style={{ paddingLeft: '1.25rem', lineHeight: '2' }}>
                <li style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-dark)' }}>Major Themes:</strong> {report.common_themes.join(', ')}</li>
                <li><strong style={{ color: 'var(--text-dark)' }}>Methods Evaluated:</strong> {report.research_methods.join(', ')}</li>
              </ul>
            </div>
          ) : <p>Analysis pending.</p>}
        </div>

        {/* Under-Explored Domains */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.3s', marginBottom: 0 }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem', fontSize: '1.2rem', color: 'var(--accent-pink)' }}>Under-Explored Domains</h3>
          {report && report.under_explored_areas ? (
            <div>
              <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem', color: 'var(--text-gray)' }}>
                Based on literature analysis, the following areas represent significant opportunities with minimal coverage:
              </p>
              <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-dark)', lineHeight: '2' }}>
                {report.under_explored_areas.map((area, idx) => (
                  <li key={idx} style={{ marginBottom: '0.5rem' }}>{area}</li>
                ))}
              </ul>
            </div>
          ) : <p>Analyzing domain coverage...</p>}
        </div>

        {/* Final Recommendation */}
        <div className="card ai-insight-card animate-slide-up" style={{ gridColumn: '1 / -1', padding: '2.5rem', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--accent-purple)' }}>
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
            </div>
            <h3 style={{ color: 'var(--accent-purple)', fontSize: '1.3rem', margin: 0 }}>Quantum-Inspired Recommended Research Direction</h3>
          </div>
          
          {bestOpportunity ? (
            <div>
              <h4 style={{ color: 'var(--text-dark)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>{bestOpportunity.title}</h4>
              <p style={{ color: 'var(--text-gray)', marginBottom: '1.5rem', fontSize: '1.05rem', lineHeight: '1.6' }}>{bestOpportunity.proposed_direction || bestOpportunity.problem_addressed}</p>
              
              <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.95rem' }}>Ranking Rationale: </strong>
                <span style={{ color: 'var(--text-gray)', fontSize: '0.95rem' }}>{bestOpportunity.ranking_rationale}</span>
              </div>

              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ padding: '0.6rem 1.4rem', backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#93c5fd', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  Feasibility: {bestOpportunity.feasibility?.overall_score || 8}/10
                </div>
                <div style={{ padding: '0.6rem 1.4rem', background: 'linear-gradient(to right, var(--accent-purple), var(--accent-pink))', color: 'white', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)' }}>
                  Quantum Rank Score: {bestOpportunity.rank_score}/10
                </div>
              </div>
            </div>
          ) : <p style={{ color: 'var(--text-gray)' }}>Not enough literature data to form a recommendation.</p>}
        </div>

      </div>

      {/* Literature Corpus Section */}
      <div className="card animate-slide-up" style={{ animationDelay: '0.35s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', margin: 0 }}>Research Papers Analyzed (Corpus)</h3>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', marginTop: '0.2rem' }}>Verified literature retrieved from OpenAlex and Semantic Scholar graph APIs.</p>
          </div>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold', fontSize: '0.9rem' }}>{papers.length} Publications</span>
        </div>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {papers.map((p, idx) => {
            const isPrimary = p.is_primary || p.relevance_tier?.includes('Primary');
            return (
              <div key={p.id || p._id || idx} style={{ padding: '1.25rem 1.5rem', backgroundColor: isPrimary ? 'rgba(99, 102, 241, 0.12)' : 'rgba(10, 15, 30, 0.4)', border: isPrimary ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '1rem' }}>
                  <h4 style={{ color: 'var(--text-dark)', fontSize: '1.05rem', margin: 0 }}>
                    {isPrimary ? '★ ' : `${idx + 1}. `}{p.title}
                  </h4>
                  <span className="badge" style={{ backgroundColor: isPrimary ? 'rgba(236, 72, 153, 0.2)' : p.relevance_tier === 'Highly Relevant' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(99, 102, 241, 0.15)', color: isPrimary ? 'var(--accent-pink)' : p.relevance_tier === 'Highly Relevant' ? 'var(--accent-cyan)' : 'var(--accent-purple)', border: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}>
                    {isPrimary ? 'PRIMARY UPLOAD' : (p.relevance_tier || 'Relevant')}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>
                  Authors: {Array.isArray(p.authors) ? p.authors.slice(0, 3).join(', ') : (p.authors || 'Authors')} | Venue: {p.venue || 'Journal'} ({p.year || 'N/A'})
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>Citations: <strong style={{ color: 'var(--accent-pink)' }}>{p.citation_count || 0}</strong></span>
                  {p.doi_url && (
                    <a href={p.doi_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 'bold' }}>View Publication Link &rarr;</a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;