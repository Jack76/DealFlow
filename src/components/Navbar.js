import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/navbar.css';
import '../styles/components.css';

const Navbar = () => {
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();

  const toggleQuickCreate = () => setIsQuickCreateOpen(!isQuickCreateOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  // 检查当前路径是否匹配导航项
  const isActive = (path) => {
    return location.pathname === path || 
           (path === '/insights' && location.pathname.startsWith('/insights')) ||
           (path === '/deals' && location.pathname.startsWith('/deal/'));
           (path === '/automation' && location.pathname.startsWith('/automation'));
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <div className="logo-mark">D</div>
            <span className="logo-text">DealFlow</span>
          </Link>
          <div className="main-nav">
            <Link to="/deals" className={`nav-item ${isActive('/deals') ? 'active' : ''}`}>
              Deals
              {isActive('/deals') && <span className="nav-indicator"></span>}
            </Link>
            <Link to="/forecast" className={`nav-item ${isActive('/forecast') ? 'active' : ''}`}>
              Forecast
              {isActive('/forecast') && <span className="nav-indicator"></span>}
            </Link>
            <Link to="/engage" className={`nav-item ${isActive('/engage') ? 'active' : ''}`}>
              Engage
              {isActive('/engage') && <span className="nav-indicator"></span>}
            </Link>
            <Link to="/people" className={`nav-item ${isActive('/people') ? 'active' : ''}`}>
              People
              {isActive('/people') && <span className="nav-indicator"></span>}
            </Link>
            <Link to="/insights" className={`nav-item ${isActive('/insights') ? 'active' : ''}`}>
              Insights
              {isActive('/insights') && <span className="nav-indicator"></span>}
            </Link>
            <Link to="/automation" className={`nav-item ${isActive('/automation') ? 'active' : ''}`}>
  Automation
  {isActive('/automation') && <span className="nav-indicator"></span>}
</Link>
          </div>
        </div>
        <div className="navbar-right">
          <div className="search-container">
            <span className="search-icon material-icons">search</span>
            <input type="text" placeholder="Search..." className="search-input" />
          </div>
          <div className="quick-create-container">
            <button className="button secondary search-aligned quick-create-btn" onClick={toggleQuickCreate}>
              <span className="material-icons">add</span>
              <span>Create</span>
            </button>
            {isQuickCreateOpen && (
              <div className="quick-create-menu">
                <Link to="/deal/new" className="quick-create-item"><span className="material-icons">business</span>New Deal</Link>
                <Link to="/contact/new" className="quick-create-item"><span className="material-icons">person</span>New Contact</Link>
                <Link to="/task/new" className="quick-create-item"><span className="material-icons">check_circle</span>New Task</Link>
              </div>
            )}
          </div>
          <div className="tool-icons">
            <button className="icon-btn"><span className="material-icons">notifications</span><span className="badge">3</span></button>
            <button className="icon-btn"><span className="material-icons">settings</span></button>
          </div>
          <div className="user-menu-container">
            <button className="user-btn" onClick={toggleUserMenu}>
              <span className="material-icons user-avatar">account_circle</span>
            </button>
            {isUserMenuOpen && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-name">John Doe</div>
                  <div className="user-email">john.doe@example.com</div>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/profile" className="dropdown-item">Profile</Link>
                <Link to="/settings" className="dropdown-item">Settings</Link>
                <Link to="/logout" className="dropdown-item">Logout</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;