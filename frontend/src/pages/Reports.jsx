import { useState, useEffect } from 'react';
import api from '../services/api';
import { jsPDF } from "jspdf";

const Reports = () => {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/projects/').then(res => {
      setProjects(res.data);
      if (res.data.length > 0) {
        setProjectId(res.data[res.data.length - 1].id || res.data[res.data.length - 1]._id);
      }
    });
  }, []);

  const fetchReport = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await api.get(`/analysis/${projectId}/report`);
      setReport(res.data);
    } catch (err) {
      console.error(err);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [projectId]);

  const downloadPDF = () => {
    if (!report) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("AI Research Intelligence Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date(report.generated_at).toLocaleDateString()}`, 20, 30);
    
    doc.setFontSize(14);
    doc.text("Common Themes:", 20, 45);
    doc.setFontSize(11);
    report.common_themes.forEach((theme, i) => doc.text(`- ${theme}`, 25, 55 + (i * 10)));
    
    doc.setFontSize(14);
    const yOffset = 55 + (report.common_themes.length * 10) + 15;
    doc.text("Existing Limitations:", 20, yOffset);
    doc.setFontSize(11);
    report.existing_limitations.forEach((limit, i) => doc.text(`- ${limit}`, 25, yOffset + 10 + (i * 10)));
    
    doc.save("AIRIP-Intelligence-Report.pdf");
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)' }}>Intelligence Reports</h2>
          <p style={{ color: 'var(--text-gray)' }}>View compiled literature insights and export formal academic summaries.</p>
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
        <div className="card skeleton animate-slide-up" style={{ height: '400px' }}></div>
      ) : report ? (
        <div className="animate-slide-up">
          <div className="card" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative background element */}
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                  Literature Synthesis Report
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                  Generated automatically on {new Date(report.generated_at).toLocaleDateString()}
                </span>
              </div>
              <button className="btn-primary" onClick={downloadPDF} style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Export PDF
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-blue)' }}></div>
                  <h4 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', margin: 0 }}>Common Themes</h4>
                </div>
                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-gray)', lineHeight: '1.8' }}>
                  {report.common_themes.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-purple)' }}></div>
                  <h4 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', margin: 0 }}>Research Methods</h4>
                </div>
                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-gray)', lineHeight: '1.8' }}>
                  {report.research_methods.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              
              <div style={{ gridColumn: '1 / -1', marginTop: '1rem', backgroundColor: 'rgba(0,0,0,0.15)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-pink)' }}></div>
                  <h4 style={{ color: 'var(--text-dark)', fontSize: '1.1rem', margin: 0 }}>Under-explored Areas & Limitations</h4>
                </div>
                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-gray)', lineHeight: '1.8' }}>
                  {report.under_explored_areas.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>

            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-gray)' }}>
          <p style={{ fontSize: '1.1rem' }}>Select a project to view its intelligence report.</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
