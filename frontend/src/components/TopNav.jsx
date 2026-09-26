import { useNavigate } from 'react-router-dom';
import { setAuthToken } from '../services/api';

const TopNav = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuthToken(null);
    navigate('/login');
  };

  return (
    <header className="top-nav">
      <div className="top-nav-left">
        <h3>Dashboard</h3>
      </div>
      <div className="top-nav-right">
        <button onClick={handleLogout} className="btn-primary" style={{ backgroundColor: 'transparent', color: 'var(--text-gray)', border: '1px solid var(--border-color)' }}>
          Logout
        </button>
        <div className="user-profile" onClick={() => navigate('/app/profile')}>
          <div className="avatar">U</div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
