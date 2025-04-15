import React from 'react';
import '../styles/activity-drawer.css';

const ActivityDetailDrawer = ({ activity, onClose }) => {
  if (!activity) return null;

  const renderContent = () => {
    switch (activity.type) {
      case 'call':
        return (
          <div className="activity-detail-container">
            <div className="content-section">
              <div className="audio-section">
                <h3 className="section-title">
                  <span className="material-icons">call</span>
                  通话录音
                </h3>
                <div className="audio-player">
                  <audio controls src={activity.audioUrl} />
                  <div className="audio-meta">
                    <span className="duration">{activity.duration}</span>
                    <span className="participants">
                      <span className="material-icons">people</span>
                      {activity.participants?.join('、') || '未知参与者'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="transcript-section">
                <h3 className="section-title">
                  <span className="material-icons">notes</span>
                  文字记录
                </h3>
                <div className="transcript-content">
                  {activity.transcript.split('\n').map((line, i) => (
                    <p 
                      key={i} 
                      className={line.includes('[客户]') ? 'customer-line' : 'rep-line'}
                      dangerouslySetInnerHTML={{ 
                        __html: line.replace(/\[(.*?)\]/g, '<strong>$1</strong>') 
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="ai-analysis-section">
              <h3 className="section-title">
                <span className="material-icons">insights</span>
                AI分析报告
              </h3>
              
              <div className="metric-grid">
                <div className="metric-card">
                  <div className="metric-value" style={{ color: '#34A853' }}>
                    {Math.round(activity.sentiment * 100)}%
                  </div>
                  <div className="metric-label">沟通满意度</div>
                  <div className="metric-trend">
                    <span className="material-icons">
                      {activity.sentiment > 0.7 ? 'trending_up' : 'trending_down'}
                    </span>
                    较平均{activity.sentiment > 0.7 ? '高' : '低'}15%
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-value" style={{ color: '#4285F4' }}>
                    {activity.keypoints?.length || 0}
                  </div>
                  <div className="metric-label">关键决策点</div>
                </div>
              </div>

              {activity.keywords && (
                <div className="keyword-section">
                  <h4>高频关键词</h4>
                  <div className="keyword-cloud">
                    {activity.keywords.map((word, i) => (
                      <span key={i} className="keyword-tag">{word}</span>
                    ))}
                  </div>
                </div>
              )}

<div className="action-items">
              <h4>建议行动</h4>
              {activity.analysis.split('\n').filter(l => l.trim()).map((item, i) => {
                // 修复警告：使用更安全的字符串处理方法
                const cleanedItem = item.replace(/^\s*[-✓•]\s*/, '');
                return (
                  <div key={i} className="action-item">
                    <span className="material-icons">chevron_right</span>
                    {cleanedItem}
                  </div>
                );
              })}
            </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="activity-detail-container">
            <div className="content-section email-content">
              <div className="email-header">
                <div className="sender-avatar">
                  {activity.from?.charAt(0) || '?'}
                </div>
                <div>
                  <h3>{activity.subject || "无主题邮件"}</h3>
                  <p className="email-meta">
                    <span>{activity.from || "未知发件人"}</span>
                    <span>•</span>
                    <span>{activity.date}</span>
                  </p>
                </div>
                {activity.attachments > 0 && (
                  <div className="attachment-badge">
                    <span className="material-icons">attach_file</span>
                    {activity.attachments}个附件
                  </div>
                )}
              </div>

              <div className="email-body">
                <pre>{activity.body}</pre>
              </div>
            </div>

            <div className="ai-analysis-section">
              <h3 className="section-title">
                <span className="material-icons">insights</span>
                AI分析报告
              </h3>
              
              <div className="metric-grid">
                <div className="metric-card">
                  <div className="metric-value" style={{ color: '#34A853' }}>
                    {Math.round(activity.sentiment * 100)}%
                  </div>
                  <div className="metric-label">沟通满意度</div>
                  <div className="metric-trend">
                    <span className="material-icons">
                      {activity.sentiment > 0.7 ? 'trending_up' : 'trending_down'}
                    </span>
                    较平均{activity.sentiment > 0.7 ? '高' : '低'}15%
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-value" style={{ color: '#4285F4' }}>
                    {activity.keypoints?.length || 0}
                  </div>
                  <div className="metric-label">关键决策点</div>
                </div>
              </div>

              {activity.keywords && (
                <div className="keyword-section">
                  <h4>高频关键词</h4>
                  <div className="keyword-cloud">
                    {activity.keywords.map((word, i) => (
                      <span key={i} className="keyword-tag">{word}</span>
                    ))}
                  </div>
                </div>
              )}

<div className="action-items">
              <h4>建议行动</h4>
              {activity.analysis.split('\n').filter(l => l.trim()).map((item, i) => {
                // 修复警告：使用更安全的字符串处理方法
                const cleanedItem = item.replace(/^\s*[-✓•]\s*/, '');
                return (
                  <div key={i} className="action-item">
                    <span className="material-icons">chevron_right</span>
                    {cleanedItem}
                  </div>
                );
              })}
            </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <span className="material-icons">close</span>
        </button>
        <h2 className="drawer-title">
          {activity.type === 'call' ? '电话沟通详情' : 
           activity.type === 'email' ? '邮件详情' : '会议记录'}
        </h2>
        {renderContent()}
      </div>
    </div>
  );
};

export default ActivityDetailDrawer;