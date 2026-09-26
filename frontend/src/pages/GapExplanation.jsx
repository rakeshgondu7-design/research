import { useLocation, useNavigate } from 'react-router-dom';

const GapExplanation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const gap = location.state?.gap;

  if (!gap) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <p style={{ color: 'var(--text-gray)', marginBottom: '1.5rem' }}>No research gap selected for explanation.</p>
        <button className="btn-primary" onClick={() => navigate('/app/gaps')}>Return to Gaps</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/app/gaps')} 
        style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer', marginBottom: '2.5rem', fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.2s' }}
        onMouseEnter={(e) => e.target.style.color = 'var(--primary-blue)'}
        onMouseLeave={(e) => e.target.style.color = 'var(--text-gray)'}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Back to Gap Detection
      </button>

      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="badge badge-medium" style={{ marginBottom: '1rem', display: 'inline-block', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-purple)', border: '1px solid rgba(99,102,241,0.2)' }}>
            {gap.gap_type || 'Research Gap'}
          </span>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--text-dark)', lineHeight: '1.3' }}>{gap.title}</h2>
        </div>
        
        {gap.confidence_score !== undefined && (
          <div style={{ textAlign: 'right', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid var(--border-color)', minWidth: '120px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Confidence</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: gap.confidence_score > 80 ? 'var(--accent-cyan)' : 'var(--accent-pink)' }}>
              {gap.confidence_score}%
            </div>
          </div>
        )}
      </div>
      
      <div className="card animate-slide-up" style={{ padding: '2.5rem', borderLeft: '4px solid var(--accent-purple)', animationDelay: '0.05s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: '8px', color: 'var(--accent-purple)' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h3 style={{ color: 'var(--text-dark)', margin: 0, fontSize: '1.25rem' }}>1. What is the gap?</h3>
        </div>
        <p style={{ color: 'var(--text-gray)', lineHeight: '1.7', fontSize: '1.05rem' }}>{gap.description}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card animate-slide-up" style={{ padding: '2.5rem', borderTop: '4px solid var(--accent-pink)', animationDelay: '0.1s', marginBottom: 0 }}>
          <h3 style={{ color: 'var(--text-dark)', margin: 0, fontSize: '1.1rem', marginBottom: '1rem' }}>2. Why does this gap exist?</h3>
          <p style={{ color: 'var(--text-gray)', lineHeight: '1.7', fontSize: '0.95rem' }}>{gap.why_it_exists}</p>
        </div>

        <div className="card animate-slide-up" style={{ padding: '2.5rem', borderTop: '4px solid var(--primary-blue)', animationDelay: '0.15s', marginBottom: 0 }}>
          <h3 style={{ color: 'var(--text-dark)', margin: 0, fontSize: '1.1rem', marginBottom: '1rem' }}>3. What have previous researchers attempted?</h3>
          <p style={{ color: 'var(--text-gray)', lineHeight: '1.7', fontSize: '0.95rem' }}>{gap.previous_attempts || 'Researchers primarily focused on baseline approaches without adequately resolving underlying constraints.'}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card animate-slide-up" style={{ padding: '2.5rem', borderTop: '4px solid var(--accent-cyan)', animationDelay: '0.2s', marginBottom: 0 }}>
          <h3 style={{ color: 'var(--text-dark)', margin: 0, fontSize: '1.1rem', marginBottom: '1rem' }}>4. Why is it still unresolved?</h3>
          <p style={{ color: 'var(--text-gray)', lineHeight: '1.7', fontSize: '0.95rem' }}>{gap.why_unsolved}</p>
        </div>

        <div className="card animate-slide-up" style={{ padding: '2.5rem', borderTop: '4px solid #10b981', animationDelay: '0.25s', marginBottom: 0 }}>
          <h3 style={{ color: 'var(--text-dark)', margin: 0, fontSize: '1.1rem', marginBottom: '1rem' }}>5. Potential Research Direction</h3>
          <p style={{ color: 'var(--text-gray)', lineHeight: '1.7', fontSize: '0.95rem' }}>{gap.potential_direction || 'Future research should explore novel architectures or data combinations that bypass the identified constraints.'}</p>
        </div>
      </div>

      <div className="card animate-slide-up" style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))', animationDelay: '0.3s' }}>
        <h3 style={{ color: 'var(--text-dark)', marginBottom: '1.5rem', fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>6. Supporting Evidence</h3>
        {gap.evidence && gap.evidence.length > 0 ? (
          gap.evidence.map((ev, idx) => (
            <div key={idx} style={{ marginBottom: idx === gap.evidence.length - 1 ? 0 : '1.5rem', padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--primary-blue)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '0.2rem' }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <div>
                  <p style={{ fontWeight: '600', color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>{ev.paper_title}</p>
                  <p style={{ fontStyle: 'italic', color: 'var(--text-gray)', lineHeight: '1.6', fontSize: '0.95rem' }}>"{ev.excerpt}"</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: 'var(--text-gray)', fontStyle: 'italic' }}>No explicit text excerpts linked to this gap.</p>
        )}
      </div>
    </div>
  );
};

export default GapExplanation;
