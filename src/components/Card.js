import React from 'react';
import '../styles/components.css';

const Card = ({ children, className = '', title, icon, actions }) => {
  return (
    <div className={`card ${className}`}>
      {(title || actions) && (
        <div className="card-header">
          {title && (
            <h3 className="card-title">
              {icon && <span className="material-icons">{icon}</span>}
              {title}
            </h3>
          )}
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-content">{children}</div>
    </div>
  );
};

export default Card;