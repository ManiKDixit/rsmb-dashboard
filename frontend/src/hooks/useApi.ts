import { useState, useEffect, useCallback } from 'react'
import type { Summary, CompareData, PerformanceRecord, Insights, TrendsData, MetricType, GroupByType } from '../types'

const API_BASE = '/api'

interface UseApiResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

function useApi<T>(url: string, deps: unknown[] = []): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}${url}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...deps])

  return { data, loading, error, refetch: fetchData }
}

export function useSummary(
  platform?: string,
  country?: string,
  industry?: string,
  campaignType?: string
) {
  const params = new URLSearchParams()
  if (platform) params.append('platform', platform)
  if (country) params.append('country', country)
  if (industry) params.append('industry', industry)
  if (campaignType) params.append('campaign_type', campaignType)
  const query = params.toString()
  return useApi<Summary>(query ? `/summary?${query}` : '/summary', [platform, country, industry, campaignType])
}

export function useComparison(
  metric: MetricType,
  groupBy: GroupByType,
  platform?: string,
  country?: string,
  industry?: string,
  campaignType?: string
) {
  const params = new URLSearchParams({ metric, group_by: groupBy })
  if (platform) params.append('platform', platform)
  if (country) params.append('country', country)
  if (industry) params.append('industry', industry)
  if (campaignType) params.append('campaign_type', campaignType)
  return useApi<CompareData>(`/compare?${params}`, [metric, groupBy, platform, country, industry, campaignType])
}

export function useInsights(
  platform?: string,
  country?: string,
  industry?: string,
  campaignType?: string
) {
  const params = new URLSearchParams()
  if (platform) params.append('platform', platform)
  if (country) params.append('country', country)
  if (industry) params.append('industry', industry)
  if (campaignType) params.append('campaign_type', campaignType)
  const query = params.toString()
  return useApi<Insights>(query ? `/insights?${query}` : '/insights', [platform, country, industry, campaignType])
}

export interface ExecutiveSummaryData {
  total_spend: number
  total_revenue: number
  overall_roas: number
  record_count: number
  findings: Array<{
    type: string
    title: string
    description: string
    metric: string
  }>
  recommendations: Array<{
    action: string
    impact: string
  }>
}

export function useExecutiveSummary(
  platform?: string,
  country?: string,
  industry?: string,
  campaignType?: string
) {
  const params = new URLSearchParams()
  if (platform) params.append('platform', platform)
  if (country) params.append('country', country)
  if (industry) params.append('industry', industry)
  if (campaignType) params.append('campaign_type', campaignType)
  const query = params.toString()
  return useApi<ExecutiveSummaryData>(
    query ? `/executive-summary?${query}` : '/executive-summary',
    [platform, country, industry, campaignType]
  )
}

export function useTrends(
  metric: string = 'revenue',
  interval: string = 'month',
  platform?: string,
  country?: string,
  industry?: string,
  campaignType?: string
) {
  const params = new URLSearchParams({ metric, interval })
  if (platform) params.append('platform', platform)
  if (country) params.append('country', country)
  if (industry) params.append('industry', industry)
  if (campaignType) params.append('campaign_type', campaignType)
  return useApi<TrendsData>(`/trends?${params}`, [metric, interval, platform, country, industry, campaignType])
}

export function usePlatforms() {
  return useApi<string[]>('/platforms')
}

export function useCountries() {
  return useApi<string[]>('/countries')
}

export function useIndustries() {
  return useApi<string[]>('/industries')
}

export function useCampaignTypes() {
  return useApi<string[]>('/campaign-types')
}

export function usePerformance(
  platform?: string,
  country?: string,
  industry?: string,
  campaignType?: string,
  limit: number = 50
) {
  const params = new URLSearchParams({ limit: String(limit) })
  if (platform) params.append('platform', platform)
  if (country) params.append('country', country)
  if (industry) params.append('industry', industry)
  if (campaignType) params.append('campaign_type', campaignType)
  return useApi<PerformanceRecord[]>(`/performance?${params}`, [platform, country, industry, campaignType, limit])
}
