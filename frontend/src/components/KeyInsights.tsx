import { memo } from 'react'
import { useInsights } from '../hooks/useApi'
import { PLATFORM_COLORS, METRIC_COLORS } from '../utils/chartColors'
import type { Filters } from '../types'

const TrophyIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
const GlobeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
const TargetIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
const AlertIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

// function KeyInsights() {
//   const { data, loading, error } = useInsights()

function KeyInsights({ filters }: { filters: Filters }) {
  const { data, loading, error } = useInsights(
    filters.platform || undefined,
    filters.country || undefined,
    filters.industry || undefined,
    filters.campaignType || undefined
  )

  if (loading) {
    return (
      <div className="insights-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="insight-card">
            <div className="skeleton" style={{ height: '16px', width: '60%', marginBottom: '8px' }} />
            <div className="skeleton" style={{ height: '24px', width: '80%' }} />
          </div>
        ))}
      </div>
    )
  }

  if (error || !data) return null

  const insights = [
    {
      icon: <TrophyIcon />,
      label: 'Best ROAS Platform',
      value: data.best_roas_platform,
      detail: `${data.best_roas_value.toFixed(2)}x return`,
      color: PLATFORM_COLORS[data.best_roas_platform] || METRIC_COLORS.ROAS,
      positive: true,
    },
    {
      icon: <GlobeIcon />,
      label: 'Top Revenue Country',
      value: data.highest_revenue_country,
      detail: formatCurrency(data.highest_revenue_value),
      color: METRIC_COLORS.revenue,
      positive: true,
    },
    {
      icon: <TargetIcon />,
      label: 'Most Efficient Industry',
      value: data.lowest_cpa_industry,
      detail: `${formatCurrency(data.lowest_cpa_value)} CPA`,
      color: METRIC_COLORS.CPA,
      positive: true,
    },
    {
      icon: <AlertIcon />,
      label: 'Needs Attention',
      value: data.highest_spend_lowest_roas,
      detail: 'High spend, low ROAS',
      color: '#F97316',
      positive: false,
    },
  ]

  return (
    <div className="insights-section">
      <h2 className="insights-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
        Key Insights
      </h2>
      <div className="insights-grid">
        {insights.map((insight) => (
          <div 
            key={insight.label} 
            className={`insight-card ${insight.positive ? 'positive' : 'warning'}`}
            style={{ '--insight-color': insight.color } as React.CSSProperties}
          >
            <div className="insight-icon" style={{ color: insight.color }}>{insight.icon}</div>
            <div className="insight-content">
              <span className="insight-label">{insight.label}</span>
              <span className="insight-value">{insight.value}</span>
              <span className="insight-detail">{insight.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(KeyInsights)
