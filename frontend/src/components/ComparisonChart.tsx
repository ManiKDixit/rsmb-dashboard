import { useMemo, memo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useComparison } from '../hooks/useApi'
import { useTheme } from '../hooks/useTheme'
import { getPlatformColor, getMetricColor, FALLBACK_COLORS } from '../utils/chartColors'
import type { Filters, MetricType } from '../types'

const BarChartIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
const RefreshIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
const LayersIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>

interface ComparisonChartProps { filters: Filters }

function formatValue(value: number, metric: MetricType): string {
  switch (metric) {
    case 'ROAS': return `${value.toFixed(2)}x`
    case 'CTR': return `${value.toFixed(2)}%`
    case 'CPC': case 'CPA': case 'ad_spend': case 'revenue':
      if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
      if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
      return `$${value.toFixed(2)}`
    default:
      if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
      if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
      return value.toLocaleString()
  }
}

function getMetricLabel(metric: MetricType): string {
  const labels: Record<MetricType, string> = {
    ROAS: 'Return on Ad Spend', CTR: 'Click-Through Rate', CPC: 'Cost Per Click',
    CPA: 'Cost Per Acquisition', ad_spend: 'Ad Spend', revenue: 'Revenue',
    impressions: 'Impressions', clicks: 'Clicks', conversions: 'Conversions',
  }
  return labels[metric]
}

function ComparisonChart({ filters }: ComparisonChartProps) {
  const { theme } = useTheme()
  // const { data, loading, error, refetch } = useComparison(
  //   filters.metric, 
  //   filters.groupBy, 
  //   filters.country || undefined, 
  //   filters.industry || undefined,
  //   filters.campaignType || undefined
  // )

  const { data, loading, error, refetch } = useComparison(
  filters.metric,
  filters.groupBy,
  filters.platform || undefined,
  filters.country || undefined,
  filters.industry || undefined,
  filters.campaignType || undefined
)

  const chartData = useMemo(() => {
    if (!data) return []
    return data.labels.map((label, index) => ({ name: label, value: data.values[index] }))
  }, [data])

  if (loading) return (
    <div className="chart-container">
      <div className="chart-header"><div className="skeleton" style={{ height: '20px', width: '200px', marginBottom: '8px' }} /><div className="skeleton" style={{ height: '14px', width: '140px' }} /></div>
      <div className="chart-body"><div className="skeleton" style={{ height: '100%', width: '100%' }} /></div>
    </div>
  )

  if (error) return (
    <div className="chart-container">
      <div className="chart-header"><div className="chart-title"><BarChartIcon /> Comparison Chart</div></div>
      <div className="chart-body">
        <div className="error-state">
          <h3 className="error-state-title">Unable to load chart data</h3>
          <button className="error-state-action" onClick={refetch}><RefreshIcon /> Retry</button>
        </div>
      </div>
    </div>
  )

  if (!data || chartData.length === 0) return null

  const groupByLabel = filters.groupBy.charAt(0).toUpperCase() + filters.groupBy.slice(1)

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0]
    return (
      <div style={{ background: theme === 'dark' ? 'rgba(10,10,10,0.95)' : '#fff', border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`, borderRadius: '8px', padding: '10px 14px' }}>
        <p style={{ margin: 0, fontWeight: 600, color: theme === 'dark' ? '#fff' : '#000' }}>{d.payload.name}</p>
        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          {getMetricLabel(filters.metric)}: <strong style={{ color: getMetricColor(filters.metric) }}>{formatValue(d.value, filters.metric)}</strong>
        </p>
      </div>
    )
  }

  return (
    <div className="chart-container animate-in">
      <div className="chart-header">
        <div>
          <h3 className="chart-title"><BarChartIcon /> {getMetricLabel(filters.metric)} by {groupByLabel}</h3>
          <p className="chart-subtitle"><LayersIcon /> Comparing {chartData.length} {filters.groupBy}s</p>
        </div>
      </div>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#e2e8f0'} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: theme === 'dark' ? '#606060' : '#64748b', fontSize: 12 }} tickLine={false} axisLine={{ stroke: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }} angle={-45} textAnchor="end" height={80} interval={0} />
            <YAxis tick={{ fill: theme === 'dark' ? '#606060' : '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => formatValue(value, filters.metric)} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={60} animationDuration={600}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={entry.name} 
                  fill={
                    filters.groupBy === 'platform' 
                      ? getPlatformColor(entry.name, index) 
                      : getMetricColor(filters.metric) || FALLBACK_COLORS[index % FALLBACK_COLORS.length]
                  } 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default memo(ComparisonChart)
