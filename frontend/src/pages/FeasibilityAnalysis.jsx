import { useState, useEffect } from 'react';
import api from '../services/api';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

ChartJS.defaults.color = '#94a3b8';
ChartJS.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

const FeasibilityAnalysis = () => {
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

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
      }
    },
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: { display: false, stepSize: 2 },
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
        pointLabels: {
          color: '#cbd5e1',
          font: { size: 11, weight: '600' }
        }
      }
    }
  };

  const getChartData = (feasibility) => ({
    labels: ['Dataset', 'Technical', 'Time', 'Infrastructure', 'Novelty', 'Implementation', 'Applicability', 'Impact'],
    datasets: [
      {
        label: 'Feasibility Score',
        data: [
          feasibility.dataset_availability || 7,
          feasibility.technical_complexity || 8,
          feasibility.time_requirements || 7,
          feasibility.infrastructure_requirements || 6,
          feasibility.novelty_score || 8,
          feasibility.implementation_difficulty || 7,
          feasibility.practical_applicability || 8,
          feasibility.expected_impact || 9
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.25)',
        borderColor: 'rgba(99, 102, 241, 0.95)',
        pointBackgroundColor: '#ec4899',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#ec4899',
        borderWidth: 2,
        tension: 0.2,
      },
    ],
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)' }}>Multi-Factor Feasibility Analysis</h2>
          <p style={{ color: 'var(--text-gray)' }}>Radar evaluation mapping practical execution requirements and technical trade-offs.</p>
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
          {[1, 2].map(n => (
            <div key={n} className="card skeleton" style={{ height: '300px' }}></div>
          ))}
        </div>
      ) : opportunities.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="animate-slide-up">
          {opportunities.map((opp, idx) => (
            <div key={opp._id || opp.id} className="card" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <span className="badge badge-low" style={{ marginBottom: '0.5rem' }}>Feasibility Map</span>
                  <h3 style={{ fontSize: '1.35rem', color: 'var(--text-dark)', margin: 0 }}>{opp.title}</h3>
                </div>
                {opp.feasibility && (
                  <div style={{ textAlign: 'right', backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.6rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Score</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: opp.feasibility.overall_score > 7 ? 'var(--accent-cyan)' : 'var(--accent-pink)' }}>
                      {opp.feasibility.overall_score}/10
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                {/* Radar Chart Container */}
                <div style={{ height: '280px', position: 'relative' }}>
                  {opp.feasibility ? (
                    <Radar data={getChartData(opp.feasibility)} options={chartOptions} />
                  ) : <p style={{ color: 'var(--text-gray)' }}>No chart data.</p>}
                </div>

                {/* Factors & Rationale */}
                <div>
                  <h4 style={{ color: 'var(--text-dark)', marginBottom: '1rem', fontSize: '1.05rem' }}>Execution Evaluation Breakdown</h4>
                  
                  {opp.feasibility?.strengths && opp.feasibility.strengths.length > 0 && (
                    <div style={{ marginBottom: '1.25rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                      <strong style={{ color: '#10b981', fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>✓ Key Feasibility Advantages:</strong>
                      <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-gray)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        {opp.feasibility.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}

                  {opp.feasibility?.risks && opp.feasibility.risks.length > 0 && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                      <strong style={{ color: '#f87171', fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>⚠ Implementation Bottlenecks:</strong>
                      <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-gray)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        {opp.feasibility.risks.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-gray)' }}>
          <p>No feasibility analysis available. Please select a topic.</p>
        </div>
      )}
    </div>
  );
};

export default FeasibilityAnalysis;
