import { useMemo, memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useComparison } from "../hooks/useApi";
import { useTheme } from "../hooks/useTheme";
import { METRIC_COLORS } from "../utils/chartColors";
import type { Filters } from "../types";

const DollarIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

// function SpendRevenueChart() {
function SpendRevenueChart({ filters }: { filters: Filters }) {
  const { theme } = useTheme();
  // const { data: spendData, loading: spendLoading } = useComparison('ad_spend', 'platform')
  // const { data: revenueData, loading: revenueLoading } = useComparison('revenue', 'platform')

  const { data: spendData, loading: spendLoading } = useComparison(
    "ad_spend",
    "platform",
    filters.platform || undefined,
    filters.country || undefined,
    filters.industry || undefined,
    filters.campaignType || undefined,
  );

  const { data: revenueData, loading: revenueLoading } = useComparison(
    "revenue",
    "platform",
    filters.platform || undefined,
    filters.country || undefined,
    filters.industry || undefined,
    filters.campaignType || undefined,
  );

  // const chartData = useMemo(() => {
  //   if (!spendData || !revenueData || !spendData.values || !revenueData.values)
  //     return [];
  //   return spendData.labels.map((label, index) => ({
  //     name: label,
  //     spend: spendData.values[index] || 0,
  //     revenue: revenueData.values[index] || 0,
  //   }));
  // }, [spendData, revenueData]);

  const chartData = useMemo(() => {
  if (!spendData?.labels?.length || !revenueData?.labels?.length) return []

  const revenueMap = new Map(
    revenueData.labels.map((label, index) => [
      label,
      revenueData.values[index] || 0,
    ])
  )

  return spendData.labels.map((label, index) => ({
    name: label,
    spend: spendData.values[index] || 0,
    revenue: revenueMap.get(label) || 0,
  }))
}, [spendData, revenueData])

  if (spendLoading || revenueLoading)
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

  if (chartData.length === 0)
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">
            <DollarIcon /> Spend vs Revenue
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
          <p>No data available</p>
        </div>
      </div>
    );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
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
          {label}
        </p>
        {payload.map((e: any, i: number) => (
          <p
            key={i}
            style={{ margin: "4px 0 0", color: e.color, fontSize: "0.85rem" }}
          >
            {e.name === "spend" ? "Ad Spend" : "Revenue"}:{" "}
            {formatCurrency(e.value)}
          </p>
        ))}
        {payload.length === 2 && payload[0].value > 0 && (
          <p
            style={{
              margin: "8px 0 0",
              color: METRIC_COLORS.ROAS,
              fontSize: "0.8rem",
              fontWeight: 600,
            }}
          >
            ROAS: {(payload[1].value / payload[0].value).toFixed(2)}x
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="chart-container animate-in">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">
            <DollarIcon /> Spend vs Revenue by Platform
          </h3>
          <p className="chart-subtitle">Compare investment against returns</p>
        </div>
      </div>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            barCategoryGap="25%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme === "dark" ? "rgba(255,255,255,0.05)" : "#e2e8f0"}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{
                fill: theme === "dark" ? "#a0a0a0" : "#64748b",
                fontSize: 12,
              }}
              tickLine={false}
              axisLine={{
                stroke: theme === "dark" ? "rgba(255,255,255,0.1)" : "#e2e8f0",
              }}
            />
            <YAxis
              tick={{
                fill: theme === "dark" ? "#606060" : "#64748b",
                fontSize: 12,
              }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "transparent" }}
            />
            <Legend
              formatter={(v) => (
                <span
                  style={{ color: "var(--text-secondary)", fontSize: "12px" }}
                >
                  {v === "spend" ? "Ad Spend" : "Revenue"}
                </span>
              )}
            />
            <Bar
              dataKey="spend"
              name="spend"
              fill={METRIC_COLORS.ad_spend}
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
              animationDuration={600}
            />
            <Bar
              dataKey="revenue"
              name="revenue"
              fill={METRIC_COLORS.revenue}
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
              animationDuration={600}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default memo(SpendRevenueChart);
