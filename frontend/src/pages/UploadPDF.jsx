import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const UploadPDF = () => {
  const [file, setFile] = useState(null);
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !topic) {
      setStatus('Please provide a fallback topic name and select a file.');
      return;
    }
    
    setIsUploading(true);
    setStatus('Creating analysis session...');
    
    try {
      // Create session first via generic search endpoint with a flag, or directly hit projects.
      // Since the backend /search runs everything automatically, for PDF we need to create project first.
      const projRes = await api.post('/projects/', { name: topic, topic: topic, description: `Uploaded PDF for ${topic}` });
      const projectId = projRes.data.id;
      
      setStatus('Uploading document...');
      const formData = new FormData();
      formData.append('file', file);
      
      await api.post(`/projects/${projectId}/papers`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setStatus('Document processed! Running intelligence pipeline...');
      await api.post(`/analysis/${projectId}/run`);
      
      setStatus('Complete! Redirecting to Dashboard...');
      setTimeout(() => navigate('/app'), 2000);
      
    } catch (err) {
      setStatus(err.response?.data?.detail || 'Upload failed.');
      setIsUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Upload Document</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--text-gray)' }}>Don't have a specific research topic? Upload a research paper or document and AIRIP will extract insights and opportunities directly from it.</p>
      
      <div className="card">
        <form onSubmit={handleUpload}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Contextual Topic Name</label>
            <input 
              type="text" 
              className="input-field" 
              value={topic} 
              onChange={e => setTopic(e.target.value)} 
              placeholder="e.g. AI in Agriculture"
              required
              disabled={isUploading}
            />
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Research Paper (PDF)</label>
            <input 
              type="file" 
              accept=".pdf" 
              className="input-field" 
              onChange={e => setFile(e.target.files[0])} 
              required
              disabled={isUploading}
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isUploading}>
            {isUploading ? 'Processing...' : 'Upload & Analyze Document'}
          </button>
        </form>
        {status && <p style={{ marginTop: '1.5rem', textAlign: 'center', fontWeight: '500', color: 'var(--accent-purple)' }}>{status}</p>}
      </div>
    </div>
  );
};

export default UploadPDF;
