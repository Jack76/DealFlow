import React from 'react';
import '../styles/components.css';

const Button = ({ label, onClick, fontSize, color, backgroundColor, className = '', icon, type = 'button' }) => {
  return (
    <button 
      type={type}
      className={`button ${className}`}
      onClick={onClick}
      style={{ fontSize, color, backgroundColor }}
    >
      {icon && <span className="material-icons">{icon}</span>}
      {label}
    </button>
  );
};

export default Button;