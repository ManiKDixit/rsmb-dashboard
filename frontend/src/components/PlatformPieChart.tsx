import { useMemo, memo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useComparison } from "../hooks/useApi";
import { useTheme } from "../hooks/useTheme";
import { getPlatformColor } from "../utils/chartColors";
import type { Filters } from "../types";

const PieChartIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

// interface Props { metric: 'ad_spend' | 'revenue' | 'conversions'; title: string }

interface Props {
  metric: "ad_spend" | "revenue" | "conversions";
  title: string;
  filters: Filters;
}

function formatValue(value: number, metric: string): string {
  if (metric === "conversions") {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toLocaleString();
  }
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

// function PlatformPieChart({ metric, title }: Props) {

function PlatformPieChart({ metric, title, filters }: Props) {
  const { theme } = useTheme();
  // const { data, loading, error } = useComparison(metric, 'platform')

  const { data, loading, error } = useComparison(
    metric,
    "platform",
    filters.platform || undefined,
    filters.country || undefined,
    filters.industry || undefined,
    filters.campaignType || undefined,
  );

  const chartData = useMemo(() => {
    if (!data || !data.values || data.values.length === 0) return [];
    const total = data.values.reduce((a, b) => a + b, 0);
    return data.labels.map((label, index) => ({
      name: label,
      value: data.values[index],
      total,
    }));
  }, [data]);

  if (loading)
    return (
      <div className="chart-container chart-small">
        <div className="chart-header">
          <div
            className="skeleton"
            style={{ height: "20px", width: "150px" }}
          />
        </div>
        <div className="chart-body-small">
          <div className="skeleton" style={{ height: "100%", width: "100%" }} />
        </div>
      </div>
    );

  if (error || chartData.length === 0)
    return (
      <div className="chart-container chart-small">
        <div className="chart-header">
          <h3 className="chart-title">
            <PieChartIcon /> {title}
          </h3>
        </div>
        <div
          className="chart-body-small"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-tertiary)",
          }}
        >
          <p>No data available</p>
        </div>
      </div>
    );

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    const pct = ((d.value / d.payload.total) * 100).toFixed(1);
    return (
      <div
        style={{
          background: theme === "dark" ? "rgba(10,10,10,0.95)" : "#fff",
          border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.1)" : "#e2e8f0"}`,
          borderRadius: "8px",
          padding: "10px 14px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontWeight: 600,
            color: theme === "dark" ? "#fff" : "#000",
          }}
        >
          {d.name}
        </p>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
          }}
        >
          {formatValue(d.value, metric)} ({pct}%)
        </p>
      </div>
    );
  };

  return (
    <div className="chart-container chart-small animate-in">
      <div className="chart-header">
        <h3 className="chart-title">
          <PieChartIcon /> {title}
        </h3>
      </div>
      <div className="chart-body-small">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              animationDuration={600}
            >
              {chartData.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={getPlatformColor(entry.name, i)}
                  stroke={theme === "dark" ? "#0a0a0a" : "#fff"}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(v) => (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  {v}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default memo(PlatformPieChart);
