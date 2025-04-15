import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale } from 'chart.js';
import Card from '../components/Card';
import HealthIndicator from '../components/HealthIndicator';
import Button from '../components/Button';
import ActivityDetailDrawer from '../components/ActivityDetailDrawer';
import '../styles/deal-detail.css';
import AICopilotPanel from '../components/AICopilotPanel';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

const DealDetail = () => {
  const { id } = useParams();
  const [comment, setComment] = useState('');
  const [teamComments, setTeamComments] = useState([
    { id: 1, user: 'Jane Smith', text: '客户对价格比较敏感，建议提供分期付款方案', time: '2小时前' },
    { id: 2, user: 'Alex Wong', text: '已安排下周三的产品演示', time: '昨天' }
  ]);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const deal = {
    id: parseInt(id),
    name: 'Acme Corporation',
    amount: 120000,
    stage: 'Proposal',
    owner: 'John Smith',
    lastActivity: '2小时前',
    nextStep: '发送合同草案',
    warningSigns: ['价格敏感', '提及竞品'],
    forecastStatus: 'Commit',
    closeDate: '2025-04-15',
    daysInStage: 14,
    probability: 70,
    calls: 3,
    emails: 5,
    meetings: 2,
    healthScore: 75,
    timeline: [
      // 电话记录增强
{
  type: 'call',
      date: '2025-03-28 14:30',
      summary: '价格谈判关键通话',
      duration: '32分钟',
      sentiment: 0.82,
      audioUrl: '/audio/acme-negotiation.mp3',
      participants: ['John Smith', '王总', '李总监'],
      transcript: `
        [John Smith]: 关于报价方案，我们可以考虑阶梯式定价...
        [王总]: 我们年度预算有限，如果首付能降到30%...
        [李总监]: 技术集成需要确保API响应时间<200ms...
      `,
      analysis: `
        ✓ 准备技术指标文档
        ✓ 修改合同首付条款
        • 安排技术团队对接
      `,
      keywords: ['价格谈判', '技术指标', '付款周期'],
      keypoints: [
        '客户接受阶梯定价',
        '技术团队关注性能指标'
      ]
},
      { 
        type: 'email', 
        date: '2025-03-25', 
        summary: '发送初步提案', 
        attachments: 2, 
        sentiment: 0.8,
        body: `
          **发件人**: john.smith@dealflow.com  
          **收件人**: wang.zong@acme.com  
          **主题**: Acme Corporation - 定制解决方案提案  

          尊敬的王总：  

          附件是我们的正式提案（PDF），包含：  
          1. 企业版功能清单  
          2. 报价单（总价 $120,000）  
          3. 实施时间表  

          **核心优势**：  
          - 行业领先的AI分析模块  
          - 专属客户经理支持  
          - 99.9% SLA保障  

          期待您的反馈！  

          Best regards,  
          John Smith  
          高级客户经理 | DealFlow  
          📞 +1 (555) 123-4567  
        `,
        analysis: `
          - 清晰列出附件内容（✅）  
          - 突出价格和核心优势（✅）  
          - 可能要求缩短付款周期（概率72%）  
          - 对SLA条款会有详细询问（概率65%）  
        `,
        keywords: ['价格谈判', '技术指标', '付款周期'],
      keypoints: [
        '客户接受阶梯定价',
        '技术团队关注性能指标'
      ]
      },
      { 
        type: 'meeting', 
        date: '2025-03-20', 
        summary: '产品演示', 
        participants: 3, 
        duration: '45分钟', 
        sentiment: 0.85,
        recordingUrl: '/meetings/acme-demo-20250320.mp4',
        notes: [
          "客户CTO对实时数据分析功能非常感兴趣",
          "财务总监询问批量采购折扣政策",
          "约定了两周后跟进会议",
          "客户要求增加与现有ERP系统的集成演示"
        ],
        analysis: `
          **参会人关注点**：  
          - CTO：技术可行性（权重40%）  
          - CFO：成本效益（权重35%）  
          - PM：实施难度（权重25%）  
          **风险信号**：  
          - ERP集成需求可能延长销售周期  
          **下一步**：  
          1. 准备ERP集成demo  
          2. 提供批量采购报价方案
        `
      }
    ],
    engagement: {
      talkRatio: { rep: 40, customer: 60 },
      topics: ['价格 (65%)', '功能需求 (30%)', '竞品 (5%)'],
      sentimentTrend: [0.6, 0.5, 0.7, 0.8, 0.5, 0.75],
    },
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const getStageColor = (stage) => ({ 
    Proposal: '#FBBC05', 
    Negotiation: '#34A853', 
    Discovery: '#4285F4',
    'Closed Won': '#0B8043',
    'Closed Lost': '#EA4335'
  }[stage] || '#5F6368');

  const healthScore = Math.min(deal.probability + (deal.warningSigns.length > 0 ? -20 : 0), 100);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const newComment = { id: teamComments.length + 1, user: 'You', text: comment, time: '刚刚' };
    setTeamComments([newComment, ...teamComments]);
    setComment('');
  };

  const talkRatioData = {
    labels: ['销售代表', '客户'],
    datasets: [{
      data: [deal.engagement.talkRatio.rep, deal.engagement.talkRatio.customer],
      backgroundColor: ['#4285F4', '#34A853'],
      borderWidth: 0
    }]
  };

  const sentimentData = {
    labels: deal.engagement.topics.map(t => t.split(' (')[0]),
    datasets: [{
      data: deal.engagement.topics.map(t => parseInt(t.match(/\((\d+)%\)/)[1])),
      backgroundColor: ['#4285F4', '#34A853', '#FBBC05'],
      borderWidth: 0
    }]
  };

  const doughnutOptions = {
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

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
  };

  return (
    <div className="deal-detail-container">
      <div className="deal-header">
        <div>
          <Link to="/deals" className="back-button">
            <span className="material-icons">arrow_back</span>
            <span>返回交易列表</span>
          </Link>
          <div className="deal-title-container">
            <h1 className="deal-title">{deal.name}</h1>
            <span className="deal-id">#{deal.id}</span>
          </div>
          <div className="deal-subtitle">
            <span className="deal-owner"><span className="material-icons">person</span>{deal.owner}</span>
            <span className="deal-stage" style={{ color: getStageColor(deal.stage) }}>
              <span className="stage-dot" style={{ backgroundColor: getStageColor(deal.stage) }}></span>
              {deal.stage}
            </span>
            <span className="deal-amount">{formatCurrency(deal.amount)}</span>
          </div>
        </div>
        <div className="deal-actions">
          <Button label="编辑" icon="edit" className="secondary" />
          <Button label="标记完成" icon="check" className="primary" />
        </div>
      </div>

      <div className="deal-content">
        <div className="deal-left-column">
          <Card title="基本信息" icon="info">
            <div className="info-grid">
              <div className="info-item">
                <label>成交概率</label>
                <div className="probability-bar">
                  <div className="probability-fill" style={{ width: `${deal.probability}%`, backgroundColor: deal.probability > 70 ? '#34A853' : deal.probability > 40 ? '#FBBC05' : '#EA4335' }}></div>
                  <span>{deal.probability}%</span>
                </div>
              </div>
              <div className="info-item">
                <label>预计成交日</label>
                <div className="info-value">
                  <span className="material-icons">event</span>
                  {new Date(deal.closeDate).toLocaleDateString()}
                  <span className="days-remaining">({Math.ceil((new Date(deal.closeDate) - new Date()) / (1000 * 60 * 60 * 24))}天后)</span>
                </div>
              </div>
              <div className="info-item">
                <label>当前阶段</label>
                <div className="info-value">
                  <span className="stage-indicator"><span className="stage-dot" style={{ backgroundColor: getStageColor(deal.stage) }}></span>{deal.stage}</span>
                  <span className="days-in-stage">({deal.daysInStage}天)</span>
                </div>
              </div>
              <div className="info-item">
                <label>最后活动</label>
                <div className="info-value"><span className="material-icons">schedule</span>{deal.lastActivity}</div>
              </div>
            </div>
          </Card>

          <Card title="活动时间线" icon="timeline">
            <div className="timeline-list">
              {deal.timeline.map((event, index) => (
                <div 
                  key={index} 
                  className="timeline-item"
                  onClick={() => handleActivityClick(event)}
                >
                  <div className="timeline-badge">
                    {event.type === 'call' && <span className="material-icons">call</span>}
                    {event.type === 'email' && <span className="material-icons">email</span>}
                    {event.type === 'meeting' && <span className="material-icons">videocam</span>}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-date">{event.date}</span>
                      <span className="timeline-type">{{
                        call: '电话沟通',
                        email: '邮件往来',
                        meeting: '会议'
                      }[event.type]}</span>
                    </div>
                    <p className="timeline-summary">{event.summary}</p>
                    <div className="timeline-meta">
                      {event.duration && <span><span className="material-icons">schedule</span>{event.duration}</span>}
                      {event.sentiment && (
                        <span className="sentiment-indicator">
                          <span className="material-icons">
                            {event.sentiment > 0.7 ? 'sentiment_very_satisfied' : event.sentiment > 0.4 ? 'sentiment_satisfied' : 'sentiment_dissatisfied'}
                          </span>
                          {Math.round(event.sentiment * 100)}%
                        </span>
                      )}
                      {event.attachments && <span><span className="material-icons">attach_file</span>{event.attachments}个附件</span>}
                      {event.participants && <span><span className="material-icons">people</span>{event.participants}人参与</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="deal-right-column">
          <Card title="交易健康度" icon="monitor_heart">
            <div className="deal-health-indicator">
              <HealthIndicator score={healthScore} />
              {deal.warningSigns.length > 0 ? (
                <div className="warnings-container">
                  <h4>风险警告</h4>
                  <ul className="warning-list">
                    {deal.warningSigns.map((sign, index) => (
                      <li key={index} className="warning-item"><span className="material-icons">warning</span>{sign}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="health-positive"><span className="material-icons">check_circle</span><span>交易进展顺利</span></div>
              )}
            </div>
          </Card>

          <Card title="沟通分析" icon="analytics">
            <div className="analysis-grid">
              <div className="analysis-item">
                <h4>对话比例</h4>
                <div className="deal-chart-container"><Doughnut data={talkRatioData} options={doughnutOptions} /></div>
              </div>
              <div className="analysis-item">
                <h4>讨论话题</h4>
                <div className="deal-chart-container"><Doughnut data={sentimentData} options={doughnutOptions} /></div>
              </div>
            </div>
            <div className="stats-grid">
              <div className="stat-item"><span className="material-icons">call</span><span>{deal.calls}次通话</span></div>
              <div className="stat-item"><span className="material-icons">email</span><span>{deal.emails}封邮件</span></div>
              <div className="stat-item"><span className="material-icons">videocam</span><span>{deal.meetings}次会议</span></div>
            </div>
          </Card>

          <Card title="下一步行动" icon="list_alt">
            <div className="next-steps-content">
              <p className="next-step"><strong>建议行动:</strong> {deal.nextStep}</p>
              <div className="action-buttons">
                <Button label="添加任务" icon="add" className="secondary" />
                <Button label="发送合同" icon="send" className="primary" />
              </div>
            </div>
          </Card>

          <Card title="团队协作" icon="group">
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                placeholder="添加评论或@提及团队成员..."
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
              <div className="form-actions">
                <Button type="submit" label="发布" className="primary" />
              </div>
            </form>
            <div className="comments-list">
              {teamComments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-avatar"><span className="material-icons">account_circle</span></div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-user">{comment.user}</span>
                      <span className="comment-time">{comment.time}</span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

       
      </div>

      <div className="ai-assistant-floating">
  <AICopilotPanel dealData={{
    id: deal.id,
    name: deal.name,
    amount: deal.amount,
    stage: deal.stage,
    healthScore: healthScore,
    lastActivity: deal.lastActivity
  }} />
</div>

      {/* 右侧活动详情弹窗 */}
      <ActivityDetailDrawer 
        activity={selectedActivity} 
        onClose={() => setSelectedActivity(null)} 
      />
    </div>
  );
};

export default DealDetail;