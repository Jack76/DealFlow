import React from 'react';
import Card from '../components/Card';

const Dashboard = () => {
  return (
    <div className="page-container">
      <h2 className="page-title">Dashboard</h2>
      <div className="dashboard-grid">
        <Card title="Close Rate" value="65%" />
        <Card title="Avg. Deal Cycle" value="14 days" />
        <Card title="Customer Satisfaction" value="4.5/5" />
      </div>
    </div>
  );
};

export default Dashboard;