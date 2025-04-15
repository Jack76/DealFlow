import React, { useState, useRef, useEffect } from 'react';
import '../styles/copilot.css';

const mockAIResponses = {
  "风险": `根据分析：
🔴 **高风险项**：  
- 客户多次提及竞品（出现3次）  
- 价格敏感度评分：82/100  

🟡 **注意事项**：  
- ERP集成需求可能延迟交付  
- 当前阶段停留14天（超过平均10天）`,

  "下一步": `建议行动：  
1. 准备竞品对比表  
2. 安排技术团队演示  
3. 发送合同草案v2`,

  "客户": `客户分析：  
• **关注点**：价格(65%)、交付时间(25%)  
• **沟通风格**：直接务实  
• **决策权**：需财务总监审批`,

  "默认": `我可以帮助分析以下内容：  
• 输入"风险"查看交易风险点  
• 输入"建议"获取下一步行动  
• 输入"客户"了解客户特点  
• 其他问题将返回通用回复`
};

export default function AICopilotPanel({ dealData }) {
  const [messages, setMessages] = useState([{
    role: 'ai',
    content: '我是您的交易助手，可以尝试询问：\n• "主要风险点是什么？"\n• "下一步建议？"\n• "客户特点分析"'
  }]);
  const [isExpanded, setIsExpanded] = useState(true);
  const inputRef = useRef();
  const messagesEndRef = useRef(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const question = inputRef.current.value.trim();
    if (!question) return;

    setMessages(prev => [...prev, { role: 'user', content: question }]);
    inputRef.current.value = '';
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: generateAIResponse(question) 
      }]);
    }, 500);
  };

  const generateAIResponse = (question) => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('风险')) {
      return mockAIResponses["风险"];
    } else if (lowerQuestion.includes('下一步') || lowerQuestion.includes('建议')) {
      return mockAIResponses["下一步"];
    } else if (lowerQuestion.includes('客户')) {
      return mockAIResponses["客户"];
    } else {
      return `${mockAIResponses["默认"]}\n\n您的问题："${question}"`;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* 悬浮按钮 - 只在面板收起时显示 */}
      {!isExpanded && (
        <div 
          className="floating-toggle"
          onClick={() => setIsExpanded(true)}
        >
          <span className="material-icons">smart_toy</span>
        </div>
      )}

      {/* 主面板 */}
      <div 
        className={`copilot-panel ${isExpanded ? 'expanded' : 'collapsed'}`}
      >
        {/* 标题栏 */}
        <div className="panel-header">
          <div className="panel-header-left">
            <span className="material-icons">smart_toy</span>
            <h3>AI 交易助手</h3>
          </div>
          <button 
            className="panel-close-btn"
            onClick={() => setIsExpanded(false)}
            aria-label="关闭AI面板"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        {/* 展开时的内容 */}
        {isExpanded && (
          <>
            <div className="message-container">
              {messages.map((msg, i) => (
                <div key={i} className={`message ${msg.role}`}>
                  <div className="avatar">
                    {msg.role === 'ai' ? (
                      <span className="material-icons">smart_toy</span>
                    ) : (
                      <span className="material-icons">person</span>
                    )}
                  </div>
                  <div className="content">
                    {msg.content.split('\n').map((line, j) => (
                      <p key={j}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
              <input
                ref={inputRef}
                type="text"
                placeholder="输入问题，例如：风险点有哪些？"
                onKeyPress={handleKeyPress}
                aria-label="输入AI问题"
              />
              <button onClick={handleSend}>
                <span className="material-icons">send</span>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}