import { memo, useMemo } from "react";
import { useSummary } from "../hooks/useApi";
import type { Filters } from "../types";

const DollarIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const TrendUpIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
const ChartBarIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const TargetIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const MousePointerIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
  </svg>
);
const ZapIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const UsersIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
  </svg>
);
const RefreshIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);
const AlertIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function formatNumber(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="summary-card">
      <div
        className="skeleton"
        style={{
          height: "40px",
          width: "40px",
          marginBottom: "12px",
          borderRadius: "10px",
        }}
      />
      <div
        className="skeleton"
        style={{ height: "14px", width: "60%", marginBottom: "12px" }}
      />
      <div className="skeleton" style={{ height: "36px", width: "80%" }} />
    </div>
  );
});

const ErrorCard = memo(function ErrorCard({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <div
      className="summary-card"
      style={{
        gridColumn: "1 / -1",
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,71,87,0.1)",
            borderRadius: "12px",
            color: "#ff4757",
          }}
        >
          <AlertIcon />
        </div>
        <div>
          <h3
            style={{ margin: "0 0 8px 0", fontSize: "1rem", fontWeight: 600 }}
          >
            Failed to load metrics
          </h3>
          <p
            style={{
              margin: "0 0 16px 0",
              fontSize: "0.875rem",
              color: "var(--text-tertiary)",
            }}
          >
            Make sure the backend is running
          </p>
        </div>
        <button
          onClick={onRetry}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            background: "var(--accent-primary)",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <RefreshIcon /> Try Again
        </button>
      </div>
    </div>
  );
});

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  trend?: { value: number; positive: boolean };
  accentColor?: string;
  animationDelay?: number;
}

const MetricCard = memo(function MetricCard({
  icon,
  label,
  value,
  subtitle,
  trend,
  accentColor,
  animationDelay = 0,
}: MetricCardProps) {
  return (
    <div
      className="summary-card animate-in"
      style={
        {
          "--card-accent": accentColor,
          animationDelay: `${animationDelay}ms`,
        } as React.CSSProperties
      }
    >
      <div className="summary-card-icon">{icon}</div>
      <p className="summary-card-label">{label}</p>
      <p className="summary-card-value">{value}</p>
      {subtitle && <p className="summary-card-subtitle">{subtitle}</p>}
      {trend && (
        <span
          className={`summary-card-trend ${trend.positive ? "positive" : "negative"}`}
        >
          <TrendUpIcon /> {trend.positive ? "+" : ""}
          {trend.value.toFixed(1)}%
        </span>
      )}
    </div>
  );
});

// function SummaryCards() {
//   const { data, loading, error, refetch } = useSummary()

function SummaryCards({ filters }: { filters: Filters }) {
  const { data, loading, error, refetch } = useSummary(
    filters.platform || undefined,
    filters.country || undefined,
    filters.industry || undefined,
    filters.campaignType || undefined,
  );

  const metrics = useMemo(() => {
    if (!data) return [];
    return [
      {
        icon: <DollarIcon />,
        label: "Total Ad Spend",
        value: formatCurrency(data.total_spend),
        subtitle: `${formatNumber(data.record_count)} campaigns`,
        accentColor: "#6366f1",
      },
      {
        icon: <ChartBarIcon />,
        label: "Total Revenue",
        value: formatCurrency(data.total_revenue),
        subtitle: "Generated from ads",
        accentColor: "#00ff88",
      },
      // {
      //   icon: <TargetIcon />,
      //   label: "Overall ROAS",
      //   value: data.avg_roas.toFixed(2) + "x",
      //   subtitle: "Return on ad spend",
      //   trend: { value: 12.5, positive: true },
      //   accentColor: "#00f5ff",
      // },
      {
        icon: <TargetIcon />,
        label: "Overall ROAS",
        value: data.avg_roas.toFixed(2) + "x",
        subtitle: "Return on ad spend",
        accentColor: "#00f5ff",
      },

      {
        icon: <MousePointerIcon />,
        label: "Overall CTR",
        value: formatPercent(data.avg_ctr),
        subtitle: "Click-through rate",
        accentColor: "#ff9f00",
      },
      {
        icon: <ZapIcon />,
        label: "Overall CPC",
        value: formatCurrency(data.avg_cpc),
        subtitle: "Cost per click",
        accentColor: "#ff5f9f",
      },
      {
        icon: <UsersIcon />,
        label: "Total Conversions",
        value: formatNumber(data.total_conversions),
        subtitle: "Across all platforms",
        accentColor: "#bf5fff",
      },
      // {
      //   icon: <UsersIcon />,
      //   label: "Total Conversions",
      //   value: formatNumber(data.total_conversions),
      //   subtitle: "Across all platforms",
      //   trend: { value: 8.3, positive: true },
      //   accentColor: "#bf5fff",
      // },
    ];
  }, [data]);

  if (loading)
    return (
      <div className="summary-grid">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  if (error || !data)
    return (
      <div className="summary-grid">
        <ErrorCard onRetry={refetch} />
      </div>
    );

  return (
    <div className="summary-grid">
      {metrics.map((metric, index) => (
        <MetricCard
          key={metric.label}
          {...metric}
          animationDelay={index * 50}
        />
      ))}
    </div>
  );
}

export default memo(SummaryCards);
