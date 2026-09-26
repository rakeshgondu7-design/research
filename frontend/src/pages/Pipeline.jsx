import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Pipeline = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(2);
  const [loading, setLoading] = useState(true);
  const [stepLoading, setStepLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [aiStage, setAiStage] = useState(0);

  const [project, setProject] = useState(null);
  const [papers, setPapers] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [opportunities, setOpportunities] = useState([]);

  const [activeExplanation, setActiveExplanation] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const aiStages = [
    { label: 'Reading Input', desc: 'Validating topic and parsing primary research paper...' },
    { label: 'Retrieving Literature', desc: 'Querying OpenAlex & Semantic Scholar for related publications...' },
    { label: 'Filtering Relevance', desc: 'Classifying relevance tiers and constructing research corpus...' },
    { label: 'Extracting Evidence', desc: 'Parsing abstract limitation statements across literature...' },
    { label: 'Formulating Gaps', desc: 'Deriving evidence-backed gaps and cross-domain opportunities...' }
  ];

  useEffect(() => {
    initPipeline();
  }, [projectId]);

  useEffect(() => {
    let interval;
    if (loading || stepLoading) {
      interval = setInterval(() => {
        setAiStage((prev) => (prev + 1) % aiStages.length);
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [loading, stepLoading]);

  const initPipeline = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const projRes = await api.get(`/projects/${projectId}`);
      setProject(projRes.data);
      
      const papersRes = await api.post(`/analysis/${projectId}/step/literature`);
      setPapers(papersRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to retrieve literature. Please check your query or PDF file.');
      setLoading(false);
    }
  };

  const triggerGapsStep = async () => {
    setStepLoading(true);
    setError(null);
    try {
      const res = await api.post(`/analysis/${projectId}/step/gaps`);
      setGaps(res.data);
      setCurrentStep(3);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to run gap detection.');
    } finally {
      setStepLoading(false);
    }
  };

  const triggerExplanationsStep = async () => {
    setStepLoading(true);
    setError(null);
    try {
      const res = await api.post(`/analysis/${projectId}/step/explanations`);
      setGaps(res.data);
      if (res.data.length > 0) {
        setActiveExplanation(res.data[0]._id || res.data[0].id);
      }
      setCurrentStep(4);
    } catch (err) {
      setError('Failed to run gap explanation.');
    } finally {
      setStepLoading(false);
    }
  };

  const triggerOpportunitiesStep = async () => {
    setStepLoading(true);
    setError(null);
    try {
      const res = await api.post(`/analysis/${projectId}/step/opportunities`);
      setOpportunities(res.data);
      setCurrentStep(5);
    } catch (err) {
      setError('Failed to run opportunity discovery.');
    } finally {
      setStepLoading(false);
    }
  };

  const triggerFeasibilityStep = async () => {
    setStepLoading(true);
    setError(null);
    try {
      const res = await api.post(`/analysis/${projectId}/step/feasibility`);
      setOpportunities(res.data);
      setCurrentStep(6);
    } catch (err) {
      setError('Failed to run feasibility analysis.');
    } finally {
      setStepLoading(false);
    }
  };

  const triggerRankingStep = async () => {
    setStepLoading(true);
    setError(null);
    try {
      const res = await api.post(`/analysis/${projectId}/step/ranking`);
      setOpportunities(res.data);
      setCurrentStep(7);
    } catch (err) {
      setError('Failed to calculate quantum ranking.');
    } finally {
      setStepLoading(false);
    }
  };

  const handleDeletePaper = async (paperId) => {
    try {
      await api.delete(`/projects/${projectId}/papers/${paperId}`);
      setPapers(papers.filter(p => p.id !== paperId && p._id !== paperId));
    } catch (err) {
      alert('Failed to delete paper');
    }
  };

  const renderAILoader = (title) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '55vh', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '3rem' }}>
      <div style={{ position: 'relative', width: '90px', height: '90px', marginBottom: '2.5rem' }}>
        <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(99,102,241,0.15)', borderTopColor: 'var(--accent-purple)', borderRadius: '50%', animation: 'spin 1.2s linear infinite' }}></div>
        <div style={{ position: 'absolute', inset: '10px', backgroundColor: 'rgba(99,102,241,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulseSlow 2s infinite ease-in-out' }}>
          <svg viewBox="0 0 24 24" width="32" height="32" stroke="var(--accent-purple)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
        </div>
      </div>
      <h3 style={{ color: 'var(--text-dark)', fontSize: '1.4rem', marginBottom: '1.5rem' }}>{title}</h3>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '650px', marginBottom: '1rem' }}>
        {aiStages.map((stage, idx) => (
          <React.Fragment key={stage.label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: idx === aiStage ? 'var(--accent-cyan)' : idx < aiStage ? 'var(--primary-blue)' : 'var(--text-gray)', fontWeight: idx === aiStage ? '700' : '500', fontSize: '0.9rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: idx === aiStage ? 'var(--accent-cyan)' : idx < aiStage ? 'var(--primary-blue)' : 'rgba(255,255,255,0.1)' }}></div>
              {stage.label}
            </div>
            {idx < aiStages.length - 1 && <span style={{ color: 'rgba(255,255,255,0.1)' }}>&rarr;</span>}
          </React.Fragment>
        ))}
      </div>
      <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem', fontStyle: 'italic' }}>{aiStages[aiStage].desc}</p>
    </div>
  );

  if (loading) return renderAILoader('Connecting & Analyzing Scholarly Literature...');

  const stepTitles = [
    'Research Corpus',
    'Gap Detection',
    'Gap Explanation',
    'Opportunity Discovery',
    'Feasibility Analysis',
    'Quantum Ranking'
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '1.5rem auto', padding: '0 1rem' }}>
      
      {/* Stepper Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' }}>
        {stepTitles.map((title, idx) => {
          const stepNum = idx + 2; 
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;
          return (
            <div key={title} style={{ textAlign: 'center', flex: 1, position: 'relative' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: isActive ? 'var(--accent-purple)' : isCompleted ? 'var(--primary-blue)' : 'rgba(255,255,255,0.03)',
                border: isActive ? '2px solid rgba(255,255,255,0.3)' : '1px solid var(--border-color)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.5rem',
                fontWeight: 'bold',
                boxShadow: isActive ? '0 0 15px rgba(99, 102, 241, 0.4)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isCompleted ? '✓' : stepNum - 1}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: isActive ? '600' : '400', color: isActive ? 'var(--text-dark)' : 'var(--text-gray)' }}>{title}</span>
            </div>
          );
        })}
      </div>

      {stepLoading && renderAILoader('Running Dependent AI Analysis...')}

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-pink)', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', color: '#fca5a5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><strong>Analysis Notice:</strong> {error}</span>
          <button onClick={() => setError(null)} className="btn btn-secondary" style={{ padding: '0.3rem 0.85rem', fontSize: '0.8rem' }}>Dismiss</button>
        </div>
      )}

      {!stepLoading && (
        <div className="animate-slide-up">
          
          {/* STEP 2: RESEARCH CORPUS */}
          {currentStep === 2 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)' }}>Step 2: Research Papers Analyzed (Corpus)</h2>
                  <p style={{ color: 'var(--text-gray)' }}>
                    Research Corpus containing <strong style={{ color: 'var(--accent-cyan)' }}>{papers.length} publications</strong> for: <strong style={{ color: 'var(--primary-blue)' }}>{project?.topic || 'Uploaded Research Document'}</strong>
                  </p>
                </div>
                <button onClick={triggerGapsStep} className="btn btn-primary" style={{ padding: '0.8rem 1.8rem' }}>Next: Detect Cross-Paper Gaps &rarr;</button>
              </div>
              
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {papers.map((p, idx) => {
                  const isPrimary = p.is_primary || p.relevance_tier?.includes('Primary');
                  const relevance = isPrimary ? 'PRIMARY PAPER (★)' : (p.relevance_tier || 'Relevant');
                  
                  return (
                    <div key={p.id || p._id} className="card" style={{ display: 'flex', gap: '1.5rem', background: isPrimary ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(15, 23, 42, 0.6))' : 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))', border: isPrimary ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-color)', position: 'relative' }}>
                      <div style={{ minWidth: '42px', height: '42px', borderRadius: '10px', backgroundColor: isPrimary ? 'var(--accent-purple)' : 'rgba(99, 102, 241, 0.15)', color: isPrimary ? '#ffffff' : 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {isPrimary ? '★' : `#${idx + 1}`}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '1rem' }}>
                          <h4 style={{ color: 'var(--text-dark)', fontSize: '1.15rem', margin: 0, lineHeight: '1.4' }}>{p.title}</h4>
                          <span className="badge" style={{ backgroundColor: isPrimary ? 'rgba(236, 72, 153, 0.2)' : 'rgba(6, 182, 212, 0.15)', color: isPrimary ? 'var(--accent-pink)' : 'var(--accent-cyan)', border: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
                            {relevance}
                          </span>
                        </div>
                        
                        <p style={{ fontSize: '0.85rem', color: 'var(--accent-purple)', marginBottom: '0.75rem', fontWeight: '600' }}>
                          Authors: {Array.isArray(p.authors) ? p.authors.slice(0, 4).join(', ') : (p.authors || 'Scholarly Authors')}
                        </p>
                        
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-gray)', lineHeight: '1.6', marginBottom: '1rem' }}>
                          {p.abstract ? (p.abstract.substring(0, 320) + '...') : 'Abstract text parsed from scholarly graph API.'}
                        </p>
                        
                        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-gray)', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span>Venue: <strong style={{ color: 'var(--text-dark)' }}>{p.venue || 'Journal'}</strong></span>
                          <span>Year: <strong style={{ color: 'var(--text-dark)' }}>{p.year || 'Recent'}</strong></span>
                          <span>Citations: <strong style={{ color: 'var(--accent-pink)' }}>{p.citation_count || p.metadata?.citationCount || 0}</strong></span>
                          {p.doi_url && (
                            <a href={p.doi_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', fontWeight: 'bold' }}>[View Publication / DOI &rarr;]</a>
                          )}
                        </div>
                      </div>
                      <button onClick={() => handleDeletePaper(p.id || p._id)} className="btn btn-secondary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', color: 'var(--accent-pink)', border: '1px solid rgba(236,72,153,0.2)', backgroundColor: 'transparent', alignSelf: 'flex-start' }}>Remove</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: GAP DETECTION */}
          {currentStep === 3 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)' }}>Step 3: Research Gap Detection</h2>
                  <p style={{ color: 'var(--text-gray)' }}>Analyzed literature limitations and evidence-backed unsolved constraints.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setCurrentStep(2)} className="btn btn-secondary">Back</button>
                  <button onClick={triggerExplanationsStep} className="btn btn-primary">Next: Explain Gaps &rarr;</button>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {gaps.map((g) => {
                  const confidence = g.confidence_score !== undefined ? g.confidence_score : 85;
                  const suppPapers = g.supporting_papers || [];
                  return (
                    <div key={g.id || g._id} className="card" style={{ borderLeft: '4px solid var(--accent-pink)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ color: 'var(--accent-pink)', fontSize: '1.25rem', margin: 0 }}>{g.title}</h3>
                        <span className="badge badge-high">{g.gap_type || 'Methodological Gap'} ({confidence}%)</span>
                      </div>
                      
                      <p style={{ color: 'var(--text-dark)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
                        <strong>Limitation Statement:</strong> {g.description}
                      </p>

                      {/* Supporting Papers Traceability */}
                      {suppPapers.length > 0 && (
                        <div style={{ backgroundColor: 'rgba(10, 15, 30, 0.4)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                            Supporting Paper Evidence ({g.evidence_type || 'Cross-Paper Evidence'}):
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {suppPapers.map((sp, sIdx) => (
                              <div key={sIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-dark)' }}>• <strong>{sp.title}</strong> ({sp.year || 'Recent'})</span>
                                {sp.doi_url ? (
                                  <a href={sp.doi_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>[View Paper]</a>
                                ) : (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Corpus Citation ({sp.citation_count || 0})</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)', fontWeight: 'bold' }}>Detection Confidence:</span>
                        <div style={{ flex: 1, height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${confidence}%`, background: 'linear-gradient(to right, var(--accent-purple), var(--accent-pink))', borderRadius: '3px' }}></div>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: 'bold' }}>{confidence}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: GAP EXPLANATION */}
          {currentStep === 4 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)' }}>Step 4: Gap Explanation & Source Traceability</h2>
                  <p style={{ color: 'var(--text-gray)' }}>Deep-dive analysis detailing the causes and exact literature source evidence.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setCurrentStep(3)} className="btn btn-secondary">Back</button>
                  <button onClick={triggerOpportunitiesStep} className="btn btn-primary">Next: Discover Opportunities &rarr;</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {gaps.map((g) => {
                  const isOpen = activeExplanation === (g._id || g.id);
                  const suppPapers = g.supporting_papers || [];
                  return (
                    <div key={g.id || g._id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'var(--card-bg)' }}>
                      <div 
                        onClick={() => setActiveExplanation(isOpen ? null : (g._id || g.id))}
                        style={{ padding: '1.25rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: isOpen ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                      >
                        <h3 style={{ color: isOpen ? 'var(--accent-pink)' : 'var(--text-dark)', fontSize: '1.15rem', margin: 0, fontWeight: '600' }}>{g.title}</h3>
                        <span style={{ fontSize: '1.5rem', color: 'var(--text-gray)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▾</span>
                      </div>
                      
                      {isOpen && (
                        <div style={{ padding: '2rem 1.75rem', borderTop: '1px solid var(--border-color)', display: 'grid', gap: '1.5rem', backgroundColor: 'rgba(0,0,0,0.15)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div>
                              <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 'bold', textTransform: 'uppercase' }}>Why It Exists</span>
                              <p style={{ marginTop: '0.25rem', color: 'var(--text-dark)', fontSize: '0.95rem' }}>{g.why_it_exists}</p>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 'bold', textTransform: 'uppercase' }}>Previous Baseline Attempts</span>
                              <p style={{ marginTop: '0.25rem', color: 'var(--text-dark)', fontSize: '0.95rem' }}>{g.previous_attempts}</p>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.8rem', color: 'var(--accent-pink)', fontWeight: 'bold', textTransform: 'uppercase' }}>Why Unsolved</span>
                              <p style={{ marginTop: '0.25rem', color: 'var(--text-dark)', fontSize: '0.95rem' }}>{g.why_unsolved}</p>
                            </div>
                          </div>

                          {suppPapers.length > 0 && (
                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                              <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>
                                Traceable Source Papers:
                              </span>
                              <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {suppPapers.map((sp, idx) => (
                                  <div key={idx} style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(10,15,30,0.5)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                      <strong style={{ color: 'var(--text-dark)', fontSize: '0.9rem' }}>{sp.title}</strong>
                                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Authors: {Array.isArray(sp.authors) ? sp.authors.slice(0, 3).join(', ') : 'Authors'} ({sp.year || 'Recent'})</span>
                                    </div>
                                    {sp.doi_url && (
                                      <a href={sp.doi_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>[Open Paper Link &rarr;]</a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: OPPORTUNITY DISCOVERY */}
          {currentStep === 5 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)' }}>Step 5: Research Opportunity Discovery</h2>
                  <p style={{ color: 'var(--text-gray)' }}>Justified pathways linking detected gaps with complementary technologies.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setCurrentStep(4)} className="btn btn-secondary">Back</button>
                  <button onClick={triggerFeasibilityStep} className="btn btn-primary">Next: Feasibility Analysis &rarr;</button>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {opportunities.map((o) => {
                  const suppPapers = o.supporting_papers || [];
                  return (
                    <div key={o.id || o._id} className="card" style={{ borderLeft: '4px solid var(--primary-blue)', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.25), rgba(13, 20, 38, 0.45))' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <span className="badge badge-medium">Opportunity Discovery</span>
                          <h3 style={{ color: 'var(--primary-blue)', fontSize: '1.3rem', margin: '0.4rem 0 0' }}>{o.title}</h3>
                        </div>
                      </div>

                      <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem', lineHeight: '1.6' }}><strong>Proposed Direction:</strong> {o.proposed_direction || o.problem_addressed}</p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                        <div>
                          <strong style={{ color: 'var(--accent-purple)', fontSize: '0.85rem' }}>Why This Domain?</strong>
                          <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>{o.why_this_domain || 'Provides proven foundations for handling constrained conditions.'}</p>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>Why This Technology?</strong>
                          <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>{o.why_this_technology || 'Directly addresses data and computational constraints.'}</p>
                        </div>
                      </div>

                      {suppPapers.length > 0 && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Supported by: <strong style={{ color: 'var(--text-dark)' }}>{suppPapers.map(s => s.title).slice(0, 2).join(', ')}</strong></span>
                          {suppPapers[0]?.doi_url && (
                            <a href={suppPapers[0].doi_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>[View Paper &rarr;]</a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: FEASIBILITY ANALYSIS */}
          {currentStep === 6 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)' }}>Step 6: Feasibility Analysis</h2>
                  <p style={{ color: 'var(--text-gray)' }}>Multi-factor feasibility scores mapped directly to target opportunities.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setCurrentStep(5)} className="btn btn-secondary">Back</button>
                  <button onClick={triggerRankingStep} className="btn btn-primary">Next: Quantum Ranking &rarr;</button>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '2rem' }}>
                {opportunities.map((o) => (
                  <div key={o.id || o._id} className="card" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.3), rgba(15, 23, 42, 0.5))' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-dark)', fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>{o.title}</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                      <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>Dataset Availability: <strong>{o.feasibility?.dataset_availability || 8}/10</strong></span>
                      </div>
                      <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>Technical Complexity: <strong>{o.feasibility?.technical_complexity || 7}/10</strong></span>
                      </div>
                      <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>Practical Applicability: <strong>{o.feasibility?.practical_applicability || 8}/10</strong></span>
                      </div>
                      <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>Expected Impact: <strong>{o.feasibility?.expected_impact || 9}/10</strong></span>
                      </div>
                    </div>

                    <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1rem' }}>Overall Feasibility Score: <strong style={{ color: 'var(--primary-blue)' }}>{o.feasibility?.overall_score || 8}/10</strong></span>
                      <span style={{ padding: '0.4rem 1rem', background: 'linear-gradient(to right, var(--accent-purple), var(--accent-pink))', borderRadius: '2rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Quantum Rank: {o.rank_score}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7: QUANTUM RANKING */}
          {currentStep === 7 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)' }}>Step 7: Quantum-Inspired Ranking & Traceability</h2>
                  <p style={{ color: 'var(--text-gray)' }}>Leaderboard of opportunities with explainable metric rationale and paper links.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setCurrentStep(6)} className="btn btn-secondary">Back</button>
                  <button onClick={() => navigate('/app/dashboard')} className="btn btn-primary" style={{ background: 'linear-gradient(to right, var(--accent-purple), var(--accent-pink))' }}>Finish to Dashboard 🚀</button>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {[...opportunities].sort((a,b) => b.rank_score - a.rank_score).map((o, idx) => {
                  const suppPapers = o.supporting_papers || [];
                  return (
                    <div key={o.id || o._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: idx === 0 ? 'linear-gradient(to right, rgba(139, 92, 246, 0.12), rgba(15, 23, 42, 0.6))' : 'var(--card-bg)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ 
                          fontSize: '1.6rem', 
                          fontWeight: 'bold', 
                          color: idx === 0 ? 'var(--accent-pink)' : 'var(--primary-blue)', 
                          width: '55px', 
                          height: '55px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(0,0,0,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: idx === 0 ? '2px solid var(--accent-pink)' : '1px solid var(--border-color)'
                        }}>
                          #{idx + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ marginBottom: '0.25rem', fontSize: '1.2rem' }}>{o.title}</h3>
                          <p style={{ fontSize: '0.95rem', color: 'var(--text-gray)', margin: 0 }}>{o.proposed_direction || o.problem_addressed}</p>
                        </div>
                        <div style={{ textAlign: 'right', minWidth: '120px' }}>
                          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: idx === 0 ? 'var(--accent-pink)' : 'var(--primary-blue)' }}>{o.rank_score}/10</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Quantum Score</span>
                        </div>
                      </div>

                      <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '0.85rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span><strong>Ranking Rationale:</strong> {o.ranking_rationale}</span>
                        {suppPapers.length > 0 && suppPapers[0].doi_url && (
                          <a href={suppPapers[0].doi_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>[View Supporting Paper &rarr;]</a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Pipeline;
