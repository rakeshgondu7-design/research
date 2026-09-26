import { useNavigate } from 'react-router-dom';
import '../index.css';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center', 
      textAlign: 'center', 
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative premium background blobs */}
      <div style={{ position: 'absolute', top: '10%', left: '15%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', zIndex: 0 }}></div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px' }}>
        <div style={{ display: 'inline-block', padding: '0.5rem 1.5rem', borderRadius: '30px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem', color: 'var(--text-gray)', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Next-Generation Academic Analytics
        </div>
        
        <h1 className="animate-slide-up" style={{ fontSize: '4.5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
          AI-Powered <br />
          <span style={{ background: 'linear-gradient(135deg, var(--primary-blue), var(--accent-pink))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Research Intelligence
          </span>
        </h1>
        
        <p className="animate-slide-up" style={{ fontSize: '1.3rem', color: 'var(--text-gray)', marginBottom: '3.5rem', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto 3.5rem', animationDelay: '0.1s' }}>
          Instantly analyze existing literature, identify critical research gaps, discover cross-domain opportunities, and evaluate technical feasibility using advanced AI algorithms.
        </p>
        
        <div className="animate-slide-up" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', animationDelay: '0.2s' }}>
          <button className="btn-primary" onClick={() => navigate('/register')} style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem', borderRadius: '30px' }}>
            Get Started Free &rarr;
          </button>
          <button className="btn-secondary" onClick={() => navigate('/login')} style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem', borderRadius: '30px' }}>
            Login to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;