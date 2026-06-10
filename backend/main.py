from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import pandas as pd
import numpy as np
from pathlib import Path

app = FastAPI(
    title="RSMB Analytics API",
    description="Lightweight analytics API for comparing digital advertising performance",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_data() -> pd.DataFrame:
    
    data_dir = Path(__file__).parent / "data"
    csv_files = list(data_dir.glob("*.csv"))
    
    if not csv_files:
        return pd.DataFrame()
    
    df = pd.read_csv(csv_files[0])
    
    
    df.columns = df.columns.str.lower().str.strip()
    
    
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
    
    
    numeric_cols = ['impressions', 'clicks', 'conversions', 'ad_spend', 'revenue', 'ctr', 'cpc', 'cpa', 'roas']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
    
    return df


def apply_filters(
    df: pd.DataFrame,
    platform: Optional[str] = None,
    country: Optional[str] = None,
    industry: Optional[str] = None,
    campaign_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> pd.DataFrame:
    if platform and 'platform' in df.columns:
        df = df[df['platform'] == platform]
    if country and 'country' in df.columns:
        df = df[df['country'] == country]
    if industry and 'industry' in df.columns:
        df = df[df['industry'] == industry]
    if campaign_type and 'campaign_type' in df.columns:
        df = df[df['campaign_type'] == campaign_type]
    if start_date and 'date' in df.columns:
        df = df[df['date'] >= pd.to_datetime(start_date)]
    if end_date and 'date' in df.columns:
        df = df[df['date'] <= pd.to_datetime(end_date)]
    return df


def calculate_aggregates(df: pd.DataFrame) -> dict:
    if df.empty:
        return {
            'total_spend': 0, 'total_revenue': 0, 'total_impressions': 0,
            'total_clicks': 0, 'total_conversions': 0,
            'avg_ctr': 0, 'avg_cpc': 0, 'avg_cpa': 0, 'avg_roas': 0,
            'record_count': 0
        }
    
    total_spend = float(df['ad_spend'].sum()) if 'ad_spend' in df.columns else 0
    total_revenue = float(df['revenue'].sum()) if 'revenue' in df.columns else 0
    total_impressions = float(df['impressions'].sum()) if 'impressions' in df.columns else 0
    total_clicks = float(df['clicks'].sum()) if 'clicks' in df.columns else 0
    total_conversions = float(df['conversions'].sum()) if 'conversions' in df.columns else 0
    
    
    avg_ctr = (total_clicks / total_impressions) if total_impressions > 0 else 0
    avg_cpc = (total_spend / total_clicks) if total_clicks > 0 else 0
    avg_cpa = (total_spend / total_conversions) if total_conversions > 0 else 0
    avg_roas = (total_revenue / total_spend) if total_spend > 0 else 0
    
    return {
        'total_spend': round(total_spend, 2),
        'total_revenue': round(total_revenue, 2),
        'total_impressions': round(total_impressions, 0),
        'total_clicks': round(total_clicks, 0),
        'total_conversions': round(total_conversions, 0),
        'avg_ctr': round(avg_ctr, 6),
        'avg_cpc': round(avg_cpc, 4),
        'avg_cpa': round(avg_cpa, 4),
        'avg_roas': round(avg_roas, 4),
        'record_count': len(df)
    }


class HealthResponse(BaseModel):
    status: str
    data_loaded: bool
    record_count: int


class SummaryResponse(BaseModel):
    total_spend: float
    total_revenue: float
    total_impressions: float
    total_clicks: float
    total_conversions: float
    avg_roas: float
    avg_ctr: float
    avg_cpc: float
    avg_cpa: float
    record_count: int


class PlatformMetrics(BaseModel):
    platform: str
    total_spend: float
    total_revenue: float
    total_impressions: float
    total_clicks: float
    total_conversions: float
    ctr: float
    cpc: float
    cpa: float
    roas: float
    record_count: int


class PlatformsResponse(BaseModel):
    platforms: List[PlatformMetrics]


class CampaignRecord(BaseModel):
    platform: Optional[str] = None
    country: Optional[str] = None
    industry: Optional[str] = None
    campaign_type: Optional[str] = None
    date: Optional[str] = None
    impressions: float
    clicks: float
    conversions: float
    ad_spend: float
    revenue: float
    ctr: float
    cpc: float
    cpa: float
    roas: float


class CampaignsResponse(BaseModel):
    campaigns: List[dict]
    total_count: int
    page: int
    page_size: int


class TrendPoint(BaseModel):
    date: str
    value: float


class TrendsResponse(BaseModel):
    data: List[TrendPoint]
    metric: str


class CompareResponse(BaseModel):
    labels: List[str]
    values: List[float]
    metric: str
    group_by: str


class InsightsResponse(BaseModel):
    best_roas_platform: str
    best_roas_value: float
    highest_revenue_country: str
    highest_revenue_value: float
    lowest_cpa_industry: str
    lowest_cpa_value: float
    highest_spend_lowest_roas: str


class Finding(BaseModel):
    type: str
    title: str
    description: str
    metric: str


class Recommendation(BaseModel):
    action: str
    impact: str


class ExecutiveSummaryResponse(BaseModel):
    total_spend: float
    total_revenue: float
    overall_roas: float
    record_count: int
    findings: List[Finding]
    recommendations: List[Recommendation]



@app.get("/health", response_model=HealthResponse, tags=["Core"])
@app.get("/api/health", response_model=HealthResponse, tags=["Core"])
async def health_check():
   
    df = load_data()
    return HealthResponse(
        status="healthy",
        data_loaded=not df.empty,
        record_count=len(df)
    )


@app.get("/platforms", response_model=PlatformsResponse, tags=["Core"])
@app.get("/api/platforms-summary", response_model=PlatformsResponse, tags=["Core"])
async def get_platforms_summary():
   
    df = load_data()
    
    if df.empty or 'platform' not in df.columns:
        return PlatformsResponse(platforms=[])
    
    platforms = []
    for platform_name in df['platform'].unique():
        platform_df = df[df['platform'] == platform_name]
        agg = calculate_aggregates(platform_df)
        
        platforms.append(PlatformMetrics(
            platform=platform_name,
            total_spend=agg['total_spend'],
            total_revenue=agg['total_revenue'],
            total_impressions=agg['total_impressions'],
            total_clicks=agg['total_clicks'],
            total_conversions=agg['total_conversions'],
            ctr=agg['avg_ctr'],
            cpc=agg['avg_cpc'],
            cpa=agg['avg_cpa'],
            roas=agg['avg_roas'],
            record_count=agg['record_count']
        ))
    
    
    platforms.sort(key=lambda x: x.roas, reverse=True)
    
    return PlatformsResponse(platforms=platforms)


@app.get("/campaigns", response_model=CampaignsResponse, tags=["Core"])
@app.get("/api/campaigns", response_model=CampaignsResponse, tags=["Core"])
async def get_campaigns(
    platform: Optional[str] = Query(None, description="Filter by platform"),
    country: Optional[str] = Query(None, description="Filter by country"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    campaign_type: Optional[str] = Query(None, description="Filter by campaign type"),
    start_date: Optional[str] = Query(None, description="Filter by start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Filter by end date (YYYY-MM-DD)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=500, description="Results per page")
):
    
   
    df = load_data()
    
    if df.empty:
        return CampaignsResponse(campaigns=[], total_count=0, page=page, page_size=page_size)
    
    df = apply_filters(df, platform, country, industry, campaign_type, start_date, end_date)
    
    total_count = len(df)
    
    
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    page_df = df.iloc[start_idx:end_idx]
    
    
    cols = ['platform', 'country', 'industry', 'campaign_type', 'date',
            'impressions', 'clicks', 'conversions', 'ad_spend', 'revenue',
            'ctr', 'cpc', 'cpa', 'roas']
    available = [c for c in cols if c in page_df.columns]
    result = page_df[available].copy()
    
    
    if 'date' in result.columns:
        result['date'] = result['date'].dt.strftime('%Y-%m-%d')
    
    
    result = result.rename(columns={'ctr': 'CTR', 'cpc': 'CPC', 'cpa': 'CPA', 'roas': 'ROAS'})
    
    return CampaignsResponse(
        campaigns=result.to_dict(orient='records'),
        total_count=total_count,
        page=page,
        page_size=page_size
    )


@app.get("/metrics/summary", response_model=SummaryResponse, tags=["Core"])
@app.get("/api/summary", response_model=SummaryResponse, tags=["Core"])
async def get_summary(
    platform: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    campaign_type: Optional[str] = Query(None)
):
    
    df = load_data()
    
    if df.empty:
        return SummaryResponse(
            total_spend=0, total_revenue=0, total_impressions=0, total_clicks=0,
            total_conversions=0, avg_roas=0, avg_ctr=0, avg_cpc=0, avg_cpa=0, record_count=0
        )
    
    df = apply_filters(df, platform, country, industry, campaign_type)
    agg = calculate_aggregates(df)
    
    return SummaryResponse(**agg)


@app.get("/metrics/trends", response_model=TrendsResponse, tags=["Core"])
@app.get("/api/trends", response_model=TrendsResponse, tags=["Core"])
@app.get("/metrics/trends", response_model=TrendsResponse, tags=["Core"])
@app.get("/api/trends", response_model=TrendsResponse, tags=["Core"])
async def get_trends(
    metric: str = Query("revenue", description="Metric to trend: revenue, ad_spend, ROAS, CTR, CPC, CPA, conversions"),
    interval: str = Query("month", description="Aggregation interval: day, week, month"),
    platform: Optional[str] = None,
    country: Optional[str] = None,
    industry: Optional[str] = None,
    campaign_type: Optional[str] = None
):
    
    df = load_data()

    if df.empty or "date" not in df.columns:
        return TrendsResponse(data=[], metric=metric)

    try:
        df = df.copy()

        
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        df = df.dropna(subset=["date"])

        if df.empty:
            return TrendsResponse(data=[], metric=metric)

        
        df = apply_filters(df, platform, country, industry, campaign_type)

        if df.empty:
            return TrendsResponse(data=[], metric=metric)

        
        df = df.sort_values("date").set_index("date")

        
        freq_map = {
            "day": "D",
            "week": "W",
            "month": "ME"
        }
        freq = freq_map.get(interval, "ME")

        
        agg_cols = {
            col: "sum"
            for col in ["impressions", "clicks", "conversions", "ad_spend", "revenue"]
            if col in df.columns
        }

        if not agg_cols:
            return TrendsResponse(data=[], metric=metric)

        resampled = df.resample(freq).agg(agg_cols)

        metric_lower = metric.lower()

        if metric_lower == "ctr":
            if "clicks" not in resampled.columns or "impressions" not in resampled.columns:
                return TrendsResponse(data=[], metric=metric)
            values = (resampled["clicks"] / resampled["impressions"].replace(0, np.nan)) * 100

        elif metric_lower == "cpc":
            if "ad_spend" not in resampled.columns or "clicks" not in resampled.columns:
                return TrendsResponse(data=[], metric=metric)
            values = resampled["ad_spend"] / resampled["clicks"].replace(0, np.nan)

        elif metric_lower == "cpa":
            if "ad_spend" not in resampled.columns or "conversions" not in resampled.columns:
                return TrendsResponse(data=[], metric=metric)
            values = resampled["ad_spend"] / resampled["conversions"].replace(0, np.nan)

        elif metric_lower == "roas":
            if "revenue" not in resampled.columns or "ad_spend" not in resampled.columns:
                return TrendsResponse(data=[], metric=metric)
            values = resampled["revenue"] / resampled["ad_spend"].replace(0, np.nan)

        elif metric_lower in resampled.columns:
            values = resampled[metric_lower]

        else:
            return TrendsResponse(data=[], metric=metric)

        values = values.replace([np.inf, -np.inf], np.nan).dropna()

        data = [
            TrendPoint(
                date=date.strftime("%Y-%m-%d"),
                value=round(float(value), 4)
            )
            for date, value in values.items()
        ]

        return TrendsResponse(data=data, metric=metric)

    except Exception as error:
        print("TREND ENDPOINT ERROR:", error)
        return TrendsResponse(data=[], metric=metric)



@app.get("/api/compare", response_model=CompareResponse, tags=["Extended"])
async def get_comparison(
    metric: str = Query("ROAS"),
    group_by: str = Query("platform"),
    platform: Optional[str] = None,
    country: Optional[str] = None,
    industry: Optional[str] = None,
    campaign_type: Optional[str] = None
):
    
    df = load_data()
    
    if df.empty or group_by not in df.columns:
        return CompareResponse(labels=[], values=[], metric=metric, group_by=group_by)
    
    df = apply_filters(df, platform, country, industry, campaign_type)
    
    if df.empty:
        return CompareResponse(labels=[], values=[], metric=metric, group_by=group_by)
    
    grouped = df.groupby(group_by).agg({
        'impressions': 'sum', 'clicks': 'sum', 'conversions': 'sum',
        'ad_spend': 'sum', 'revenue': 'sum'
    })
    
    metric_lower = metric.lower()
    if metric_lower == 'ctr':
        values = (grouped['clicks'] / grouped['impressions'].replace(0, np.nan)) * 100
    elif metric_lower == 'cpc':
        values = grouped['ad_spend'] / grouped['clicks'].replace(0, np.nan)
    elif metric_lower == 'cpa':
        values = grouped['ad_spend'] / grouped['conversions'].replace(0, np.nan)
    elif metric_lower == 'roas':
        values = grouped['revenue'] / grouped['ad_spend'].replace(0, np.nan)
    elif metric_lower in grouped.columns:
        values = grouped[metric_lower]
    else:
        return CompareResponse(labels=[], values=[], metric=metric, group_by=group_by)
    
    result = values.dropna().sort_values(ascending=False)
    
    return CompareResponse(
        labels=result.index.tolist(),
        values=[round(float(v), 4) for v in result.values],
        metric=metric, group_by=group_by
    )


@app.get("/api/insights", response_model=InsightsResponse, tags=["Extended"])
async def get_insights(
    platform: Optional[str] = None,
    country: Optional[str] = None,
    industry: Optional[str] = None,
    campaign_type: Optional[str] = None
):
    
    df = load_data()
    
    default = InsightsResponse(
        best_roas_platform="N/A", best_roas_value=0,
        highest_revenue_country="N/A", highest_revenue_value=0,
        lowest_cpa_industry="N/A", lowest_cpa_value=0,
        highest_spend_lowest_roas="N/A"
    )
    
    if df.empty:
        return default
    
    df = apply_filters(df, platform, country, industry, campaign_type)
    
    if df.empty:
        return default
    
    try:
        
        if 'platform' in df.columns and len(df['platform'].unique()) > 0:
            plat = df.groupby('platform').agg({'revenue': 'sum', 'ad_spend': 'sum'})
            plat['roas'] = plat['revenue'] / plat['ad_spend'].replace(0, np.nan)
            best_plat = plat['roas'].idxmax()
            best_plat_val = float(plat.loc[best_plat, 'roas'])
        else:
            best_plat, best_plat_val = "N/A", 0.0
        
        
        if 'country' in df.columns and len(df['country'].unique()) > 0:
            country_rev = df.groupby('country')['revenue'].sum()
            top_country = country_rev.idxmax()
            top_country_val = float(country_rev.max())
        else:
            top_country, top_country_val = "N/A", 0.0
        
        
        if 'industry' in df.columns and len(df['industry'].unique()) > 0:
            ind = df.groupby('industry').agg({'ad_spend': 'sum', 'conversions': 'sum'})
            ind['cpa'] = ind['ad_spend'] / ind['conversions'].replace(0, np.nan)
            low_cpa = ind['cpa'].dropna().idxmin()
            low_cpa_val = float(ind.loc[low_cpa, 'cpa'])
        else:
            low_cpa, low_cpa_val = "N/A", 0.0
        
        
        if 'platform' in df.columns and 'industry' in df.columns:
            seg = df.groupby(['platform', 'industry']).agg({'ad_spend': 'sum', 'revenue': 'sum'})
            seg['roas'] = seg['revenue'] / seg['ad_spend'].replace(0, np.nan)
            threshold = seg['ad_spend'].quantile(0.75)
            high_spend = seg[seg['ad_spend'] >= threshold]
            if not high_spend.empty:
                worst = high_spend['roas'].idxmin()
                inefficient = f"{worst[0]} / {worst[1]}"
            else:
                inefficient = "N/A"
        else:
            inefficient = "N/A"
        
        return InsightsResponse(
            best_roas_platform=str(best_plat),
            best_roas_value=round(best_plat_val, 2),
            highest_revenue_country=str(top_country),
            highest_revenue_value=round(top_country_val, 2),
            lowest_cpa_industry=str(low_cpa),
            lowest_cpa_value=round(low_cpa_val, 2),
            highest_spend_lowest_roas=inefficient
        )
    except Exception:
        return default


@app.get("/api/executive-summary", response_model=ExecutiveSummaryResponse, tags=["Extended"])
async def get_executive_summary(
    platform: Optional[str] = None,
    country: Optional[str] = None,
    industry: Optional[str] = None,
    campaign_type: Optional[str] = None
):
    
    df = load_data()
    
    default = ExecutiveSummaryResponse(
        total_spend=0, total_revenue=0, overall_roas=0, record_count=0,
        findings=[], recommendations=[]
    )
    
    if df.empty:
        return default
    
    df = apply_filters(df, platform, country, industry, campaign_type)
    
    if df.empty:
        return default
    
    total_spend = float(df['ad_spend'].sum())
    total_revenue = float(df['revenue'].sum())
    overall_roas = total_revenue / total_spend if total_spend > 0 else 0
    record_count = len(df)
    
    findings = []
    recommendations = []
    
    try:
        
        if 'platform' in df.columns and len(df['platform'].unique()) > 1:
            plat = df.groupby('platform').agg({'ad_spend': 'sum', 'revenue': 'sum'})
            plat['roas'] = plat['revenue'] / plat['ad_spend'].replace(0, np.nan)
            plat['spend_pct'] = (plat['ad_spend'] / plat['ad_spend'].sum() * 100)
            
            best_plat = plat['roas'].idxmax()
            best_plat_roas = float(plat.loc[best_plat, 'roas'])
            best_plat_spend_pct = float(plat.loc[best_plat, 'spend_pct'])
            
            worst_plat = plat['roas'].idxmin()
            worst_plat_roas = float(plat.loc[worst_plat, 'roas'])
            worst_plat_spend_pct = float(plat.loc[worst_plat, 'spend_pct'])
            
            if best_plat_spend_pct < 40 and best_plat_roas > worst_plat_roas * 1.5:
                findings.append(Finding(
                    type="opportunity",
                    title=f"{best_plat} delivers highest efficiency but may be underfunded",
                    description=f"{best_plat} achieves {best_plat_roas:.2f}x ROAS but receives only {best_plat_spend_pct:.1f}% of spend.",
                    metric=f"{best_plat_roas:.2f}x ROAS"
                ))
                recommendations.append(Recommendation(
                    action=f"Reallocate 15-20% of {worst_plat} budget to {best_plat}",
                    impact=f"Could improve overall ROAS based on {best_plat_roas:.2f}x vs {worst_plat_roas:.2f}x gap"
                ))
            
            if worst_plat_spend_pct > 40:
                findings.append(Finding(
                    type="warning",
                    title=f"{worst_plat} consumes {worst_plat_spend_pct:.0f}% of spend with lowest returns",
                    description=f"{worst_plat} delivers only {worst_plat_roas:.2f}x ROAS.",
                    metric=f"{worst_plat_roas:.2f}x ROAS"
                ))
        
        
        if 'country' in df.columns and len(df['country'].unique()) > 1:
            country_agg = df.groupby('country').agg({'ad_spend': 'sum', 'revenue': 'sum'})
            country_agg['roas'] = country_agg['revenue'] / country_agg['ad_spend'].replace(0, np.nan)
            
            best_roas_country = country_agg['roas'].idxmax()
            best_roas_val = float(country_agg.loc[best_roas_country, 'roas'])
            
            top_rev_country = country_agg['revenue'].idxmax()
            
            if top_rev_country != best_roas_country:
                findings.append(Finding(
                    type="insight",
                    title=f"{best_roas_country} outperforms on efficiency",
                    description=f"{best_roas_country} achieves {best_roas_val:.2f}x ROAS, higher than top revenue market.",
                    metric=f"{best_roas_val:.2f}x ROAS"
                ))
        
        
        if 'industry' in df.columns and len(df['industry'].unique()) > 1:
            ind = df.groupby('industry').agg({'ad_spend': 'sum', 'revenue': 'sum', 'conversions': 'sum'})
            ind['roas'] = ind['revenue'] / ind['ad_spend'].replace(0, np.nan)
            ind['cpa'] = ind['ad_spend'] / ind['conversions'].replace(0, np.nan)
            
            best_cpa_ind = ind['cpa'].idxmin()
            best_cpa_val = float(ind.loc[best_cpa_ind, 'cpa'])
            
            findings.append(Finding(
                type="opportunity",
                title=f"{best_cpa_ind} shows strongest conversion efficiency",
                description=f"{best_cpa_ind} has the lowest CPA (${best_cpa_val:.2f}).",
                metric=f"${best_cpa_val:.2f} CPA"
            ))
            recommendations.append(Recommendation(
                action=f"Expand {best_cpa_ind} campaigns",
                impact=f"Best conversion efficiency at ${best_cpa_val:.2f} CPA"
            ))
        
    except Exception as e:
        pass
    
    return ExecutiveSummaryResponse(
        total_spend=round(total_spend, 2),
        total_revenue=round(total_revenue, 2),
        overall_roas=round(overall_roas, 2),
        record_count=record_count,
        findings=findings,
        recommendations=recommendations
    )



@app.get("/api/platforms", tags=["Filters"])
async def get_platform_list():
    
    df = load_data()
    if df.empty or 'platform' not in df.columns:
        return []
    return sorted(df['platform'].dropna().unique().tolist())


@app.get("/api/countries", tags=["Filters"])
async def get_countries():
    
    df = load_data()
    if df.empty or 'country' not in df.columns:
        return []
    return sorted(df['country'].dropna().unique().tolist())


@app.get("/api/industries", tags=["Filters"])
async def get_industries():
    
    df = load_data()
    if df.empty or 'industry' not in df.columns:
        return []
    return sorted(df['industry'].dropna().unique().tolist())


@app.get("/api/campaign-types", tags=["Filters"])
async def get_campaign_types():
    
    df = load_data()
    if df.empty or 'campaign_type' not in df.columns:
        return []
    return sorted(df['campaign_type'].dropna().unique().tolist())


@app.get("/api/performance", tags=["Filters"])
async def get_performance(
    platform: Optional[str] = None,
    country: Optional[str] = None,
    industry: Optional[str] = None,
    campaign_type: Optional[str] = None,
    limit: int = Query(50, le=500)
):
    
    df = load_data()
    if df.empty:
        return []
    
    df = apply_filters(df, platform, country, industry, campaign_type)
    
    cols = ['platform', 'country', 'industry', 'ad_spend', 'revenue', 'impressions',
            'clicks', 'conversions', 'roas', 'ctr', 'cpc', 'cpa']
    available = [c for c in cols if c in df.columns]
    result = df[available].head(limit)
    result = result.rename(columns={'roas': 'ROAS', 'ctr': 'CTR', 'cpc': 'CPC', 'cpa': 'CPA'})
    return result.to_dict(orient='records')




@app.get("/", tags=["Core"])
async def root():
    
    return {
        "message": "RSMB Analytics API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "platforms": "/platforms",
            "campaigns": "/campaigns",
            "metrics_summary": "/metrics/summary",
            "metrics_trends": "/metrics/trends"
        }
    }
