import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Card from '../components/Card';
import HealthIndicator from '../components/HealthIndicator';
import Button from '../components/Button';
import '../styles/deals.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Deals = () => {
  const [deals] = useState([
    { id: 1, name: 'Acme Corporation', amount: 120000, stage: 'Proposal', owner: 'John Smith', lastActivity: '2 days ago', nextStep: 'Send contract', warningSigns: ['Price sensitivity', 'Competitor mentioned'], forecastStatus: 'Commit', closeDate: '2025-04-15', daysInStage: 14, probability: 70, calls: 3, emails: 5, healthScore: 75 },
    { id: 2, name: 'Beta Technologies', amount: 85000, stage: 'Discovery', owner: 'Sarah Johnson', lastActivity: 'Yesterday', nextStep: 'Schedule demo', warningSigns: ['Delayed responses'], forecastStatus: 'Best Case', closeDate: '2025-05-01', daysInStage: 7, probability: 40, calls: 2, emails: 3, healthScore: 55 },
    { id: 3, name: 'Gamma Solutions', amount: 250000, stage: 'Negotiation', owner: 'Mike Chen', lastActivity: 'Today', nextStep: 'Review terms', warningSigns: [], forecastStatus: 'Commit', closeDate: '2025-03-30', daysInStage: 5, probability: 85, calls: 5, emails: 8, healthScore: 90 },
  ]);

  const [filters, setFilters] = useState({ stage: '', forecast: '', search: '', warningOnly: false, minAmount: '', maxAmount: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'amount', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [selectedDeals, setSelectedDeals] = useState([]);
  const [viewMode, setViewMode] = useState('list');

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  const getStageColor = (stage) => ({ Discovery: '#4285F4', Proposal: '#FBBC05', Negotiation: '#34A853', 'Closed Won': '#0B8043', 'Closed Lost': '#EA4335' }[stage] || '#5F6368');

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setCurrentPage(1);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedDeals = useMemo(() => {
    return [...deals].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [deals, sortConfig]);

  const filteredDeals = useMemo(() => {
    return sortedDeals.filter(deal => {
      const matchesStage = !filters.stage || deal.stage === filters.stage;
      const matchesForecast = !filters.forecast || deal.forecastStatus === filters.forecast;
      const matchesSearch = !filters.search || deal.name.toLowerCase().includes(filters.search.toLowerCase()) || deal.owner.toLowerCase().includes(filters.search.toLowerCase());
      const matchesWarning = !filters.warningOnly || deal.warningSigns.length > 0;
      const matchesMinAmount = !filters.minAmount || deal.amount >= Number(filters.minAmount);
      const matchesMaxAmount = !filters.maxAmount || deal.amount <= Number(filters.maxAmount);
      return matchesStage && matchesForecast && matchesSearch && matchesWarning && matchesMinAmount && matchesMaxAmount;
    });
  }, [sortedDeals, filters]);

  const totalPages = Math.ceil(filteredDeals.length / rowsPerPage);
  const paginatedDeals = filteredDeals.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const toggleSelectDeal = (id) => setSelectedDeals(prev => prev.includes(id) ? prev.filter(dealId => dealId !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelectedDeals(selectedDeals.length === paginatedDeals.length ? [] : paginatedDeals.map(deal => deal.id));

  const pipelineData = {
    labels: ['Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
    datasets: [{
      data: [
        deals.filter(d => d.stage === 'Discovery').length,
        deals.filter(d => d.stage === 'Proposal').length,
        deals.filter(d => d.stage === 'Negotiation').length,
        deals.filter(d => d.stage === 'Closed Won').length,
        deals.filter(d => d.stage === 'Closed Lost').length
      ],
      backgroundColor: ['#4285F4', '#FBBC05', '#34A853', '#0B8043', '#EA4335'],
      borderWidth: 0
    }]
  };

  const doughnutOptions = {
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 20,
          padding: 15,
          font: {
            size: 14
          }
        }
      }
    }
  };

  return (
    <div className="deals-modern-container">
      <div className="deals-header">
        <div className="header-left">
          <h2 className="page-title">Deals Pipeline</h2>
          <div className="view-toggle">
            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><span className="material-icons">view_list</span></button>
            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><span className="material-icons">grid_view</span></button>
          </div>
        </div>
        <div className="header-right">
          <Button label="New Deal" icon="add" className="primary" />
          {selectedDeals.length > 0 && (
            <div className="bulk-actions">
              <Button label="Edit" icon="edit" className="secondary" />
              <Button label="Delete" icon="delete" className="secondary danger" />
            </div>
          )}
        </div>
      </div>

      <div className="metrics-grid">
        <Card title="Total Pipeline" icon="monetization_on"><div className="metric-value">{formatCurrency(deals.reduce((sum, deal) => sum + deal.amount, 0))}</div></Card>
        <Card title="Weighted Pipeline" icon="trending_up"><div className="metric-value">{formatCurrency(deals.reduce((sum, deal) => sum + (deal.amount * deal.probability / 100), 0))}</div></Card>
        <Card title="At Risk" icon="warning"><div className="metric-value">{deals.filter(d => d.warningSigns.length > 0).length} Deals</div></Card>
        <Card title="Stage Distribution" icon="pie_chart"><div className="chart-container"><Doughnut data={pipelineData} options={doughnutOptions} /></div></Card>
      </div>

      <div className="filters-section">
        <div className="search-container">
          <span className="search-icon material-icons">search</span>
          <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search deals..." className="search-input" />
        </div>
        <div className="filter-group">
          <select name="stage" value={filters.stage} onChange={handleFilterChange} className="filter-select">
            <option value="">All Stages</option>
            <option value="Discovery">Discovery</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Closed Won">Closed Won</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>
          <select name="forecast" value={filters.forecast} onChange={handleFilterChange} className="filter-select">
            <option value="">All Forecasts</option>
            <option value="Commit">Commit</option>
            <option value="Best Case">Best Case</option>
            <option value="Pipeline">Pipeline</option>
            <option value="Omitted">Omitted</option>
          </select>
          <div className="amount-range">
            <input type="number" name="minAmount" value={filters.minAmount} onChange={handleFilterChange} placeholder="Min amount" className="amount-input" />
            <span>-</span>
            <input type="number" name="maxAmount" value={filters.maxAmount} onChange={handleFilterChange} placeholder="Max amount" className="amount-input" />
          </div>
          <label className="filter-checkbox">
            <input type="checkbox" name="warningOnly" checked={filters.warningOnly} onChange={handleFilterChange} />
            <span className="checkbox-label">Show Warnings Only</span>
          </label>
        </div>
      </div>

      {viewMode === 'list' ? (
        <Card className="table-card">
          <table className="deals-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}><input type="checkbox" checked={selectedDeals.length === paginatedDeals.length && paginatedDeals.length > 0} onChange={toggleSelectAll} /></th>
                <th onClick={() => requestSort('name')}><div className="table-header">Deal Name<span className="material-icons sort-icon">{sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div></th>
                <th onClick={() => requestSort('amount')}><div className="table-header">Amount<span className="material-icons sort-icon">{sortConfig.key === 'amount' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div></th>
                <th onClick={() => requestSort('stage')}><div className="table-header">Stage<span className="material-icons sort-icon">{sortConfig.key === 'stage' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div></th>
                <th>Health</th>
                <th onClick={() => requestSort('closeDate')}><div className="table-header">Close Date<span className="material-icons sort-icon">{sortConfig.key === 'closeDate' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div></th>
                <th>Owner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDeals.map(deal => (
                <tr key={deal.id} className="deals-row">
                  <td><input type="checkbox" checked={selectedDeals.includes(deal.id)} onChange={() => toggleSelectDeal(deal.id)} /></td>
                  <td><Link to={`/deal/${deal.id}`} className="deal-link">{deal.name}</Link><div className="deal-subtext">{deal.nextStep}</div></td>
                  <td><div className="deal-amount">{formatCurrency(deal.amount)}<div className="probability-badge">{deal.probability}%</div></div></td>
                  <td><div className="stage-indicator"><span className="stage-dot" style={{ backgroundColor: getStageColor(deal.stage) }}></span>{deal.stage}<span className="days-in-stage">({deal.daysInStage}d)</span></div></td>
                  <td><div className="health-indicator-container"><HealthIndicator score={deal.healthScore} /></div></td>
                  <td><div className="date-cell"><span className="material-icons">event</span>{new Date(deal.closeDate).toLocaleDateString()}</div></td>
                  <td><div className="owner-cell"><span className="material-icons">person</span>{deal.owner}</div></td>
                  <td><div className="action-buttons"><Button icon="email" className="icon-button" /><Button icon="edit" className="icon-button" /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="deals-grid">
          {paginatedDeals.map(deal => (
            <Card key={deal.id} className="deal-card">
              <div className="card-header">
                <input type="checkbox" checked={selectedDeals.includes(deal.id)} onChange={() => toggleSelectDeal(deal.id)} />
                <h3 className="deal-name"><Link to={`/deal/${deal.id}`}>{deal.name}</Link></h3>
                <div className="deal-amount">{formatCurrency(deal.amount)}</div>
              </div>
              <div className="card-body">
                <div className="deal-meta">
                  <div className="stage-indicator"><span className="stage-dot" style={{ backgroundColor: getStageColor(deal.stage) }}></span>{deal.stage}</div>
                  <HealthIndicator score={deal.healthScore} />
                </div>
                <div className="deal-details">
                  <div className="detail-item"><span className="material-icons">person</span>{deal.owner}</div>
                  <div className="detail-item"><span className="material-icons">event</span>{new Date(deal.closeDate).toLocaleDateString()}</div>
                  <div className="detail-item"><span className="material-icons">call</span>{deal.calls} calls</div>
                </div>
                <div className="next-step"><span className="material-icons">arrow_forward</span>{deal.nextStep}</div>
              </div>
              <div className="card-footer">
                <Button label="Email" icon="email" className="small" />
                <Button label="Edit" icon="edit" className="small primary" />
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="deals-footer">
        <div className="results-count">Showing {(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filteredDeals.length)} of {filteredDeals.length} deals</div>
        <div className="pagination-controls">
          <button className="pagination-button" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}><span className="material-icons">chevron_left</span></button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
            return (
              <button key={pageNum} className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`} onClick={() => setCurrentPage(pageNum)}>{pageNum}</button>
            );
          })}
          {totalPages > 5 && currentPage < totalPages - 2 && <span className="pagination-ellipsis">...</span>}
          {totalPages > 5 && currentPage < totalPages - 2 && <button className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`} onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>}
          <button className="pagination-button" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}><span className="material-icons">chevron_right</span></button>
        </div>
      </div>
    </div>
  );
};

export default Deals;