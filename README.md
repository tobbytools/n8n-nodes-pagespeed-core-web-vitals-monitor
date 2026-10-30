# n8n-nodes-pagespeed-core-web-vitals-monitor

n8n community node for the [**Bulk PageSpeed Insights & Core Web Vitals Monitor** Apify Actor](https://apify.com/tobbyb/pagespeed-core-web-vitals-monitor):
run Google **PageSpeed Insights (Lighthouse)** on many URLs or a whole **sitemap**, and get **real-user Core Web Vitals**
(LCP, INP, CLS from the Chrome UX Report) with pass/fail, 6-month trends, top fixes and **regression alerts** to Slack, Discord or Teams.
No Google API key needed.

![node icon](nodes/ApifyPagespeedCoreWebVitalsMonitor/logo.svg)

## Installation

**n8n (self-hosted or cloud with community nodes enabled):** Settings → Community Nodes → Install → enter `n8n-nodes-pagespeed-core-web-vitals-monitor` → Install.

Manual / Docker:

```bash
cd ~/.n8n/nodes && npm install n8n-nodes-pagespeed-core-web-vitals-monitor
# restart n8n
```

See n8n's [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

## Credentials

Create an **Apify API** credential and paste your API token from [Apify Console → Settings → API & Integrations](https://console.apify.com/settings/integrations). A free Apify account works. OAuth2 is also supported on n8n cloud.

## Use as an AI Agent tool

The node is `usableAsTool`, so you can attach it to n8n's **AI Agent** node. On self-hosted n8n set
`N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true`. When used as a tool the output is trimmed to the fields an LLM needs, to save context.

## Operation

One node, one operation: **audit pages**. Main fields:

| Field | What it does |
|---|---|
| URLs to test | One per line (Bulk edit to paste hundreds) |
| Sitemaps or site URLs | A sitemap, a sitemap index or just a domain (found via robots.txt) |
| Device | mobile, desktop or both |
| Competitor URLs | Compare mode: rank your pages against competitors |
| Include real-user field data / 6-month trend | CrUX data on/off |
| Run Lighthouse lab test | Turn off for a fast, cheap field-data-only check |
| Monitor name | Enables regression alerts between runs (pair with n8n's Schedule Trigger) |
| Alert webhook URL / Send alert when | Slack, Discord or Teams webhook |

**Output:** one n8n item per page × device: `performanceScore`, `accessibilityScore`, `seoScore`, `coreWebVitals` (PASSED/FAILED),
`fieldLcpMs`, `fieldInpMs`, `fieldCls`, trends, `topOpportunity`, `psiReportUrl`, `screenshotUrl`, and `hasRegression` /
`regressionSummary` when monitoring. Unreachable pages become typed error items (`errorCode`, `howToFix`), which are not charged.

## Example: weekly Core Web Vitals report

Schedule Trigger (weekly) → **PageSpeed & Core Web Vitals** (Sitemap: `https://example.com/sitemap.xml`, Monitor name: `weekly`) →
IF `hasRegression` → Slack / Gmail. Importable starter: [`examples/core-web-vitals-check.json`](examples/core-web-vitals-check.json).
Tested on n8n 2.43.7 (field-data-only run for web.dev: 1 item in about 6 s).

Want the results in a spreadsheet with a checklist and client report? See the [CWV Audit Kit for Google Sheets](https://tobbytools.gumroad.com/l/kzrcvu).

## Pricing

The Actor is pay per event, billed to your Apify account: **$0.006 per page audit**, $0.001 per field-data-only check,
$0.002 per regression alert, $0.01 per HTML report. Errors are free. The node itself is free and MIT-licensed.

## Development

```bash
npm install
npm run build
npm run lint
npm run dev     # Node.js >= 22
```

Generated with [apify/n8n-nodes-apify-template](https://github.com/apify/n8n-nodes-apify-template), then customised
(no prefill example URLs injected into runs, one n8n item per result, run failures surfaced, AI-tool output trimming, SVG icon).

## License

[MIT](LICENSE.md)
