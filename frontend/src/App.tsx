import { useState, useCallback, memo } from 'react'
import { ThemeProvider, useTheme } from './hooks/useTheme'
import SummaryCards from './components/SummaryCards'
import KeyInsights from './components/KeyInsights'
import ExecutiveSummary from './components/ExecutiveSummary'
import FilterPanel from './components/FilterPanel'
import ComparisonChart from './components/ComparisonChart'
import SpendRevenueChart from './components/SpendRevenueChart'
import TrendChart from './components/TrendChart'
import PlatformPieChart from './components/PlatformPieChart'
import DataTable from './components/DataTable'
import type { Filters } from './types'

const ChartIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
const SunIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /></svg>
const MoonIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
const ZapIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>

const ThemeToggle = memo(function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
})

const Header = memo(function Header() {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <div className="logo-mark"><ChartIcon /></div>
            <div>
              <span className="logo-text"><ZapIcon /> RSMB Analytics</span>
              <p className="logo-subtitle">Ads Performance Dashboard</p>
            </div>
          </div>
        </div>
        <div className="header-right"><ThemeToggle /></div>
      </div>
    </header>
  )
})

function Dashboard() {
  const [filters, setFilters] = useState<Filters>({
    platform: '', country: '', industry: '', campaignType: '', metric: 'ROAS', groupBy: 'platform',
  })

  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters)
  }, [])

  return (
    <div className="app-container">
      <Header />
      <main className="app-main">
       
        <SummaryCards filters={filters} />
        
       
        <KeyInsights filters={filters} />

        
        <div className="dashboard-grid">
          <aside className="dashboard-sidebar">
            <FilterPanel filters={filters} onChange={handleFilterChange} />
          </aside>

          <div className="dashboard-content">
            
            <TrendChart filters={filters} />
            
            
            <div className="charts-grid">
              <ComparisonChart filters={filters} />
              <SpendRevenueChart filters={filters} />
            </div>

            
            <div className="charts-row">
              <PlatformPieChart metric="ad_spend" title="Spend by Platform" filters={filters} />
              <PlatformPieChart metric="revenue" title="Revenue by Platform" filters={filters} />
              <PlatformPieChart metric="conversions" title="Conversions by Platform" filters={filters} />
            </div>


             <ExecutiveSummary filters={filters} />

            
            <DataTable filters={filters} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  )
}
