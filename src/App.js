import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Deals from './pages/Deals';
import Insights from './pages/Insights';
import Automation from './pages/AutomationList';
import AutomationEditor from './pages/AutomationEditorModal';
import DealDetail from './pages/DealDetail';
import './styles/global.css';

const Forecast = () => <div>Forecast Page (Coming Soon)</div>;
const Engage = () => <div>Engage Page (Coming Soon)</div>;
const People = () => <div>People Page (Coming Soon)</div>;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogin = () => setIsLoggedIn(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <Router>
      <div>
        {isLoggedIn ? (
          <>
            <Navbar />
            <div style={{ display: 'flex' }}>
              <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
              <div className={`page-container ${isSidebarOpen ? '' : 'sidebar-closed'}`} style={{ flexGrow: 1, padding: '20px', marginTop: '70px' }}>
                <Routes>
                  <Route path="/deals" element={<Deals />} />
                  <Route path="/forecast" element={<Forecast />} />
                  <Route path="/engage" element={<Engage />} />
                  <Route path="/people" element={<People />} />
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/automation" element={<Automation />} />
                  <Route path="/automation/new" element={<AutomationEditor />} />
                  <Route path="/automation/:id" element={<AutomationEditor />} />
                  <Route path="/deal/:id" element={<DealDetail />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="*" element={<Navigate to="/deals" />} />
                </Routes>
              </div>
            </div>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;