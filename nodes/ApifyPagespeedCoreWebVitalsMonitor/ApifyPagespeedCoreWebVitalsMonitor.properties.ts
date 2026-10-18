import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';

// Helper functions for parameter extraction
function getFixedCollectionParam(
	context: IExecuteFunctions,
	paramName: string,
	itemIndex: number,
	optionName: string,
	transformType: 'passthrough' | 'mapValues',
): Record<string, any> {
	const param = context.getNodeParameter(paramName, itemIndex, {}) as { [key: string]: any[] };
	if (!param?.[optionName]?.length) return {};

	let result = param[optionName];
	if (transformType === 'mapValues') {
		result = result.map((item: any) => item.value);
	}
	return { [paramName]: result };
}

export function getJsonParam(context: IExecuteFunctions, paramName: string, itemIndex: number): Record<string, any> {
	try {
		const rawValue = context.getNodeParameter(paramName, itemIndex);
		if (typeof rawValue === 'string' && rawValue.trim() === '') {
			return {};
		}
		return { [paramName]: typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue };
	} catch (error) {
		throw new Error(`Invalid JSON in parameter "${paramName}": ${(error as Error).message}`);
	}
}

function getOptionalParam(context: IExecuteFunctions, paramName: string, itemIndex: number): Record<string, any> {
	const value = context.getNodeParameter(paramName, itemIndex);
	return value !== undefined && value !== null && value !== '' ? { [paramName]: value } : {};
}

function getPositiveNumberParam(context: IExecuteFunctions, paramName: string, itemIndex: number): Record<string, any> {
	const value = context.getNodeParameter(paramName, itemIndex) as number;
	return typeof value === 'number' && value > 0 ? { [paramName]: value } : {};
}

export function buildActorInput(
	context: IExecuteFunctions,
	itemIndex: number,
	defaultInput: Record<string, any>,
): Record<string, any> {
	return {
		...defaultInput,
		// URLs to test (urls)
		...getFixedCollectionParam(context, 'urls', itemIndex, 'values', 'mapValues'),
		// Sitemaps or site URLs (optional) (sitemapUrls)
		...getFixedCollectionParam(context, 'sitemapUrls', itemIndex, 'values', 'mapValues'),
		// Max pages taken from sitemaps (maxSitemapUrls)
		maxSitemapUrls: context.getNodeParameter('maxSitemapUrls', itemIndex),
		// Sitemap include pattern (regex) (sitemapIncludePattern)
		...getOptionalParam(context, 'sitemapIncludePattern', itemIndex),
		// Sitemap exclude pattern (regex) (sitemapExcludePattern)
		...getOptionalParam(context, 'sitemapExcludePattern', itemIndex),
		// Device (device)
		device: context.getNodeParameter('device', itemIndex),
		// Competitor URLs (compare mode) (competitorUrls)
		...getFixedCollectionParam(context, 'competitorUrls', itemIndex, 'values', 'mapValues'),
		// Page groups (rollups) (pageGroups)
		...getFixedCollectionParam(context, 'pageGroups', itemIndex, 'values', 'mapValues'),
		// Lighthouse categories (categories)
		categories: context.getNodeParameter('categories', itemIndex),
		// Google API key (optional) (googleApiKey)
		...getOptionalParam(context, 'googleApiKey', itemIndex),
		// Include real-user field data (CrUX) (includeFieldData)
		includeFieldData: context.getNodeParameter('includeFieldData', itemIndex),
		// Include 6-month field trend (CrUX History) (includeFieldHistory)
		includeFieldHistory: context.getNodeParameter('includeFieldHistory', itemIndex),
		// Trend length (weeks) (fieldHistoryWeeks)
		fieldHistoryWeeks: context.getNodeParameter('fieldHistoryWeeks', itemIndex),
		// Run Lighthouse lab test (labData)
		labData: context.getNodeParameter('labData', itemIndex),
		// Lighthouse runs per page (median) (labRuns)
		...getPositiveNumberParam(context, 'labRuns', itemIndex),
		// Monitor name (enables regression alerts) (monitorName)
		...getOptionalParam(context, 'monitorName', itemIndex),
		// Also alert on lab (Lighthouse) changes (labAlerts)
		labAlerts: context.getNodeParameter('labAlerts', itemIndex),
		// Score drop threshold (points) (scoreDropThreshold)
		scoreDropThreshold: context.getNodeParameter('scoreDropThreshold', itemIndex),
		// Lab metric threshold (%) (labMetricThresholdPct)
		labMetricThresholdPct: context.getNodeParameter('labMetricThresholdPct', itemIndex),
		// Lab alerts need a rating downgrade (labRequireRatingChange)
		labRequireRatingChange: context.getNodeParameter('labRequireRatingChange', itemIndex),
		// Confirm lab regressions on 2 runs in a row (confirmLabRegressions)
		confirmLabRegressions: context.getNodeParameter('confirmLabRegressions', itemIndex),
		// Field metric threshold (%) (fieldMetricThresholdPct)
		fieldMetricThresholdPct: context.getNodeParameter('fieldMetricThresholdPct', itemIndex),
		// Alert webhook URL (Slack, Discord, Teams) (alertWebhookUrl)
		...getOptionalParam(context, 'alertWebhookUrl', itemIndex),
		// Send alert when (alertOn)
		alertOn: context.getNodeParameter('alertOn', itemIndex),
		// Save HTML summary report (generateHtmlReport)
		generateHtmlReport: context.getNodeParameter('generateHtmlReport', itemIndex),
		// Save page screenshots (saveScreenshots)
		saveScreenshots: context.getNodeParameter('saveScreenshots', itemIndex),
		// Top opportunities per page (maxOpportunities)
		maxOpportunities: context.getNodeParameter('maxOpportunities', itemIndex),
		// Failed audits per category (maxFailedAudits)
		maxFailedAudits: context.getNodeParameter('maxFailedAudits', itemIndex),
		// Save full PageSpeed JSON (saveFullResults)
		saveFullResults: context.getNodeParameter('saveFullResults', itemIndex),
		// Pre-check URLs (skip non-HTML & 404) (preflightCheck)
		preflightCheck: context.getNodeParameter('preflightCheck', itemIndex),
		// Language of audit texts (locale)
		...getOptionalParam(context, 'locale', itemIndex),
		// Max URLs per run (maxUrls)
		maxUrls: context.getNodeParameter('maxUrls', itemIndex),
		// Parallel audits (maxConcurrency)
		maxConcurrency: context.getNodeParameter('maxConcurrency', itemIndex),
		// Max PageSpeed requests per minute (maxRequestsPerMinute)
		maxRequestsPerMinute: context.getNodeParameter('maxRequestsPerMinute', itemIndex),
		// Retries per URL (maxRetries)
		maxRetries: context.getNodeParameter('maxRetries', itemIndex),
		// Timeout per audit (seconds) (requestTimeoutSecs)
		requestTimeoutSecs: context.getNodeParameter('requestTimeoutSecs', itemIndex),
	};
}

const authenticationProperties: INodeProperties[] = [
	{
		displayName: 'Authentication',
		name: 'authentication',
		type: 'options',
		options: [
			{
				name: 'API Key',
				value: 'apifyApi',
			},
			{
				name: 'OAuth2',
				value: 'apifyOAuth2Api',
			},
		],
		default: 'apifyApi',
		description: 'Choose which authentication method to use',
	},
];

export const actorProperties: INodeProperties[] = [
  {
    "displayName": "URLs to test",
    "name": "urls",
    "description": "Pages to test, one URL per line (use Bulk edit to paste hundreds). Bare domains like example.com get https:// added. Duplicates are removed. Invalid entries become error items and never stop the run.",
    "required": false,
    "default": {},
    "type": "fixedCollection",
    "typeOptions": {
      "multipleValues": true
    },
    "options": [
      {
        "name": "values",
        "displayName": "Values",
        "values": [
          {
            "displayName": "Value",
            "name": "value",
            "type": "string",
            "default": ""
          }
        ]
      }
    ]
  },
  {
    "displayName": "Sitemaps or site URLs (optional)",
    "name": "sitemapUrls",
    "description": "Sitemap URLs to expand into pages (sitemap indexes, .xml.gz and plain-text sitemaps are supported, and huge sitemaps are streamed). You can also enter just a site, e.g. https://www.example.com: the Actor finds its sitemap through robots.txt. A broken sitemap URL also falls back to robots.txt.",
    "required": false,
    "default": {},
    "type": "fixedCollection",
    "typeOptions": {
      "multipleValues": true
    },
    "options": [
      {
        "name": "values",
        "displayName": "Values",
        "values": [
          {
            "displayName": "Value",
            "name": "value",
            "type": "string",
            "default": ""
          }
        ]
      }
    ]
  },
  {
    "displayName": "Max pages taken from sitemaps",
    "name": "maxSitemapUrls",
    "description": "Upper limit of page URLs taken from all sitemaps together (keeps costs predictable).",
    "required": false,
    "default": 50,
    "type": "number",
    "typeOptions": {
      "minValue": 1,
      "maxValue": 50000
    }
  },
  {
    "displayName": "Sitemap include pattern (regex)",
    "name": "sitemapIncludePattern",
    "description": "Only take sitemap URLs matching this regular expression, e.g. /blog/",
    "required": false,
    "default": "",
    "type": "string"
  },
  {
    "displayName": "Sitemap exclude pattern (regex)",
    "name": "sitemapExcludePattern",
    "description": "Skip sitemap URLs matching this regular expression, e.g. \\.pdf$|/tag/",
    "required": false,
    "default": "",
    "type": "string"
  },
  {
    "displayName": "Device",
    "name": "device",
    "description": "Run the audit for mobile, desktop, or both. 'Both' produces two results (and two charges) per URL.",
    "required": false,
    "default": "mobile",
    "type": "options",
    "options": [
      {
        "name": "Mobile",
        "value": "mobile"
      },
      {
        "name": "Desktop",
        "value": "desktop"
      },
      {
        "name": "Mobile + Desktop",
        "value": "both"
      }
    ]
  },
  {
    "displayName": "Competitor URLs (compare mode)",
    "name": "competitorUrls",
    "description": "Optional. Competitor pages to test the same way, e.g. their homepage and key landing pages. Results get role = competitor, and the report and SUMMARY rank every site side by side (performance, Core Web Vitals pass rate, real-user LCP/INP). Competitors are charged like your pages and are not monitored for regressions.",
    "required": false,
    "default": {},
    "type": "fixedCollection",
    "typeOptions": {
      "multipleValues": true
    },
    "options": [
      {
        "name": "values",
        "displayName": "Values",
        "values": [
          {
            "displayName": "Value",
            "name": "value",
            "type": "string",
            "default": ""
          }
        ]
      }
    ]
  },
  {
    "displayName": "Page groups (rollups)",
    "name": "pageGroups",
    "description": "Optional. Group pages by template to see which part of the site is slow, one per line as Name = regex, e.g. 'Blog = /blog/' or 'Products = ^/(p|product)/'. The first match wins. Without groups, pages are grouped by the first folder of the path. Rollups (pass rate, medians, worst page) are in SUMMARY and the report.",
    "required": false,
    "default": {},
    "type": "fixedCollection",
    "typeOptions": {
      "multipleValues": true
    },
    "options": [
      {
        "name": "values",
        "displayName": "Values",
        "values": [
          {
            "displayName": "Value",
            "name": "value",
            "type": "string",
            "default": ""
          }
        ]
      }
    ]
  },
  {
    "displayName": "Lighthouse categories",
    "name": "categories",
    "description": "Lighthouse categories to score. All four cost the same.",
    "required": false,
    "default": [
      "performance",
      "accessibility",
      "best-practices",
      "seo"
    ],
    "type": "multiOptions",
    "options": [
      {
        "name": "Performance",
        "value": "performance"
      },
      {
        "name": "Accessibility",
        "value": "accessibility"
      },
      {
        "name": "Best practices",
        "value": "best-practices"
      },
      {
        "name": "SEO",
        "value": "seo"
      }
    ]
  },
  {
    "displayName": "Google API key (optional)",
    "name": "googleApiKey",
    "description": "Not needed: without a key the Actor uses its own shared key, limited to 200 page audits per run. Add your own free key (PageSpeed Insights API + Chrome UX Report API enabled) for big jobs, frequent schedules or your own ~25,000 audits/day. It is stored encrypted and never appears in the output. See README \u2192 'Use your own Google API key'.",
    "required": false,
    "default": "",
    "type": "string",
    "typeOptions": {
      "password": true
    }
  },
  {
    "displayName": "Include real-user field data (CrUX)",
    "name": "includeFieldData",
    "description": "Adds Chrome UX Report p75 LCP, INP, CLS, FCP and TTFB for the page and its origin, plus the Core Web Vitals pass/fail assessment.",
    "required": false,
    "default": true,
    "type": "boolean"
  },
  {
    "displayName": "Include 6-month field trend (CrUX History)",
    "name": "includeFieldHistory",
    "description": "Adds weekly real-user p75 LCP, INP, CLS, FCP and TTFB for up to 40 weeks from the Chrome UX Report History API, with a trend (improving / stable / worsening), the current pass/fail streak and when it started. Free, about 1 extra second per page.",
    "required": false,
    "default": true,
    "type": "boolean"
  },
  {
    "displayName": "Trend length (weeks)",
    "name": "fieldHistoryWeeks",
    "description": "How many weekly data points to fetch (each one is a 28-day window). 25 \u2248 6 months, 40 = maximum.",
    "required": false,
    "default": 25,
    "type": "number",
    "typeOptions": {
      "minValue": 1,
      "maxValue": 40
    }
  },
  {
    "displayName": "Run Lighthouse lab test",
    "name": "labData",
    "description": "Turn off for the fast, low-cost bulk Core Web Vitals checker: real-user Chrome UX Report data only (no Lighthouse), about 1 second per URL, ideal for checking thousands of pages or competitor domains. Pages without CrUX data are not charged.",
    "required": false,
    "default": true,
    "type": "boolean"
  },
  {
    "displayName": "Lighthouse runs per page (median)",
    "name": "labRuns",
    "description": "Lab scores vary from run to run (we measured up to 18 points on unchanged pages). Run Lighthouse 2\u20135 times per page and report the MEDIAN of every score and metric plus the min\u2013max spread (labRuns.spread). Default: 1, or 3 when monitoring with lab alerts turned on. Each extra run is charged as 'extra lab run'.",
    "required": false,
    "default": 0,
    "type": "number",
    "typeOptions": {
      "minValue": 1,
      "maxValue": 5
    }
  },
  {
    "displayName": "Monitor name (enables regression alerts)",
    "name": "monitorName",
    "description": "Give this URL set a name, e.g. 'acme-shop-weekly', and schedule the Actor. Each run is compared with earlier runs of the same monitor (kept in a named key-value store). By default you are alerted when real-user Core Web Vitals get worse; lab changes are listed as info. Don't run two schedules with the same name at the same time: the Actor detects overlap, warns and merges instead of overwriting.",
    "required": false,
    "default": "",
    "type": "string"
  },
  {
    "displayName": "Also alert on lab (Lighthouse) changes",
    "name": "labAlerts",
    "description": "Off by default: alerts and the 'regression' charge come only from real-user Chrome UX Report data (field p75 LCP/INP/CLS/FCP/TTFB getting worse, a rating downgrade, or Core Web Vitals PASSED \u2192 FAILED). Lab score changes still appear in every row as info (labChanges, labChangeSummary). Turn this on to also alert on lab drops; then 'Lighthouse runs per page' defaults to 3 (median) and a lab drop must repeat on 2 runs in a row. Why off: Google's lab tests are noisy. In our live tests on 30 unchanged sites, lab-based alerting still raised 2\u20137 false alerts per run.",
    "required": false,
    "default": false,
    "type": "boolean"
  },
  {
    "displayName": "Score drop threshold (points)",
    "name": "scoreDropThreshold",
    "description": "Only used when 'Also alert on lab changes' is on (it always shapes the info-only labChanges list). Flag a regression when a Lighthouse score (0\u2013100) drops by at least this many points. In live tests, PageSpeed lab scores for the same page varied by a median of 2 and up to 18 points between runs 10 minutes apart.",
    "required": false,
    "default": 15,
    "type": "number",
    "typeOptions": {
      "minValue": 1,
      "maxValue": 100
    }
  },
  {
    "displayName": "Lab metric threshold (%)",
    "name": "labMetricThresholdPct",
    "description": "Only used when 'Also alert on lab changes' is on (it always shapes the info-only labChanges list). Flag a regression when a lab metric (LCP, FCP, TBT, CLS, Speed Index) gets worse by at least this percentage and by a minimum absolute amount (LCP/FCP +500 ms, TBT +150 ms, CLS +0.05, Speed Index +1 s). Lab TTFB is not alerted on: Google measures it from its own datacenter.",
    "required": false,
    "default": 25,
    "type": "number",
    "typeOptions": {
      "minValue": 1,
      "maxValue": 1000
    }
  },
  {
    "displayName": "Lab alerts need a rating downgrade",
    "name": "labRequireRatingChange",
    "description": "Only used when 'Also alert on lab changes' is on (it always shapes the info-only labChanges list). When on (recommended), a lab metric only counts as a regression if its rating also gets worse (good \u2192 needs improvement \u2192 poor). PageSpeed lab data is noisy. In live tests, turning this off flagged 14 of 46 unchanged pages between two runs; with it on, 4 of 46.",
    "required": false,
    "default": true,
    "type": "boolean"
  },
  {
    "displayName": "Confirm lab regressions on 2 runs in a row",
    "name": "confirmLabRegressions",
    "description": "Only used when 'Also alert on lab changes' is on (it always shapes the info-only labChanges list). Recommended. Lab results are compared with the median of your earlier runs. A lab-only drop must show up in two runs in a row before it is alerted and charged; a one-off dip is listed as 'suspected' instead. Field (real-user) data and Core Web Vitals pass\u2192fail changes always alert at once. In 3 live test runs of 30 unchanged sites this cut false alerts from 19 to 2.",
    "required": false,
    "default": true,
    "type": "boolean"
  },
  {
    "displayName": "Field metric threshold (%)",
    "name": "fieldMetricThresholdPct",
    "description": "Flag a regression when a real-user p75 metric gets worse by at least this percentage. A Core Web Vitals pass\u2192fail or a good\u2192poor rating change is always flagged.",
    "required": false,
    "default": 10,
    "type": "number",
    "typeOptions": {
      "minValue": 1,
      "maxValue": 1000
    }
  },
  {
    "displayName": "Alert webhook URL (Slack, Discord, Teams)",
    "name": "alertWebhookUrl",
    "description": "Get a message when pages get slower. Paste a Slack Incoming Webhook (hooks.slack.com/\u2026), a Discord webhook (discord.com/api/webhooks/\u2026), a Microsoft Teams Workflows webhook, or any https endpoint (it receives JSON). Stored encrypted.",
    "required": false,
    "default": "",
    "type": "string",
    "typeOptions": {
      "password": true
    }
  },
  {
    "displayName": "Send alert when",
    "name": "alertOn",
    "description": "When the webhook is called. Without a monitor name there are no regressions, so use one of the other options.",
    "required": false,
    "default": "regressions",
    "type": "options",
    "options": [
      {
        "name": "A page got slower (regressions)",
        "value": "regressions"
      },
      {
        "name": "Regressions or any page failing Core Web Vitals",
        "value": "regressions-or-cwv-failures"
      },
      {
        "name": "After every run (summary)",
        "value": "every-run"
      }
    ]
  },
  {
    "displayName": "Save HTML summary report",
    "name": "generateHtmlReport",
    "description": "Saves a shareable HTML report (key REPORT in the run's key-value store). Charged once per run.",
    "required": false,
    "default": true,
    "type": "boolean"
  },
  {
    "displayName": "Save page screenshots",
    "name": "saveScreenshots",
    "description": "Saves the above-the-fold screenshot Lighthouse took (about 20 KB JPEG per page) to the run's key-value store. The output gets a `screenshotUrl` and the HTML report shows thumbnails. Free.",
    "required": false,
    "default": true,
    "type": "boolean"
  },
  {
    "displayName": "Top opportunities per page",
    "name": "maxOpportunities",
    "description": "How many improvement opportunities (with estimated savings) to include per result.",
    "required": false,
    "default": 10,
    "type": "number",
    "typeOptions": {
      "minValue": 0,
      "maxValue": 20
    }
  },
  {
    "displayName": "Failed audits per category",
    "name": "maxFailedAudits",
    "description": "How many failing accessibility / SEO / best-practice audits to list per result.",
    "required": false,
    "default": 10,
    "type": "number",
    "typeOptions": {
      "minValue": 0,
      "maxValue": 50
    }
  },
  {
    "displayName": "Save full PageSpeed JSON",
    "name": "saveFullResults",
    "description": "Also store the complete raw PageSpeed Insights response for each result in the key-value store (large).",
    "required": false,
    "default": false,
    "type": "boolean"
  },
  {
    "displayName": "Pre-check URLs (skip non-HTML & 404)",
    "name": "preflightCheck",
    "description": "Before calling PageSpeed, quickly fetch the URL headers: records the redirect chain and status, and skips (without charging) URLs that are PDFs/images/JSON, return 404/410, or have a non-existent domain.",
    "required": false,
    "default": true,
    "type": "boolean"
  },
  {
    "displayName": "Language of audit texts",
    "name": "locale",
    "description": "Locale for Lighthouse audit titles, e.g. en, de, fr, es, pt-BR.",
    "required": false,
    "default": "en",
    "type": "string"
  },
  {
    "displayName": "Max URLs per run",
    "name": "maxUrls",
    "description": "Safety cap on unique URLs per run (before multiplying by devices).",
    "required": false,
    "default": 500,
    "type": "number",
    "typeOptions": {
      "minValue": 1,
      "maxValue": 100000
    }
  },
  {
    "displayName": "Parallel audits",
    "name": "maxConcurrency",
    "description": "How many PageSpeed audits run at the same time. Without an API key this is forced to 1.",
    "required": false,
    "default": 5,
    "type": "number",
    "typeOptions": {
      "minValue": 1,
      "maxValue": 25
    }
  },
  {
    "displayName": "Max PageSpeed requests per minute",
    "name": "maxRequestsPerMinute",
    "description": "Client-side rate limit to stay inside Google's per-minute quota. 429 responses are retried with exponential backoff anyway.",
    "required": false,
    "default": 60,
    "type": "number",
    "typeOptions": {
      "minValue": 1,
      "maxValue": 400
    }
  },
  {
    "displayName": "Retries per URL",
    "name": "maxRetries",
    "description": "Retries for transient failures (rate limits, timeouts, Google 5xx, flaky page loads). Permanent errors such as 404 or non-HTML are not retried.",
    "required": false,
    "default": 3,
    "type": "number",
    "typeOptions": {
      "minValue": 0,
      "maxValue": 6
    }
  },
  {
    "displayName": "Timeout per audit (seconds)",
    "name": "requestTimeoutSecs",
    "description": "How long to wait for one PageSpeed Insights response. Heavy pages can take PSI 60-150 s; a timed-out URL is retried once.",
    "required": false,
    "default": 180,
    "type": "number",
    "typeOptions": {
      "minValue": 30,
      "maxValue": 300
    }
  }
];

export const properties: INodeProperties[] = [...actorProperties, ...authenticationProperties];