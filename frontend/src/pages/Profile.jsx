import { useState, useEffect } from 'react';
import api from '../services/api';

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!user) return <p>Loading profile...</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Profile Overview</h2>
      
      <div className="card" style={{ marginTop: '2rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <div style={{ 
          width: '100px', 
          height: '100px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--primary-blue)', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '3rem',
          fontWeight: 'bold'
        }}>
          {user.full_name.charAt(0).toUpperCase()}
        </div>
        
        <div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{user.full_name}</h3>
          <p style={{ color: 'var(--text-gray)', marginBottom: '1rem' }}>{user.email}</p>
          <p style={{ fontSize: '0.9rem' }}>Member since: {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
