import { memo } from 'react'
import { usePlatforms, useCountries, useIndustries, useCampaignTypes } from '../hooks/useApi'
import type { Filters, MetricType, GroupByType } from '../types'

const FilterIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
const ChartIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
const LayersIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
const MonitorIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
const GlobeIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /></svg>
const BriefcaseIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
const TargetIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
const XIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>

interface FilterPanelProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

const METRICS: { value: MetricType; label: string }[] = [
  { value: 'ROAS', label: 'Return on Ad Spend (ROAS)' },
  { value: 'CTR', label: 'Click-Through Rate (CTR)' },
  { value: 'CPC', label: 'Cost Per Click (CPC)' },
  { value: 'CPA', label: 'Cost Per Acquisition (CPA)' },
  { value: 'ad_spend', label: 'Total Ad Spend' },
  { value: 'revenue', label: 'Total Revenue' },
  { value: 'impressions', label: 'Total Impressions' },
  { value: 'clicks', label: 'Total Clicks' },
  { value: 'conversions', label: 'Total Conversions' },
]

const GROUP_BY: { value: GroupByType; label: string }[] = [
  { value: 'platform', label: 'Platform' },
  { value: 'country', label: 'Country' },
  { value: 'industry', label: 'Industry' },
]

function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const { data: platforms, loading: platformsLoading } = usePlatforms()
  const { data: countries, loading: countriesLoading } = useCountries()
  const { data: industries, loading: industriesLoading } = useIndustries()
  const { data: campaignTypes, loading: campaignTypesLoading } = useCampaignTypes()

  const handleChange = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value })
  }

  const handleReset = () => {
    onChange({ platform: '', country: '', industry: '', campaignType: '', metric: 'ROAS', groupBy: 'platform' })
  }

  const hasActiveFilters = filters.platform || filters.country || filters.industry || filters.campaignType

  return (
    <div className="filter-panel">
      <h2 className="filter-panel-title"><FilterIcon /> Filters & Options</h2>

      <div className="filter-group">
        <label className="filter-label"><ChartIcon /> Metric</label>
        <select className="filter-select" value={filters.metric} onChange={(e) => handleChange('metric', e.target.value)}>
          {METRICS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label"><LayersIcon /> Group By</label>
        <select className="filter-select" value={filters.groupBy} onChange={(e) => handleChange('groupBy', e.target.value)}>
          {GROUP_BY.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
      </div>

      <div className="filter-divider" />

      <div className="filter-group">
        <label className="filter-label"><MonitorIcon /> Platform</label>
        <select className="filter-select" value={filters.platform} onChange={(e) => handleChange('platform', e.target.value)} disabled={platformsLoading}>
          <option value="">All Platforms</option>
          {platforms?.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label"><GlobeIcon /> Country</label>
        <select className="filter-select" value={filters.country} onChange={(e) => handleChange('country', e.target.value)} disabled={countriesLoading}>
          <option value="">All Countries</option>
          {countries?.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label"><BriefcaseIcon /> Industry</label>
        <select className="filter-select" value={filters.industry} onChange={(e) => handleChange('industry', e.target.value)} disabled={industriesLoading}>
          <option value="">All Industries</option>
          {industries?.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label"><TargetIcon /> Campaign Type</label>
        <select className="filter-select" value={filters.campaignType} onChange={(e) => handleChange('campaignType', e.target.value)} disabled={campaignTypesLoading}>
          <option value="">All Campaign Types</option>
          {campaignTypes?.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {hasActiveFilters && (
        <>
          <div className="filter-divider" />
          <button className="filter-reset" onClick={handleReset}><XIcon /> Clear All Filters</button>
        </>
      )}
    </div>
  )
}

export default memo(FilterPanel)
