export type Theme = 'light' | 'dark'

export interface Summary {
  total_spend: number
  total_revenue: number
  total_impressions: number
  total_clicks: number
  total_conversions: number
  avg_roas: number
  avg_ctr: number
  avg_cpc: number
  avg_cpa: number
  record_count: number
}

export interface CompareData {
  labels: string[]
  values: number[]
  metric: string
  group_by: string
}

export interface Insights {
  best_roas_platform: string
  best_roas_value: number
  highest_revenue_country: string
  highest_revenue_value: number
  lowest_cpa_industry: string
  lowest_cpa_value: number
  highest_spend_lowest_roas: string
}

export interface TrendPoint {
  date: string
  value: number
}

export interface TrendsData {
  data: TrendPoint[]
  metric: string
}

export interface PerformanceRecord {
  platform: string
  country: string
  industry: string
  ad_spend: number
  revenue: number
  impressions: number
  clicks: number
  conversions: number
  ROAS: number
  CTR: number
  CPC: number
  CPA: number
}

export type MetricType = 'ROAS' | 'CTR' | 'CPC' | 'CPA' | 'ad_spend' | 'revenue' | 'impressions' | 'clicks' | 'conversions'
export type GroupByType = 'platform' | 'country' | 'industry'

export interface Filters {
  platform: string
  country: string
  industry: string
  campaignType: string
  metric: MetricType
  groupBy: GroupByType
}
