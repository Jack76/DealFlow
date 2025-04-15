import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar, fontSize, color }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      {isOpen ? (
        <>
          <div className="sidebar-header">
            <h3 className="sidebar-title">Recent Deals</h3>
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              <span className="material-icons">close</span>
            </button>
          </div>
          <ul className="sidebar-list">
            <li className="sidebar-item">
              <Link to="/deal/1" className="sidebar-link">
                Acme Corp - $120K
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/deal/2" className="sidebar-link">
                Beta Inc - $85K
              </Link>
            </li>
          </ul>
        </>
      ) : (
        <button className="sidebar-toggle-expand" onClick={toggleSidebar}>
          <span className="material-icons">chevron_right</span>
        </button>
      )}
    </div>
  );
};

export default Sidebar;