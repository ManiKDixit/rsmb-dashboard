import { useState, useMemo, memo } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Area,
//   AreaChart,
// } from "recharts";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useTrends } from "../hooks/useApi";
import { useTheme } from "../hooks/useTheme";
//import { getMetricColor, METRIC_COLORS } from "../utils/chartColors";
import { getMetricColor } from "../utils/chartColors";
import type { Filters } from "../types";

const TrendIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

type TrendMetric = "revenue" | "ad_spend" | "ROAS" | "conversions";

const METRIC_OPTIONS: { value: TrendMetric; label: string }[] = [
  { value: "revenue", label: "Revenue" },
  { value: "ad_spend", label: "Ad Spend" },
  { value: "ROAS", label: "ROAS" },
  { value: "conversions", label: "Conversions" },
];

function formatValue(value: number, metric: string): string {
  if (metric === "ROAS") return `${value.toFixed(2)}x`;
  if (metric === "revenue" || metric === "ad_spend") {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  }
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toLocaleString();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

// function TrendChart() {
function TrendChart({ filters }: { filters: Filters }) {
  const { theme } = useTheme();
  const [metric, setMetric] = useState<TrendMetric>("revenue");
  // const { data, loading, error } = useTrends(metric, "month");

  const { data, loading, error } = useTrends(
    metric,
    "month",
    filters.platform || undefined,
    filters.country || undefined,
    filters.industry || undefined,
    filters.campaignType || undefined,
  );

  const chartData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((point) => ({
      date: formatDate(point.date),
      value: point.value,
      rawDate: point.date,
    }));
  }, [data]);

  const color = getMetricColor(metric);

  if (loading) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <div
            className="skeleton"
            style={{ height: "20px", width: "200px" }}
          />
        </div>
        <div className="chart-body">
          <div className="skeleton" style={{ height: "100%", width: "100%" }} />
        </div>
      </div>
    );
  }

  if (error || chartData.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">
            <TrendIcon /> Performance Trend
          </h3>
        </div>
        <div
          className="chart-body"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-tertiary)",
          }}
        >
          {/* <p>No trend data available</p> */}
          <p>
            {error
              ? `Unable to load trend data: ${error}`
              : "No trend data available"}
          </p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        style={{
          background: theme === "dark" ? "rgba(10,10,10,0.95)" : "#fff",
          border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.1)" : "#e2e8f0"}`,
          borderRadius: "8px",
          padding: "10px 14px",
          boxShadow:
            theme === "dark"
              ? "0 4px 20px rgba(0,0,0,0.4)"
              : "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontWeight: 600,
            color: theme === "dark" ? "#fff" : "#000",
            marginBottom: "4px",
          }}
        >
          {label}
        </p>
        <p style={{ margin: 0, color, fontSize: "0.9rem", fontWeight: 600 }}>
          {formatValue(payload[0].value, metric)}
        </p>
      </div>
    );
  };

  return (
    <div className="chart-container animate-in">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">
            <TrendIcon /> Performance Over Time
          </h3>
          <p className="chart-subtitle">Monthly trend analysis</p>
        </div>
        <div className="chart-controls">
          {METRIC_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`trend-btn ${metric === opt.value ? "active" : ""}`}
              onClick={() => setMetric(opt.value)}
              style={
                metric === opt.value
                  ? {
                      borderColor: getMetricColor(opt.value),
                      color: getMetricColor(opt.value),
                    }
                  : {}
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient
                id={`gradient-${metric}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme === "dark" ? "rgba(255,255,255,0.05)" : "#e2e8f0"}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{
                fill: theme === "dark" ? "#606060" : "#64748b",
                fontSize: 11,
              }}
              tickLine={false}
              axisLine={{
                stroke: theme === "dark" ? "rgba(255,255,255,0.1)" : "#e2e8f0",
              }}
            />
            <YAxis
              tick={{
                fill: theme === "dark" ? "#606060" : "#64748b",
                fontSize: 11,
              }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatValue(v, metric)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${metric})`}
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default memo(TrendChart);
