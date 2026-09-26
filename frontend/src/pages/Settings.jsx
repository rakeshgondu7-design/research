import { useState, useEffect } from 'react';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    // Check local storage for dark mode pref
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.body.classList.add('dark-mode');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    if (newMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Settings</h2>
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Appearance</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <p style={{ fontWeight: '500', color: 'var(--text-dark)' }}>Dark Mode</p>
            <p style={{ fontSize: '0.9rem' }}>Toggle dark mode appearance</p>
          </div>
          <button 
            onClick={toggleDarkMode}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '2rem', 
              border: 'none', 
              backgroundColor: darkMode ? 'var(--primary-blue)' : 'var(--border-color)',
              color: darkMode ? 'white' : 'var(--text-dark)',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background-color 0.3s'
            }}
          >
            {darkMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Preferences</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: '500', color: 'var(--text-dark)' }}>Email Notifications</p>
            <p style={{ fontSize: '0.9rem' }}>Receive updates about analysis progress</p>
          </div>
          <button 
            onClick={() => setNotifications(!notifications)}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '2rem', 
              border: 'none', 
              backgroundColor: notifications ? 'var(--primary-blue)' : 'var(--border-color)',
              color: notifications ? 'white' : 'var(--text-dark)',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background-color 0.3s'
            }}
          >
            {notifications ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
