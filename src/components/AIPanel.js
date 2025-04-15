// 新建 AIPanel.js 文件
import React from 'react';
import Button from './Button';

const AIPanel = ({ aiPrompt, setAiPrompt, isAILoading, generateWithAI, aiSuggestions, applyAISuggestion, onClose }) => {
  const handleInputChange = (e) => {
    setAiPrompt(e.target.value);
  };

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <h4>AI 工作流助手</h4>
        <span className="material-icons ai-close-btn" onClick={onClose}>
          close
        </span>
      </div>
      <div className="ai-input">
        <input
          type="text"
          value={aiPrompt}
          onChange={handleInputChange}
          placeholder="描述您想要的工作流 (例如: 当用户注册时发送欢迎邮件)"
          disabled={isAILoading}
        />
        <Button
          label={isAILoading ? '生成中...' : '生成建议'}
          onClick={generateWithAI}
          disabled={isAILoading}
          className="primary"
        />
      </div>
      {aiSuggestions.length > 0 && (
        <div className="ai-suggestions">
          <h5>建议节点:</h5>
          {aiSuggestions.map((suggestion, i) => (
            <div key={i} className="ai-suggestion" onClick={() => applyAISuggestion(suggestion)}>
              <span className="material-icons">
                {suggestion.type === 'trigger'
                  ? 'play_circle'
                  : suggestion.type === 'action'
                  ? 'bolt'
                  : suggestion.type === 'condition'
                  ? 'call_split'
                  : 'developer_board'}
              </span>
              {suggestion.data.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIPanel;