# RSMB Ads Analytics Dashboard

This dashboard compares digital advertising performance across platforms (Google Ads, Meta Ads, TikTok Ads), industries, and countries.

There are 5 screenshots of the Dashboard in the screenshots folder

## Dataset Used

The Kaggle dataset: [Global Ads Performance (Google, Meta, TikTok)](https://www.kaggle.com/datasets/nudratabbas/global-ads-performance-google-meta-tiktok?utm_source=chatgpt.com)

## Instructions to run the project

Clone the repository on VS Code or any Editor you are using

**1. switch to the backend folder and install requirements **
```bash
cd backend
pip install -r requirements.txt
```

**2. Add the dataset:**
Download `global_ads_performance_dataset.csv` from Kaggle and place it in `backend/data/`.

**3. Start the backend:**
```bash
cd backend
uvicorn main:app --reload
```

**4. Install and start frontend:**
```bash
cd frontend
npm install
npm run dev
# Dashboard available at http://localhost:5173
```

---


## Design Notes and Trade-offs

### Current Implementation

This project is built as a small full-stack analytics prototype. I kept the implementation intentionally lightweight because the brief asked for a 2–3 hour case study rather than a production-ready platform.

### Backend approach

The backend is a FastAPI application in `backend/main.py`. For this prototype, I kept it mostly in one file so the data flow is easy to follow. It is a small ETL + analytics API pipeline . I have used pandas library for cleaning and aggregation and FastApi for JSON endpoints. The steps I used are mentioned below -

1. Load the CSV dataset from `backend/data/`
2. Normalise column names using the column mapping dictionary, so small differences in CSV headers do not break the API
3. Convert numeric columns such as spend, revenue, clicks and conversions into numeric values
4. Parse the date column for trend analysis
5. Apply optional filters such as platform, country, industry and campaign type
6. Return summary, comparison, trend and campaign-level data as JSON

The main API endpoints are:

* `GET /health` - quick service check
* `GET /platforms` - platform-level summary metrics
* `GET /campaigns` - campaign-level data with optional filters and pagination
* `GET /metrics/summary` - top-line spend, revenue, conversions, CTR and ROAS
* `GET /metrics/trends` - time-series data for revenue, spend, ROAS and other metrics

I also kept `/api/...` aliases for the frontend because the dashboard was originally built against those paths.

The most important backend decision was how efficiency metrics are calculated. For spend, revenue, impressions, clicks and conversions, summing the values is straightforward. However, metrics such as CTR, CPC, CPA and ROAS should not simply be averaged row by row, because campaign sizes can vary a lot.

For example, ROAS is calculated as:

```python
roas = total_revenue / total_spend
```

rather than:

```python
roas = df["roas"].mean()
```

This gives a more reliable comparison when grouping by platform, country or industry.

### Frontend approach

The frontend is a React + TypeScript dashboard built with Vite. It consumes the FastAPI endpoints through a small custom hook layer in `useApi.ts`.

The main idea is:

* `App.tsx` holds the selected filters
* filter values are passed into dashboard components
* components call the API with query parameters
* each component handles loading, error and empty states
* Recharts is used for the visualisations

The dashboard includes KPI cards, key insights, a trend chart, comparison charts, donut charts and a campaign performance table. I added more than the minimum requested chart/filter requirements because I wanted the dashboard to feel closer to a usable analytics product rather than just a technical API demo.

I used inline SVG icons as small React components instead of adding an icon package. This kept dependencies low and made it easy for the icons to inherit colours from the theme. 

I also made sure to add a Summary section on screen so the user gets an idea of what to interpret after looking at the Dashboard. 

### Dataset assumptions

I assumed each row in the dataset represents campaign performance for a platform/country/industry/date combination. I also assumed that:

* the dataset contains standard advertising metrics such as impressions, clicks, conversions, ad spend and revenue
* spend and revenue are in the same currency
* platform values are consistent enough to group by, for example Google Ads, Meta Ads and TikTok Ads
* date values are available for trend charts, but the API handles cases where dates are missing or invalid
* the CSV is a local static dataset for this prototype, so authentication and live ingestion are outside the current scope


### Validation and cleaning rules

The backend applies a few basic cleaning steps before returning data:

* expected column names are normalised where possible
* numeric columns are converted with `pd.to_numeric(..., errors="coerce")`
* invalid numeric values are treated as 0 for this prototype
* date values are parsed with `pd.to_datetime(..., errors="coerce")`
* invalid dates are excluded from trend calculations
* divide-by-zero cases are handled so the API does not crash
* empty filtered results return empty arrays or zero-value summaries rather than errors

These rules are simple, but they make the dashboard more robust when the CSV contains missing or imperfect values.

I had done a detailed Exploratory Data Analysis with 13 different techniques for my Coursework project during my Masters in AI, I used pandas and numpy and then deep learning models for training. That experience helped me a lot in data cleaning in this dashboard project.

---

## Scaling the Solution

For a production version, I would separate the system into clearer layers: ingestion, storage, transformation/aggregation, API, frontend, and monitoring.

### Data ingestion

Instead of loading a CSV directly from the backend folder, campaign data should be ingested through a scheduled pipeline. The source could be advertising platform exports, API connectors, or files uploaded to cloud storage.

I would design the ingestion process to support incremental loads rather than reprocessing the full dataset every time. For example, new campaign records could be loaded daily or hourly, with checks for duplicate records, missing required fields, invalid dates, and unexpected changes in row counts. Failed ingestion jobs should trigger alerts so data issues are visible before users see incorrect dashboard results.

I have done something similar during my work at Publicis Sapient where I would get datasets and reports every 2 hours for multiple clients.

### Data storage

For the prototype, pandas is enough because the dataset is small. At production scale, I would move the data into an analytical database or warehouse rather than keeping it as a CSV.

I would keep a raw layer for original ingested data, a cleaned layer for standardised campaign records, and an analytics layer for dashboard-ready aggregates. This would make the pipeline easier to debug and would also preserve the original data for auditing or reprocessing if business rules change later.

Common dashboard queries, such as spend by platform, revenue by country, monthly trends, and ROAS by industry, should be stored in aggregate tables or materialised views. This avoids recalculating expensive groupings from raw campaign rows on every API request.

### API performance

The API should query prepared analytical tables rather than performing all transformations at request time. For frequently used endpoints such as summary metrics, platform lists, and monthly trends, I would add caching and sensible cache expiry rules.

Campaign-level endpoints should use pagination, sorting and stricter query validation so large result sets are not returned all at once. I would also split the backend into modules such as routers, schemas, services and data access, because a single-file FastAPI app is easy for a prototype but harder to maintain as the product grows.

### Caching

I would cache read-heavy endpoints where the data does not need to update instantly. For example, filter options such as platform, country and industry can be cached for longer. Summary metrics and trend data could be cached for a shorter time depending on how often new campaign data is ingested.

I would be more careful with heavily filtered campaign-level results, because those may be user-specific or more varied. For those, I would prioritise database query performance and pagination first.

### Monitoring and data quality

In production, I would monitor both the application and the data pipeline. For the API, I would track response times, error rates, slow queries and traffic patterns. For the data pipeline, I would track ingestion success, row counts, freshness of the latest data, and validation failures.

This is important because analytics dashboards can fail in two ways: the application can break, or the application can keep working while showing stale or incorrect data. Monitoring should cover both.


### Security and access control

If the platform supported multiple clients or internal user groups, I would add authentication and role-based access control. Users should only be able to access the campaign data they are allowed to see.

I would also move secrets such as database credentials and API keys into a managed secret store rather than environment files committed locally. For client-specific data, I would consider tenant-level filtering and audit logging so access to sensitive campaign data can be reviewed later.

Overall, I would keep the same product flow as this prototype, but replace the local CSV and in-memory calculations with a proper ingestion pipeline, analytical storage, pre-aggregated metrics, caching, monitoring and access control.

---

## Azure and Snowflake Adaptation

I have not integrated Snowflake in this prototype, as the current version is designed around a local CSV and pandas-based processing. However, if this were adapted to RSMB’s Azure/Snowflake environment, I would keep the same product flow but move the data storage, processing and deployment into more production-suitable services.

I have previously worked with Azure services for hosting, managed cloud resources, remote compute environments and CI/CD pipelines, so I would approach the Azure side by separating the application into ingestion, storage, API and frontend layers.

### 1. Data ingestion

For a production version, the local CSV would be replaced with a scheduled ingestion process. Campaign data could arrive from advertising platform exports, APIs or uploaded files.

On Azure, I would use Azure Data Factory or a similar orchestration tool to manage this process. The ingestion pipeline would load raw files into Azure Blob Storage first, then run validation checks before loading the cleaned data into the analytical storage layer.

The checks I would add include required column validation, duplicate detection, date parsing, missing value checks and row-count monitoring. This would help catch data-quality issues before they appear in the dashboard.

### 2. Analytical storage

For the prototype, pandas is enough because the dataset is small. In a production setup, I would expect Snowflake to be used as the analytical warehouse.

A possible Snowflake structure would include:

* a raw table for ingested campaign data
* a cleaned campaign performance table with normalised columns
* aggregate tables or materialised views for common dashboard queries
* daily or monthly rollups for spend, revenue, ROAS, CTR, CPC and CPA

The FastAPI backend would then query Snowflake tables or views instead of reading a CSV file. This would make the dashboard more suitable for larger datasets and repeated user queries.

### 3. API layer

The FastAPI backend could be hosted on Azure App Service, Azure Container Apps or a containerised deployment depending on the expected traffic and operational requirements. This is something I have done in the past as well for clients.

For performance, I would avoid calculating every metric from raw campaign rows on each request. Instead, the API would read from prepared aggregate tables or materialised views. Endpoints such as summary metrics, platform comparisons and trend data are good candidates for this approach.

I would also add pagination, stricter request validation, better error logging and environment-based configuration for development, staging and production.

If we were to use microservices architecture in future I would also use RabbitMQ.

### 4. Caching

Some dashboard endpoints are likely to be read frequently but do not need to be recalculated every second. For example, platform lists, country lists, KPI summaries and trend responses could be cached.

On Azure, Azure Cache for Redis would be a suitable option for caching summary responses and filter options. The cache duration would depend on how often the campaign data is refreshed.

### 5. Frontend hosting

The React dashboard could be hosted on Azure Static Web Apps or another static hosting service. The frontend would use environment variables for the API base URL so the same codebase can work across local, staging and production environments.

I would use libraries like React Compiler and techniques like memoisation, virtualization etc for an optimised frontend experience in case of hige datasets.


This would also make the frontend easier to deploy through a CI/CD pipeline.

### 6. CI/CD and deployment

For deployment, I would use either Azure DevOps pipelines or GitHub Actions, most probably Azure DevOps pipeline, I have used it in the past, it's smooth and Aurora told me you use Bitbucket and Jira so it complements that setup. A basic pipeline would:

* install backend and frontend dependencies
* run type checks and build the React app
* run backend checks/tests where available
* deploy the frontend to Azure Static Web Apps
* deploy the FastAPI backend to Azure App Service or Azure Container Apps

In a larger setup, I would keep separate development, staging and production environments and use environment variables or managed configuration for API URLs, database connections and secrets. 

### 7. Security and access control

For a multi-user analytics platform, I would add authentication and role-based access control. If different client organisations used the same platform, users should only be able to view the data they are authorised to access.

In an Azure environment, authentication could be handled through Microsoft Entra ID. Secrets such as database credentials and API keys should be stored in a managed secret store rather than in the codebase.

Overall, the main change would be moving from a local prototype to a cloud-based analytics architecture: Azure for ingestion, hosting, CI/CD and operational services, and Snowflake for scalable analytical storage.


---

## AI Usage Statement

I used ChatGPT and Claude as an evaluation/understanding assistant and debugging while working on this task. I used it mainly to reason through the case study requirements, review the backend/API structure, debug frontend and backend issues, and improve the wording of the README and design notes.


I used ChatGPT to help interpret the case study brief, break the work into a realistic 2–3 hour plan, and decide which parts to prioritise: data processing, API endpoints, dashboard usability, README/design notes and final testing.

I also used AI while debugging specific issues during development. This included troubleshooting a Vite/Node setup issue, a blank frontend screen caused by missing component props, TypeScript build errors, API/frontend integration problems, and a FastAPI trend endpoint that was returning an internal server error. AI helped suggest possible causes and fixes, but I checked the changes myself by running the backend, testing API URLs in the browser, using the dashboard, and running `npm run build`.

AI was also useful for reviewing the analytics logic. In particular, I used it to think through why CTR, CPC, CPA and ROAS should be calculated from aggregated totals rather than averaged row by row, as simple averages can give misleading campaign comparisons.

For documentation, I used AI to help structure the README, explain implementation trade-offs, and write the Azure/Snowflake scaling section in a clearer way. I reviewed and edited the wording so it reflected my actual implementation and experience.

The main limitation I considered is that AI can produce plausible but incorrect suggestions. I treated AI responses as drafts or debugging guidance, not final answers, and validated the working behaviour through API responses, frontend checks and build output.

