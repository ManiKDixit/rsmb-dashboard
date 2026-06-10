import { memo } from 'react'
import { useExecutiveSummary } from '../hooks/useApi'
import type { Filters } from '../types'

const TrendUpIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
const AlertIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
const CheckIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
const FileTextIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

function getIcon(type: string) {
  switch (type) {
    case 'opportunity': return <TrendUpIcon />
    case 'warning': return <AlertIcon />
    default: return <CheckIcon />
  }
}

function getIconColor(type: string): string {
  switch (type) {
    case 'opportunity': return '#34D399'
    case 'warning': return '#F97316'
    default: return '#60A5FA'
  }
}

interface ExecutiveSummaryProps {
  filters: Filters
}

function ExecutiveSummary({ filters }: ExecutiveSummaryProps) {
  const { data, loading, error } = useExecutiveSummary(
    filters.platform || undefined,
    filters.country || undefined,
    filters.industry || undefined,
    filters.campaignType || undefined
  )

  if (loading) {
    return (
      <div className="executive-summary">
        <div className="summary-header">
          <div className="summary-title-section">
            <div className="skeleton" style={{ height: '24px', width: '200px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ height: '16px', width: '300px' }} />
          </div>
        </div>
        <div className="summary-content" style={{ padding: '24px' }}>
          <div className="skeleton" style={{ height: '100px', width: '100%', marginBottom: '16px' }} />
          <div className="skeleton" style={{ height: '100px', width: '100%' }} />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return null
  }

  const hasFindings = data.findings && data.findings.length > 0
  const hasRecommendations = data.recommendations && data.recommendations.length > 0

  if (!hasFindings && !hasRecommendations) {
    return null
  }

  return (
    <div className="executive-summary">
      <div className="summary-header">
        <div className="summary-title-section">
          <h2 className="summary-title"><FileTextIcon /> Executive Summary</h2>
          <p className="summary-subtitle">Data-driven insights based on current filter selection</p>
        </div>
        <div className="summary-meta">
          <span className="meta-item">{data.record_count.toLocaleString()} campaigns</span>
          <span className="meta-divider">•</span>
          <span className="meta-item">{formatCurrency(data.total_spend)} spend</span>
          <span className="meta-divider">•</span>
          <span className="meta-item">{formatCurrency(data.total_revenue)} revenue</span>
          <span className="meta-divider">•</span>
          <span className="meta-item">{data.overall_roas.toFixed(2)}x ROAS</span>
        </div>
      </div>

      <div className="summary-content">
        {hasFindings && (
          <div className="findings-section">
            <h3 className="section-title">Key Findings</h3>
            <div className="findings-list">
              {data.findings.map((finding, index) => (
                <div key={index} className={`finding-card ${finding.type}`}>
                  <div className="finding-icon" style={{ color: getIconColor(finding.type) }}>
                    {getIcon(finding.type)}
                  </div>
                  <div className="finding-content">
                    <div className="finding-header">
                      <h4 className="finding-title">{finding.title}</h4>
                      {finding.metric && <span className="finding-metric">{finding.metric}</span>}
                    </div>
                    <p className="finding-description">{finding.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasRecommendations && (
          <div className="recommendations-section">
            <h3 className="section-title">Recommendations</h3>
            <div className="recommendations-list">
              {data.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <div className="recommendation-number">{index + 1}</div>
                  <div className="recommendation-content">
                    <p className="recommendation-action">{rec.action}</p>
                    <p className="recommendation-impact"><strong>Expected impact:</strong> {rec.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="summary-footer">
        <p className="methodology-note">
          <strong>Methodology:</strong> Efficiency metrics (ROAS, CTR, CPC, CPA) are calculated from aggregated totals,
          not averaged from row-level values, to ensure accuracy when comparing segments of different sizes.
        </p>
      </div>
    </div>
  )
}

export default memo(ExecutiveSummary)
