import React, { useState } from 'react';
import Button from './Button';
import '../styles/workflow-creation-choice.css';

const WorkflowCreationChoiceModal = ({ onClose, onChoice, templates }) => {
  const [step, setStep] = useState(1); // 1: 选择方式, 2: 选择模板
  const [creationMethod, setCreationMethod] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMethodSelect = (method) => {
    setCreationMethod(method);
    if (method === 'template') {
      setStep(2);
    }
  };

  const handleCreate = () => {
    if (creationMethod === 'ai' && !aiPrompt.trim()) {
      alert('请输入AI生成提示词');
      return;
    }
    if (step === 2 && !selectedTemplate) {
      alert('请选择一个模板');
      return;
    }
    
    onChoice(creationMethod, aiPrompt, selectedTemplate);
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content workflow-choice-modal">
        <div className="modal-header">
          <h3>{step === 1 ? '选择创建方式' : '选择模板'}</h3>
          <button className="close-btn" onClick={step === 1 ? onClose : () => setStep(1)}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="modal-body">
          {step === 1 ? (
            <div className="method-selection">
              <div 
                className={`method-card ${creationMethod === 'blank' ? 'selected' : ''}`}
                onClick={() => handleMethodSelect('blank')}
              >
                <div className="card-icon-container">
                  <div className="card-icon">
                    <span className="material-icons">note_add</span>
                  </div>
                </div>
                <h4>空白工作流</h4>
                <p>从零开始创建</p>
              </div>

              <div 
                className={`method-card ${creationMethod === 'template' ? 'selected' : ''}`}
                onClick={() => handleMethodSelect('template')}
              >
                <div className="card-icon-container">
                  <div className="card-icon">
                    <span className="material-icons">description</span>
                  </div>
                </div>
                <h4>使用模板</h4>
                <p>从预设模板开始</p>
              </div>

              <div 
                className={`method-card ${creationMethod === 'ai' ? 'selected' : ''}`}
                onClick={() => handleMethodSelect('ai')}
              >
                <div className="card-icon-container">
                  <div className="card-icon">
                    <span className="material-icons">smart_toy</span>
                  </div>
                </div>
                <h4>AI智能生成</h4>
                <p>自动创建工作流</p>
              </div>

              {creationMethod === 'ai' && (
                <div className="ai-prompt-section">
                  <label>描述您需要的工作流：</label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="例如：创建一个新用户注册后的欢迎流程"
                  />
                  <div className="quick-prompts">
                    <span>快速提示：</span>
                    <button onClick={() => setAiPrompt("高价值客户促销活动")}>促销活动</button>
                    <button onClick={() => setAiPrompt("购物车弃单提醒")}>弃单提醒</button>
                    <button onClick={() => setAiPrompt("用户生日自动祝福")}>生日祝福</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="template-selection">
              <div className="search-container">
                <span className="material-icons search-icon">search</span>
                <input
                  type="text"
                  placeholder="搜索模板..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="template-grid-container">
                <div className="template-grid">
                  {filteredTemplates.map((template) => (
                    <div 
                      key={template.id}
                      className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="template-preview">
                        <div className="mini-flow">
                          {template.nodes.slice(0, 3).map((node, i) => (
                            <div 
                              key={i}
                              className="mini-node"
                              style={{
                                left: `${node.position.x / 10}px`,
                                top: `${node.position.y / 10}px`,
                                backgroundColor: getNodeColor(node.type)
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="template-info">
                        <h4>{template.name}</h4>
                        <div className="template-stats">
                          <span>{template.nodes.length}节点</span>
                          <span>{template.edges.length}连接</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Button 
            label={step === 1 ? '取消' : '返回'} 
            onClick={step === 1 ? onClose : () => setStep(1)} 
            className="secondary" 
          />
          <Button 
            label={
              step === 2 ? '使用模板创建' : 
              creationMethod === 'ai' ? 'AI生成' : '创建'
            }
            onClick={handleCreate} 
            className="primary" 
            disabled={
              (step === 1 && !creationMethod) || 
              (step === 2 && !selectedTemplate) ||
              (creationMethod === 'ai' && !aiPrompt.trim())
            }
          />
        </div>
      </div>
    </div>
  );
};

function getNodeColor(nodeType) {
  const colors = {
    trigger: '#4CAF50',
    action: '#2196F3',
    condition: '#FFC107',
    crm: '#9C27B0',
    ecommerce: '#FF9800',
    advanced: '#607D8B'
  };
  return colors[nodeType] || '#9E9E9E';
}

export default WorkflowCreationChoiceModal;