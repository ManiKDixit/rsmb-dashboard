export const PLATFORM_COLORS: Record<string, string> = {
  'Google Ads': '#4285F4',
  'Meta Ads': '#A855F7',
  'TikTok Ads': '#25F4EE',
}

export const METRIC_COLORS: Record<string, string> = {
  ad_spend: '#F472B6',
  revenue: '#34D399',
  conversions: '#A78BFA',
  ROAS: '#FBBF24',
  CTR: '#60A5FA',
  CPC: '#FB7185',
  CPA: '#F97316',
  impressions: '#22D3EE',
  clicks: '#38BDF8',
}

export const FALLBACK_COLORS = [
  '#60A5FA',
  '#FBBF24',
  '#A78BFA',
  '#F472B6',
  '#34D399',
  '#FB7185',
  '#22D3EE',
]

export function getPlatformColor(label: string, index = 0): string {
  return PLATFORM_COLORS[label] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

export function getMetricColor(metric: string): string {
  return METRIC_COLORS[metric] ?? '#60A5FA'
}
