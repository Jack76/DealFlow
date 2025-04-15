import React from 'react';
import '../styles/health-indicator.css';

const HealthIndicator = ({ score }) => {
  const getHealthColor = (score) => {
    if (score >= 70) return '#34A853';
    if (score >= 40) return '#FBBC05';
    return '#EA4335';
  };

  return (
    <div className="health-indicator-probability">
      <div className="probability-bar">
        <div 
          className="probability-fill" 
          style={{ 
            width: `${score}%`,
            backgroundColor: getHealthColor(score)
          }}
        ></div>
        <span>{score}%</span>
      </div>
    </div>
  );
};

export default HealthIndicator;