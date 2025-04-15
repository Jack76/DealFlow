import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Handle,
  useReactFlow,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Button from '../components/Button';
import AIPanel from '../components/AIPanel';
import '../styles/automation-editor.css';
import nodeDefinitions from './nodeDefinitions.json';





// 自定义节点类型保持不变
const nodeTypes = {
    trigger: ({ data }) => (
      <div className="custom-node trigger-node">
        <Handle type="target" position="top" id="top" style={{ background: '#555' }} />
        <span className="material-icons">play_circle</span>
        <div className="node-content">
          <div className="node-label">{data.label || '未命名触发器'}</div>
          <div className="node-summary">条件: {data.condition}</div>
        </div>
        <Handle type="source" position="bottom" id="bottom" style={{ background: '#555' }} />
      </div>
    ),
    action: ({ data }) => (
      <div className="custom-node action-node">
        <Handle type="target" position="top" id="top" style={{ background: '#555' }} />
        <span className="material-icons">bolt</span>
        <div className="node-content">
          <div className="node-label">{data.label || '未命名动作'}</div>
          <div className="node-summary">类型: {data.actionType}</div>
        </div>
        <Handle type="source" position="bottom" id="bottom" style={{ background: '#555' }} />
      </div>
    ),
    condition: ({ data }) => (
      <div className="custom-node condition-node">
        <Handle type="target" position="top" id="top" style={{ background: '#555' }} />
        <span className="material-icons">call_split</span>
        <div className="node-content">
          <div className="node-label">{data.label || '未命名条件'}</div>
          <div className="node-summary">逻辑: {data.logic}</div>
        </div>
        <Handle type="source" position="bottom" id="bottom" style={{ background: '#555' }} />
      </div>
    ),
    advanced: ({ data }) => (
      <div className="custom-node advanced-node">
        <Handle type="target" position="top" id="top" style={{ background: '#555' }} />
        <span className="material-icons">developer_board</span>
        <div className="node-content">
          <div className="node-label">{data.label || '未命名高级功能'}</div>
          <div className="node-summary">指标: {data.metric}</div>
        </div>
        <Handle type="source" position="bottom" id="bottom" style={{ background: '#555' }} />
      </div>
    ),
    crm: ({ data }) => (
      <div className="custom-node crm-node">
        <Handle type="target" position="top" />
        <span className="material-icons">group</span>
        <div className="node-content">
          <div className="node-label">{data.label}</div>
          <div className="node-summary">
            {data.logic === 'rfm' ? 
              `RFM: ${data.r}d/${data.f}次/¥${data.m}` : 
              `状态: ${data.from}→${data.to}`}
          </div>
        </div>
        <Handle type="source" position="bottom" />
      </div>
    ),
    ecommerce: ({ data }) => (
      <div className="custom-node ecommerce-node">
        <Handle type="target" position="top" />
        <span className="material-icons">shopping_cart</span>
        <div className="node-content">
          <div className="node-label">{data.label}</div>
          <div className="node-summary">
            {data.condition === 'abandoned_cart' ?
              `超时: ${data.timeout}` :
              `状态: ${data.status}`}
          </div>
        </div>
        <Handle type="source" position="bottom" />
      </div>
    )
  };
  
  const AutomationEditorModal = ({ workflow, onClose, onSave }) => {
    const { componentCategories, nodeSchemas } = nodeDefinitions;
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [workflowName, setWorkflowName] = useState(workflow?.name || '新工作流');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState({});
    const [notifications, setNotifications] = useState([]);
    const [showTemplates, setShowTemplates] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [aiPrompt, setAiPrompt] = useState(workflow?.aiPrompt || '');
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [isAILoading, setIsAILoading] = useState(false);
    const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  
    const { setCenter } = useReactFlow();

  useEffect(() => {
    if (workflow?.aiPrompt) {
        setIsAIPanelOpen(true);
        setAiPrompt(workflow.aiPrompt);
        // 自动触发AI生成
        setTimeout(() => {
          generateWithAI(workflow.aiPrompt);
        }, 500);
      }
  
  

    // 初始化节点
    if (workflow?.nodes && workflow?.edges) {
        setNodes(workflow.nodes);
        setEdges(workflow.edges);
      } else {
        setNodes([
          {
            id: '1',
            type: 'trigger',
            position: { x: 250, y: 50 },
            data: { label: '新触发器', condition: 'api_call' },
          },
        ]);
        setEdges([]);
      }

    const initialExpanded = componentCategories.reduce((acc, cat) => {
      acc[cat.name] = true;
      return acc;
    }, {});
    setExpandedCategories(initialExpanded);
  }, [workflow]);
  
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };


  
    const isValidConnection = useCallback(
      (connection) => {
        const sourceNode = nodes.find((n) => n.id === connection.source);
        const targetNode = nodes.find((n) => n.id === connection.target);
  
        const connectionRules = {
          trigger: { maxInputs: 0, maxOutputs: 1, allowedTargets: ['action', 'condition'] },
          action: { maxInputs: 1, allowedTargets: ['action', 'condition'] },
          condition: { maxInputs: 1, allowedTargets: ['action'] },
          advanced: { maxInputs: 1, allowedTargets: ['action', 'condition'] },
        };
  
        if (targetNode && connectionRules[targetNode.type]?.maxInputs !== undefined) {
          const inputCount = edges.filter((e) => e.target === targetNode.id).length;
          if (inputCount >= connectionRules[targetNode.type].maxInputs) {
            return {
              valid: false,
              message: `${targetNode.type}节点最多允许${connectionRules[targetNode.type].maxInputs}个输入连接`,
            };
          }
        }
  
        if (sourceNode && connectionRules[sourceNode.type]?.maxOutputs !== undefined) {
          const outputCount = edges.filter((e) => e.source === sourceNode.id).length;
          if (outputCount >= connectionRules[sourceNode.type].maxOutputs) {
            return {
              valid: false,
              message: `${sourceNode.type}节点最多允许${connectionRules[sourceNode.type].maxOutputs}个输出连接`,
            };
          }
        }
  
        if (sourceNode && targetNode && connectionRules[sourceNode.type]?.allowedTargets) {
          if (!connectionRules[sourceNode.type].allowedTargets.includes(targetNode.type)) {
            return {
              valid: false,
              message: `${sourceNode.type}节点不能连接到${targetNode.type}节点`,
            };
          }
        }

        // 新增业务规则验证
  if (sourceNode.type === 'crm' && targetNode.type === 'action') {
    if (sourceNode.data.logic === 'rfm' && 
        targetNode.data.actionType === 'coupon' &&
        sourceNode.data.m < 500) {
      return {
        valid: false,
        message: '低价值客户(RFM<500)不能直接发放优惠券'
      };
    }
  }

  if (sourceNode.type === 'ecommerce' && 
      targetNode.type === 'action' &&
      sourceNode.data.condition === 'abandoned_cart') {
    if (!nodes.some(n => n.type === 'condition' && 
                        n.data.logic === 'inventory_check')) {
      return {
        valid: false,
        message: '弃单流程需要先检查库存'
      };
    }
  }
  
        return { valid: true };
      },
      [nodes, edges]
    );
  
    const onConnect = useCallback(
      (params) => {
        const validation = isValidConnection(params);
        if (!validation.valid) {
          addNotification(validation.message, 'error');
          return;
        }
  
        const newEdge = {
          ...params,
          id: `e${params.source}-${params.target}`,
          type: 'smoothstep',
          animated: true,
        };
  
        setEdges((eds) => addEdge(newEdge, eds));
        addNotification('节点连接成功', 'success');
      },
      [isValidConnection, setEdges]
    );
  
    const onDragOver = useCallback((event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }, []);
  
    const onDrop = useCallback(
      (event) => {
        event.preventDefault();
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const itemData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
  
        const position = {
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        };
  
        const newNode = {
          id: `${Date.now()}`,
          type: itemData.type,
          position,
          data: { ...nodeSchemas[itemData.type], ...itemData.data },
        };
  
        setNodes((nds) => nds.concat(newNode));
        addNotification(`已添加节点: ${itemData.data.label}`, 'success');
      },
      [setNodes]
    );
  
    const saveAsTemplate = () => {
      const templateName = prompt('输入模板名称:');
      if (!templateName) return;
  
      const category = prompt('输入分类 (marketing/onboarding/other):', 'other');
      const newTemplate = {
        id: `tpl-${Date.now()}`,
        name: templateName,
        category,
        nodes,
        edges,
        createdAt: new Date().toISOString(),
      };
  
      setTemplates((prev) => [...prev, newTemplate]);
      addNotification(`模板 "${templateName}" 已保存`, 'success');
    };
  
    const generateWithAI = async () => {
        if (!aiPrompt.trim()) {
          addNotification('请输入AI生成提示词', 'error');
          return;
        }
      
        setIsAILoading(true);
        addNotification('AI正在生成完整工作流...', 'info');
      
        try {
          // 模拟API调用延迟
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // 根据提示词生成完整工作流
          const prompt = aiPrompt.toLowerCase();
          let newNodes = [];
          let newEdges = [];
          let baseX = 250;
          let baseY = 50;
      
          // 常见场景的工作流模板
          if (prompt.includes('欢迎') || prompt.includes('welcome')) {
            // 欢迎流程
            newNodes = [
              {
                id: 'ai-1',
                type: 'trigger',
                position: { x: baseX, y: baseY },
                data: { 
                  label: '新用户注册',
                  condition: 'user_register',
                  description: '当新用户完成注册时触发'
                }
              },
              {
                id: 'ai-2',
                type: 'action',
                position: { x: baseX, y: baseY + 150 },
                data: {
                  label: '发送欢迎邮件',
                  actionType: 'email',
                  subject: '欢迎加入我们!',
                  content: '感谢您的注册，这是您的专属欢迎内容...'
                }
              },
              {
                id: 'ai-3',
                type: 'action',
                position: { x: baseX, y: baseY + 300 },
                data: {
                  label: '添加CRM标签',
                  actionType: 'crm_tag',
                  tag: '新用户'
                }
              }
            ];
            newEdges = [
              { id: 'e-ai-1-2', source: 'ai-1', target: 'ai-2' },
              { id: 'e-ai-2-3', source: 'ai-2', target: 'ai-3' }
            ];
          } 
          else if (prompt.includes('购物车') || prompt.includes('cart')) {
            // 购物车弃单流程
            newNodes = [
              {
                id: 'ai-1',
                type: 'ecommerce',
                position: { x: baseX, y: baseY },
                data: {
                  label: '购物车弃单',
                  condition: 'abandoned_cart',
                  timeout: '1h'
                }
              },
              {
                id: 'ai-2',
                type: 'condition',
                position: { x: baseX, y: baseY + 150 },
                data: {
                  label: '检查商品库存',
                  logic: 'inventory_check'
                }
              },
              {
                id: 'ai-3',
                type: 'action',
                position: { x: baseX - 150, y: baseY + 300 },
                data: {
                  label: '库存充足时提醒',
                  actionType: 'push',
                  message: '您的购物车商品即将售罄，请尽快结账!'
                }
              },
              {
                id: 'ai-4',
                type: 'action',
                position: { x: baseX + 150, y: baseY + 300 },
                data: {
                  label: '库存不足时建议',
                  actionType: 'email',
                  subject: '您感兴趣的商品补货了',
                  content: '您购物车中的商品已补货...'
                }
              }
            ];
            newEdges = [
              { id: 'e-ai-1-2', source: 'ai-1', target: 'ai-2' },
              { id: 'e-ai-2-3', source: 'ai-2', target: 'ai-3', data: { condition: 'in_stock' } },
              { id: 'e-ai-2-4', source: 'ai-2', target: 'ai-4', data: { condition: 'out_of_stock' } }
            ];
          }
          else {
            // 默认生成一个简单的工作流
            newNodes = [
              {
                id: 'ai-1',
                type: 'trigger',
                position: { x: baseX, y: baseY },
                data: { 
                  label: '自定义触发',
                  condition: 'api_call',
                  description: '根据您的描述生成的触发节点'
                }
              },
              {
                id: 'ai-2',
                type: 'action',
                position: { x: baseX, y: baseY + 150 },
                data: {
                  label: '自定义动作',
                  actionType: 'api_call',
                  url: 'https://api.example.com/endpoint'
                }
              }
            ];
            newEdges = [
              { id: 'e-ai-1-2', source: 'ai-1', target: 'ai-2' }
            ];
          }
      
          // 应用生成的工作流
          setNodes(nds => [...nds, ...newNodes]);
          setEdges(eds => [...eds, ...newEdges]);
          
          // 自动聚焦到第一个节点
          if (newNodes.length > 0) {
            setSelectedNode(newNodes[0]);
            // 滚动到视图
            setCenter(baseX, baseY, { zoom: 0.8, duration: 800 });
          }
      
          addNotification('AI工作流生成成功', 'success');
        } catch (error) {
          addNotification('AI生成失败: ' + error.message, 'error');
        } finally {
          setIsAILoading(false);
        }
      };
  
      const applyAISuggestion = (suggestion) => {
        const newNode = {
          id: `ai-${Date.now()}`,
          type: suggestion.type,
          position: {
            x: Math.random() * 500,
            y: 100 + Math.random() * 300,
          },
          data: suggestion.data,
        };
    
        setNodes((nds) => [...nds, newNode]);
        setAiSuggestions([]);
        setAiPrompt(''); // 清空输入框
        addNotification(`已添加AI建议节点: ${suggestion.data.label}`, 'success');
      };
  
    const renderPropertyFields = (node) => {
        const schema = nodeSchemas[node.type];
        if (!schema?.fields) return null;
    
        return schema.fields.map((field) => {
          const shouldShow =
            !field.showIf ||
            Object.entries(field.showIf).every(([key, value]) => node.data[key] === value);
          if (!shouldShow) return null;
    
          return (
            <div key={field.name} className="property-field">
              <label>
                {field.name}
                {field.required && <span className="required">*</span>}
              </label>
              {field.type === 'select' ? (
                <select
                  value={node.data[field.name] || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    updateNodeData({ [field.name]: newValue });
                  }}
                  required={field.required}
                >
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={node.data[field.name] || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (field.pattern && !new RegExp(field.pattern).test(newValue)) {
                      addNotification(`无效的${field.name}格式`, 'error');
                      return;
                    }
                    updateNodeData({ [field.name]: newValue });
                  }}
                  required={field.required}
                  pattern={field.pattern ? field.pattern.source : undefined} // 确保 pattern 是字符串
                />
              )}
              {field.description && <div className="property-hint">{field.description}</div>}
            </div>
          );
        });
      };
  
    const updateNodeData = (newData) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode?.id ? { ...n, data: { ...n.data, ...newData } } : n
      )
    );
    // 同步更新 selectedNode，确保 UI 反映最新数据
    setSelectedNode((prev) =>
      prev ? { ...prev, data: { ...prev.data, ...newData } } : null
    );
  };
  
    const handleSave = () => {
      if (!nodes.some((n) => n.type === 'trigger')) {
        addNotification('工作流必须包含至少一个触发器', 'error');
        return;
      }
  
      const missingFields = nodes.some((node) => {
        const schema = nodeSchemas[node.type];
        return schema?.fields?.some((field) => field.required && !node.data[field.name]);
      });
  
      if (missingFields) {
        addNotification('请填写所有必填字段', 'error');
        return;
      }
  
      const updatedWorkflow = {
        ...workflow,
        id: workflow?.id || `wf-${Date.now()}`,
        name: workflowName,
        nodes,
        edges,
        version: '1.0',
        updatedAt: new Date().toISOString(),
      };
  
      onSave(updatedWorkflow);
      addNotification('工作流保存成功', 'success');
    };
  
    const TemplatePanel = () => (
      <div className="template-panel">
        <div className="template-header">
          <h3>工作流模板</h3>
          <div className="template-categories">
            <Button
              label="全部"
              onClick={() => setActiveCategory('all')}
              className={activeCategory === 'all' ? 'primary' : 'secondary'}
            />
            <Button
              label="营销"
              onClick={() => setActiveCategory('marketing')}
              className={activeCategory === 'marketing' ? 'primary' : 'secondary'}
            />
            <Button
              label="用户引导"
              onClick={() => setActiveCategory('onboarding')}
              className={activeCategory === 'onboarding' ? 'primary' : 'secondary'}
            />
          </div>
        </div>
        <div className="template-grid">
          {templates
            .filter((t) => activeCategory === 'all' || t.category === activeCategory)
            .map((template) => (
              <div
                key={template.id}
                className="template-card"
                onClick={() => {
                  setNodes(template.nodes);
                  setEdges(template.edges);
                  setShowTemplates(false);
                  addNotification(`已加载模板: ${template.name}`, 'success');
                }}
              >
                <h4>{template.name}</h4>
                <p>节点数: {template.nodes.length}</p>
                <small>{new Date(template.createdAt).toLocaleDateString()}</small>
              </div>
            ))}
        </div>
        <div className="template-actions">
          <Button label="保存当前为模板" onClick={saveAsTemplate} className="primary" />
          <Button label="关闭" onClick={() => setShowTemplates(false)} className="secondary" />
        </div>
      </div>
    );
  
   
  
  

    return (
      <div className="modal-overlay">
        <div className="modal-content automation-editor-container">
          <div className="editor-header">
            <div className="header-title">
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="workflow-name-input"
                placeholder="输入工作流名称"
              />
              <span className="workflow-version">v1.0</span>
            </div>
            <div className="header-actions">
            <Button label="保存" icon="save" onClick={handleSave} className="primary" />
            <Button
              label="AI助手"
              icon="smart_toy"
              onClick={() => setIsAIPanelOpen(true)}
              className="secondary"
            />
            <span className="material-icons close-btn" onClick={onClose}>
              close
            </span>
          </div>
          </div>
  
          <div className="editor-main">
            <div className={`tools-sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
              <div className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <span className="material-icons">
                  {isSidebarOpen ? 'chevron_left' : 'chevron_right'}
                </span>
              </div>
  
              {isSidebarOpen && (
                <div className="tools-content">
                  <div className="search-container">
                    <span className="material-icons search-icon">search</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜索组件..."
                      className="search-input"
                    />
                  </div>
  
                  {componentCategories.map((category) => (
                    <div key={category.name} className="category-section">
                      <div
                        className="category-header"
                        onClick={() =>
                          setExpandedCategories((prev) => ({
                            ...prev,
                            [category.name]: !prev[category.name],
                          }))
                        }
                      >
                        <span className="material-icons">
                          {expandedCategories[category.name] ? 'expand_less' : 'expand_more'}
                        </span>
                        {category.name}
                      </div>
  
                      {expandedCategories[category.name] && (
                        <div className="category-items">
                          {category.items
                            .filter((item) =>
                              item.label.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((item) => (
                              <div
                                key={item.label}
                                className="tool-item"
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData(
                                    'application/reactflow',
                                    JSON.stringify({ type: category.type, data: item.data })
                                  );
                                }}
                                onClick={() => {
                                  const newNode = {
                                    id: `${Date.now()}`,
                                    type: category.type,
                                    position: {
                                      x: Math.random() * 500,
                                      y: Math.random() * 500,
                                    },
                                    data: { ...nodeSchemas[category.type], ...item.data },
                                  };
                                  setNodes((nds) => [...nds, newNode]);
                                }}
                              >
                                <span className="material-icons">
                                  {category.type === 'trigger'
                                    ? 'play_circle'
                                    : category.type === 'action'
                                    ? 'bolt'
                                    : category.type === 'condition'
                                    ? 'call_split'
                                    : 'developer_board'}
                                </span>
                                {item.label}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
  
            <div className="react-flow-wrapper" ref={reactFlowWrapper}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={(e, node) => setSelectedNode(node)}
                onPaneClick={() => setSelectedNode(null)}
                nodeTypes={nodeTypes}
                fitView
              >
                <Controls />
                <Background />
                <MiniMap />
              </ReactFlow>
            </div>
  
            {selectedNode && (
              <div className="properties-panel">
                <h3 className="properties-title">
                  {selectedNode.data.label || '未命名节点'}
                  <span className="node-type-badge">{selectedNode.type}</span>
                </h3>
  
                <div className="property-field">
                  <label>节点ID</label>
                  <div className="property-value">{selectedNode.id}</div>
                </div>
  
                {renderPropertyFields(selectedNode)}
  
                <div className="panel-actions">
                  <Button
                    label="删除节点"
                    onClick={() => {
                      setNodes(nodes.filter((n) => n.id !== selectedNode.id));
                      setSelectedNode(null);
                    }}
                    className="danger"
                  />
                  <Button label="关闭" onClick={() => setSelectedNode(null)} className="secondary" />
                </div>
              </div>
            )}
  
            {/* AI面板只有在 isAIPanelOpen 为 true 时显示 */}
            {isAIPanelOpen && (
  <Panel position="bottom-right">
    <div className="ai-panel">
      <div className="ai-panel-header">
        <h4>AI 工作流助手</h4>
        <span className="ai-close-btn material-icons" onClick={() => setIsAIPanelOpen(false)}>
          close
        </span>
      </div>
      <div className="ai-input">
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="详细描述您想要的工作流..."
          rows={4}
        />
        <Button 
          icon="auto_awesome" 
          onClick={generateWithAI}
          loading={isAILoading}
          className="primary"
          label={isAILoading ? "生成中..." : "生成工作流"}
        />
      </div>
      <div className="ai-suggestions">
        <div className="suggestion-title">常用工作流模板:</div>
        <div className="template-buttons">
          <button onClick={() => setAiPrompt("新用户欢迎流程：当新用户注册时，发送欢迎邮件并添加CRM标签")}>
            欢迎流程
          </button>
          <button onClick={() => setAiPrompt("购物车弃单挽回：当用户放弃购物车1小时后，检查库存并发送提醒邮件")}>
            弃单挽回
          </button>
          <button onClick={() => setAiPrompt("客户生日祝福：在客户生日当天发送个性化祝福和优惠券")}>
            生日祝福
          </button>
        </div>
      </div>
    </div>
    
  </Panel>
)}

            {showTemplates && <TemplatePanel />}
  
            <div className="notifications">
              {notifications.map((n) => (
                <div key={n.id} className={`notification ${n.type}`}>
                  {n.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default AutomationEditorModal;