import React from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import Card from '../components/Card';
import Button from '../components/Button';
import '../styles/insights.css';

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, 
  LinearScale, BarElement, PointElement, LineElement
);

const Insights = () => {
  // 示例数据
  const dealStagesData = {
    labels: ['潜在客户', '初步接触', '提案阶段', '谈判阶段', '成交'],
    datasets: [{
      data: [25, 18, 12, 8, 5],
      backgroundColor: [
        '#4285F4', '#34A853', '#FBBC05', '#FF6D01', '#EA4335'
      ],
      borderWidth: 0
    }]
  };

  const revenueTrendData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: [{
      label: '收入 (万)',
      data: [120, 150, 180, 210, 240, 280],
      backgroundColor: '#4285F4',
      borderColor: '#4285F4',
      tension: 0.3
    }]
  };

  const winRateData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      label: '胜率 (%)',
      data: [35, 42, 48, 55],
      backgroundColor: '#34A853',
      borderColor: '#34A853',
      tension: 0.3
    }]
  };

  const teamPerformanceData = {
    labels: ['张三', '李四', '王五', '赵六', '钱七'],
    datasets: [{
      label: '成交金额 (万)',
      data: [320, 280, 240, 180, 150],
      backgroundColor: '#FF6D01'
    }]
  };

  const topDeals = [
    { id: 1001, name: 'Acme Corporation', amount: 120, stage: '谈判阶段', owner: '张三' },
    { id: 1002, name: 'Beta Inc', amount: 85, stage: '提案阶段', owner: '李四' },
    { id: 1003, name: 'Gamma LLC', amount: 65, stage: '初步接触', owner: '王五' },
    { id: 1004, name: 'Delta Co', amount: 50, stage: '潜在客户', owner: '赵六' }
  ];

  const kpiCards = [
    { title: '季度收入', value: '¥2,450,000', change: '+12%', trend: 'up' },
    { title: '成交率', value: '42%', change: '+5%', trend: 'up' },
    { title: '平均交易周期', value: '45天', change: '-3天', trend: 'down' },
    { title: '平均交易额', value: '¥85,000', change: '+8%', trend: 'up' }
  ];

  return (
    <div className="insights-container">
      <div className="insights-header">
        <h1>业务洞察</h1>
        <div className="time-filter">
          <Button label="本周" className="secondary" />
          <Button label="本月" className="secondary active" />
          <Button label="本季" className="secondary" />
          <Button label="本年" className="secondary" />
          <Button label="自定义" className="secondary" icon="calendar_today" />
        </div>
      </div>

      <div className="kpi-grid">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="kpi-card">
            <div className="kpi-content">
              <span className="kpi-title">{kpi.title}</span>
              <span className="kpi-value">{kpi.value}</span>
              <span className={`kpi-change ${kpi.trend}`}>
                {kpi.change} {kpi.trend === 'up' ? '↑' : '↓'}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="insights-grid">
        <Card title="交易阶段分布" icon="pie_chart">
          <div className="chart-container">
            <Doughnut data={dealStagesData} options={{
              plugins: {
                legend: { position: 'right' }
              }
            }} />
          </div>
        </Card>

        <Card title="收入趋势" icon="trending_up">
          <div className="chart-container">
            <Line data={revenueTrendData} options={{
              responsive: true,
              scales: { y: { beginAtZero: true } }
            }} />
          </div>
        </Card>

        <Card title="季度胜率变化" icon="show_chart">
          <div className="chart-container">
            <Bar data={winRateData} options={{
              responsive: true,
              scales: { y: { beginAtZero: true, max: 100 } }
            }} />
          </div>
        </Card>

        <Card title="团队业绩排行" icon="bar_chart">
          <div className="chart-container">
            <Bar data={teamPerformanceData} options={{
              indexAxis: 'y',
              responsive: true,
              scales: { x: { beginAtZero: true } }
            }} />
          </div>
        </Card>
      </div>

      <div className="insights-bottom">
        <Card title="重点交易" icon="star" className="top-deals">
          <table>
            <thead>
              <tr>
                <th>交易名称</th>
                <th>金额 (万)</th>
                <th>阶段</th>
                <th>负责人</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {topDeals.map(deal => (
                <tr key={deal.id}>
                  <td>{deal.name}</td>
                  <td>¥{deal.amount}</td>
                  <td>
                    <span className="deal-stage" style={{ 
                      backgroundColor: 
                        deal.stage === '谈判阶段' ? '#FF6D01' :
                        deal.stage === '提案阶段' ? '#FBBC05' :
                        deal.stage === '初步接触' ? '#4285F4' : '#34A853'
                    }}>
                      {deal.stage}
                    </span>
                  </td>
                  <td>{deal.owner}</td>
                  <td>
                    <Button 
                      label="查看" 
                      className="text" 
                      icon="visibility" 
                      fontSize="12px"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="关键指标说明" icon="insights" className="metrics-info">
          <ul>
            <li>
              <strong>成交率</strong>: 已成交交易数 / 总跟进交易数 × 100%
            </li>
            <li>
              <strong>平均交易周期</strong>: 从初次接触到成交的平均天数
            </li>
            <li>
              <strong>平均交易额</strong>: 总成交金额 / 成交交易数
            </li>
            <li>
              <strong>销售漏斗转化率</strong>: 各阶段转化比例分析
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Insights;