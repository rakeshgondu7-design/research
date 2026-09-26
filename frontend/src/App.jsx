import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import UserInput from './pages/UserInput';
import Pipeline from './pages/Pipeline';
import Dashboard from './pages/Dashboard';
import ResearchGaps from './pages/ResearchGaps';
import GapExplanation from './pages/GapExplanation';
import ResearchOpportunities from './pages/ResearchOpportunities';
import FeasibilityAnalysis from './pages/FeasibilityAnalysis';
import Ranking from './pages/Ranking';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ children }) => {
  const token = Cookies.get('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<UserInput />} />
          <Route path="pipeline/:projectId" element={<Pipeline />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="gaps" element={<ResearchGaps />} />
          <Route path="gaps/:gapId" element={<GapExplanation />} />
          <Route path="opportunities" element={<ResearchOpportunities />} />
          <Route path="feasibility" element={<FeasibilityAnalysis />} />
          <Route path="ranking" element={<Ranking />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;