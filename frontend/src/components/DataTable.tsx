import { useState, useMemo, useCallback, memo } from 'react'
import { usePerformance } from '../hooks/useApi'
import type { Filters } from '../types'

const TableIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /></svg>
const DatabaseIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
const ChevronLeftIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
const ChevronRightIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
const SortIcon = ({ direction }: { direction: 'asc' | 'desc' | null }) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px', opacity: direction ? 1 : 0.3, transform: direction === 'asc' ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}><polyline points="6 9 12 15 18 9" /></svg>
const RefreshIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>

interface DataTableProps { filters: Filters }
type SortKey = 'platform' | 'country' | 'industry' | 'ad_spend' | 'revenue' | 'ROAS' | 'CTR' | 'CPC' | 'conversions'
type SortDirection = 'asc' | 'desc'
const ITEMS_PER_PAGE = 20

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}
function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toLocaleString()
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`
}
const PlatformBadge = memo(function PlatformBadge({ platform }: { platform: string }) {
  const cls = platform.toLowerCase().includes('google') ? 'google' : platform.toLowerCase().includes('meta') ? 'meta' : 'tiktok'
  return <span className={`platform-badge ${cls}`}>{platform}</span>
})

function DataTable({ filters }: DataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('ROAS')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  
  const { data, loading, error, refetch } = usePerformance(
    filters.platform || undefined, filters.country || undefined, 
    filters.industry || undefined, filters.campaignType || undefined, 200
  )

  const sortedData = useMemo(() => {
    if (!data) return []
    return [...data].sort((a, b) => {
      const aVal = a[sortKey], bVal = b[sortKey]
      if (typeof aVal === 'string' && typeof bVal === 'string') 
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })
  }, [data, sortKey, sortDirection])

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedData.slice(start, start + ITEMS_PER_PAGE)
  }, [sortedData, currentPage])

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDirection('desc') }
    setCurrentPage(1)
  }, [sortKey])

  if (loading) return (
    <div className="table-container">
      <div className="table-header"><div className="skeleton" style={{ height: '20px', width: '150px' }} /></div>
      <div style={{ padding: '16px' }}>{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: '48px', marginBottom: '8px' }} />)}</div>
    </div>
  )
  if (error) return (
    <div className="table-container">
      <div className="table-header"><div className="table-title"><TableIcon /> Campaign Performance</div></div>
      <div className="error-state"><h3 className="error-state-title">Unable to load data</h3><button className="error-state-action" onClick={refetch}><RefreshIcon /> Retry</button></div>
    </div>
  )
  if (!data || data.length === 0) return (
    <div className="table-container">
      <div className="table-header"><div className="table-title"><TableIcon /> Campaign Performance</div></div>
      <div className="empty-state"><p>No campaigns match your current filters</p></div>
    </div>
  )

  const columns: { key: SortKey; label: string; format?: (val: number) => string; align?: 'left' | 'right' }[] = [
    { key: 'platform', label: 'Platform', align: 'left' },
    { key: 'country', label: 'Country', align: 'left' },
    { key: 'industry', label: 'Industry', align: 'left' },
    { key: 'ad_spend', label: 'Spend', format: formatCurrency, align: 'right' },
    { key: 'revenue', label: 'Revenue', format: formatCurrency, align: 'right' },
    { key: 'ROAS', label: 'ROAS', format: (v) => `${v.toFixed(2)}x`, align: 'right' },
    { key: 'CTR', label: 'CTR', format: formatPercent, align: 'right' },
    { key: 'CPC', label: 'CPC', format: formatCurrency, align: 'right' },
    { key: 'conversions', label: 'Conv.', format: formatNumber, align: 'right' },
  ]

  const startRecord = (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endRecord = Math.min(currentPage * ITEMS_PER_PAGE, sortedData.length)

  return (
    <div className="table-container animate-in">
      <div className="table-header">
        <h3 className="table-title"><TableIcon /> Campaign Performance</h3>
        
        <span className="table-count"><DatabaseIcon /> Showing {sortedData.length} records</span>
      </div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} onClick={() => handleSort(col.key)} className={sortKey === col.key ? 'sorted' : ''} style={{ textAlign: col.align || 'left' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>{col.label}<SortIcon direction={sortKey === col.key ? sortDirection : null} /></span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr key={index}>
                <td><PlatformBadge platform={row.platform} /></td>
                <td>{row.country}</td>
                <td className="truncate" style={{ maxWidth: '140px' }}>{row.industry}</td>
                <td className="numeric">{formatCurrency(row.ad_spend)}</td>
                <td className="numeric">{formatCurrency(row.revenue)}</td>
                <td className="numeric" style={{ color: row.ROAS >= 2 ? 'var(--metric-positive)' : row.ROAS < 1 ? 'var(--metric-negative)' : 'inherit', fontWeight: 600 }}>{row.ROAS.toFixed(2)}x</td>
                <td className="numeric">{formatPercent(row.CTR)}</td>
                <td className="numeric">{formatCurrency(row.CPC)}</td>
                <td className="numeric">{formatNumber(row.conversions)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-pagination">
        <span className="pagination-info">Showing {startRecord}–{endRecord} of {sortedData.length}</span>
        <div className="pagination-controls">
          <button className="pagination-btn" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><ChevronLeftIcon /> Prev</button>
          <div className="pagination-pages">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i
              return <button key={pageNum} className={`pagination-page ${currentPage === pageNum ? 'active' : ''}`} onClick={() => setCurrentPage(pageNum)}>{pageNum}</button>
            })}
          </div>
          <button className="pagination-btn" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Next <ChevronRightIcon /></button>
        </div>
      </div>
    </div>
  )
}

export default memo(DataTable)
