import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import AutomationEditorModal from './AutomationEditorModal';
import WorkflowCreationChoiceModal from '../components/WorkflowCreationChoiceModal';
import { ReactFlowProvider } from 'reactflow';
import '../styles/automation-list.css';
import workflowTemplates from './workflowTemplates.json';



// 模拟API调用（需替换为真实后端接口）
const fetchWorkflows = async () => {
  return [
    { id: '1', name: 'Welcome Campaign', status: 'Active', lastRun: '2025-04-03', successRate: 98, triggers: ['User Registers'], actions: 3, lastModified: '2025-04-02' },
    { id: '2', name: 'Re-engagement Flow', status: 'Draft', lastRun: 'N/A', successRate: 0, triggers: ['Inactivity > 30d'], actions: 5, lastModified: '2025-03-28' },
  ];
};

const saveWorkflow = async (workflow) => {
  console.log('Saving workflow to backend:', workflow);
  return { ...workflow, id: workflow.id === 'new' ? `${Date.now()}` : workflow.id };
};

// 筛选和排序逻辑抽取
const filterWorkflows = (workflows, filters) => {
  return workflows.filter((workflow) => {
    const matchesSearch =
      !filters.search ||
      workflow.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      workflow.triggers.some((t) => t.toLowerCase().includes(filters.search.toLowerCase()));
    const matchesStatus = !filters.status || workflow.status === filters.status;
    const matchesTrigger = !filters.trigger || workflow.triggers.includes(filters.trigger);
    const matchesMinSuccess = !filters.minSuccessRate || workflow.successRate >= Number(filters.minSuccessRate);
    const matchesMaxSuccess = !filters.maxSuccessRate || workflow.successRate <= Number(filters.maxSuccessRate);
    return matchesSearch && matchesStatus && matchesTrigger && matchesMinSuccess && matchesMaxSuccess;
  });
};

const sortWorkflows = (workflows, { key, direction }) => {
  return [...workflows].sort((a, b) => {
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

const AutomationList = () => {
    const [workflows, setWorkflows] = useState([]);
    const [filters, setFilters] = useState({ search: '', status: '', trigger: '', minSuccessRate: '', maxSuccessRate: '' });
    const [sortConfig, setSortConfig] = useState({ key: 'lastModified', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(5);
    const [selectedWorkflows, setSelectedWorkflows] = useState([]);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [templates, setTemplates] = useState(workflowTemplates);

  // 初始化数据
  useEffect(() => {
    fetchWorkflows().then(setWorkflows);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedWorkflows = useMemo(() => sortWorkflows(workflows, sortConfig), [workflows, sortConfig]);
  const filteredWorkflows = useMemo(() => filterWorkflows(sortedWorkflows, filters), [sortedWorkflows, filters]);
  const totalPages = Math.ceil(filteredWorkflows.length / rowsPerPage);
  const paginatedWorkflows = filteredWorkflows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const toggleSelectWorkflow = (id) => {
    setSelectedWorkflows((prev) =>
      prev.includes(id) ? prev.filter((wid) => wid !== id) : [...prev, id]
    );
  };
  const toggleSelectAll = () => {
    setSelectedWorkflows(
      selectedWorkflows.length === paginatedWorkflows.length ? [] : paginatedWorkflows.map((w) => w.id)
    );
  };

  const openEditor = (workflow = null) => {
    setSelectedWorkflow(workflow);
    setIsEditorOpen(true);
  };

  const createFromTemplate = (template) => {
    setSelectedWorkflow({ ...template, id: 'new', name: `${template.name} (Copy)` });
    setIsEditorOpen(true);
  };

  const handleDelete = () => {
    if (window.confirm(`确定删除 ${selectedWorkflows.length} 个工作流吗？`)) {
      setWorkflows((prev) => prev.filter((w) => !selectedWorkflows.includes(w.id)));
      setSelectedWorkflows([]);
    }
  };

  const toggleWorkflowStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w))
    );
  };

  const handleCreateChoice = (choice, aiPrompt, template) => {
    setIsChoiceModalOpen(false);
    
    let newWorkflow = {
      id: 'new',
      name: '新工作流',
      nodes: [],
      edges: [],
      status: 'Draft'
    };

    if (choice === 'blank') {
      newWorkflow.name = '空白工作流';
    } 
    else if (choice === 'template') {
      newWorkflow.name = template?.name || '模板工作流';
      newWorkflow.nodes = template?.nodes || [];
      newWorkflow.edges = template?.edges || [];
    }
    else if (choice === 'ai') {
      newWorkflow.name = 'AI生成工作流';
      newWorkflow.aiPrompt = aiPrompt;
    }

    setSelectedWorkflow(newWorkflow);
    setIsEditorOpen(true);
  };

  return (
    <div className="automation-list-container">
      <div className="list-header">
        <div className="header-left">
          <h2 className="page-title">Automation Workflows</h2>
        </div>
        <div className="header-right">
        <Button 
            label="新建工作流" 
            icon="add" 
            className="primary" 
            onClick={() => setIsChoiceModalOpen(true)} 
          />
          {selectedWorkflows.length > 0 && (
            <div className="bulk-actions">
              <Button label="Delete" icon="delete" className="secondary danger" onClick={handleDelete} />
            </div>
          )}
        </div>
      </div>

      <Card title="Default Templates" className="templates-card">
        <div className="templates-list">
          {templates.map((template) => (
            <div key={template.id} className="template-item" onClick={() => createFromTemplate(template)}>
              <span className="material-icons">description</span>
              {template.name}
            </div>
          ))}
        </div>
      </Card>

      <div className="filters-section">
        <div className="search-container">
          <span className="search-icon material-icons">search</span>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search workflows..."
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select name="status" value={filters.status} onChange={handleFilterChange} className="filter-select">
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Paused">Paused</option>
          </select>
          <select name="trigger" value={filters.trigger} onChange={handleFilterChange} className="filter-select">
            <option value="">All Triggers</option>
            <option value="User Registers">User Registers</option>
            <option value="Inactivity > 30d">Inactivity &gt; 30d</option>
          </select>
          <div className="success-rate-range">
            <input
              type="number"
              name="minSuccessRate"
              value={filters.minSuccessRate}
              onChange={handleFilterChange}
              placeholder="Min Success %"
              className="range-input"
            />
            <span>-</span>
            <input
              type="number"
              name="maxSuccessRate"
              value={filters.maxSuccessRate}
              onChange={handleFilterChange}
              placeholder="Max Success %"
              className="range-input"
            />
          </div>
        </div>
      </div>

      <Card className="table-card">
        <table className="workflows-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectedWorkflows.length === paginatedWorkflows.length && paginatedWorkflows.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th onClick={() => requestSort('name')}>
                <div className="table-header">
                  Name
                  <span className="material-icons sort-icon">
                    {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                  </span>
                </div>
              </th>
              <th>Status</th>
              <th onClick={() => requestSort('lastRun')}>
                <div className="table-header">
                  Last Run
                  <span className="material-icons sort-icon">
                    {sortConfig.key === 'lastRun' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                  </span>
                </div>
              </th>
              <th>Success Rate</th>
              <th>Triggers</th>
              <th>Actions</th>
              <th onClick={() => requestSort('lastModified')}>
                <div className="table-header">
                  Last Modified
                  <span className="material-icons sort-icon">
                    {sortConfig.key === 'lastModified' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                  </span>
                </div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedWorkflows.map((workflow) => (
              <tr key={workflow.id} className="workflow-row">
                <td>
                  <input
                    type="checkbox"
                    checked={selectedWorkflows.includes(workflow.id)}
                    onChange={() => toggleSelectWorkflow(workflow.id)}
                  />
                </td>
                <td>
                  <Link to="#" onClick={() => openEditor(workflow)} className="workflow-link">
                    {workflow.name}
                  </Link>
                </td>
                <td>
                  <span className={`status-badge ${workflow.status.toLowerCase()}`}>
                    {workflow.status}
                  </span>
                </td>
                <td>{workflow.lastRun}</td>
                <td>{workflow.successRate}%</td>
                <td>{workflow.triggers.join(', ')}</td>
                <td>{workflow.actions}</td>
                <td>{workflow.lastModified}</td>
                <td>
                  <div className="action-buttons">
                    <Button icon="edit" className="icon-button" onClick={() => openEditor(workflow)} />
                    <Button
                      icon={workflow.status === 'Active' ? 'pause' : 'play_arrow'}
                      className="icon-button"
                      onClick={() => toggleWorkflowStatus(workflow.id, workflow.status)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="list-footer">
        <div className="results-count">
          Showing {(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filteredWorkflows.length)} of {filteredWorkflows.length} workflows
        </div>
        <div className="pagination-controls">
          <button
            className="pagination-button"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <span className="material-icons">chevron_left</span>
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
            return (
              <button
                key={pageNum}
                className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          {totalPages > 5 && currentPage < totalPages - 2 && <span className="pagination-ellipsis">...</span>}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <button
              className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
              onClick={() => setCurrentPage(totalPages)}
            >
              {totalPages}
            </button>
          )}
          <button
            className="pagination-button"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <span className="material-icons">chevron_right</span>
          </button>
        </div>
      </div>

      {/* 将 ReactFlowProvider 移到这里，包裹 AutomationEditorModal */}
      {isEditorOpen && (
        <ReactFlowProvider>
          <AutomationEditorModal
            workflow={selectedWorkflow}
            onClose={() => setIsEditorOpen(false)}
            onSave={async (updatedWorkflow) => {
              const savedWorkflow = await saveWorkflow({
                ...updatedWorkflow,
                status: updatedWorkflow.status || 'Draft',
                lastRun: updatedWorkflow.lastRun || 'N/A',
                successRate: updatedWorkflow.successRate || 0,
                triggers: updatedWorkflow.nodes.filter(n => n.type === 'trigger').map(n => n.data.label),
                actions: updatedWorkflow.nodes.filter(n => n.type === 'action').length,
                lastModified: new Date().toISOString().split('T')[0],
              });
              setWorkflows((prev) =>
                savedWorkflow.id === 'new' || !prev.some(w => w.id === savedWorkflow.id)
                  ? [...prev, savedWorkflow]
                  : prev.map((w) => (w.id === savedWorkflow.id ? savedWorkflow : w))
              );
              setIsEditorOpen(false);
            }}
          />
        </ReactFlowProvider>
      )}

        {isChoiceModalOpen && (
        <WorkflowCreationChoiceModal
          onClose={() => setIsChoiceModalOpen(false)}
          onChoice={handleCreateChoice}
          templates={templates}
        />
      )}

      {isEditorOpen && (
        <ReactFlowProvider>
          <AutomationEditorModal
            workflow={selectedWorkflow}
            onClose={() => setIsEditorOpen(false)}
            onSave={async (updatedWorkflow) => {
              const savedWorkflow = await saveWorkflow({
                ...updatedWorkflow,
                status: updatedWorkflow.status || 'Draft',
                lastRun: updatedWorkflow.lastRun || 'N/A',
                successRate: updatedWorkflow.successRate || 0,
                triggers: updatedWorkflow.nodes.filter(n => n.type === 'trigger').map(n => n.data.label),
                actions: updatedWorkflow.nodes.filter(n => n.type === 'action').length,
                lastModified: new Date().toISOString().split('T')[0],
              });
              setWorkflows((prev) =>
                savedWorkflow.id === 'new' || !prev.some(w => w.id === savedWorkflow.id)
                  ? [...prev, savedWorkflow]
                  : prev.map((w) => (w.id === savedWorkflow.id ? savedWorkflow : w))
              );
              setIsEditorOpen(false);
            }}
          />
        </ReactFlowProvider>
      )}
    </div>
  );
};

export default AutomationList;