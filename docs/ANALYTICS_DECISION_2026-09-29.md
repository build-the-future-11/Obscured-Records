# Analytics Decision Record — 29 September 2026

## Decision

Use **Cloudflare Web Analytics** as the preferred first baseline analytics layer **after operator acceptance and public-audience activation**.

Do not enable analytics merely to generate numbers while the site remains owner-only. That would measure the owner/review workflow rather than a public audience and could create a misleading baseline.

## Why this option

Current Cloudflare documentation states that Web Analytics:
- is available on all plans / offered free;
- does not use client-side state such as cookies or localStorage for analytics;
- does not fingerprint individuals for analytics display;
- does not collect or use visitors' personal data;
- can collect page views, referrers and real-user performance metrics through its beacon.

Official references:
- https://developers.cloudflare.com/web-analytics/about/
- https://www.cloudflare.com/web-analytics/
- https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/

The current Obscured Records deployment already uses a Cloudflare Workers/D1 path, so this avoids adding a second analytics vendor solely for baseline publication metrics.

## Privacy boundary

Before activation:
- [ ] operator accepts the provider;
- [ ] privacy page is reviewed for accurate analytics disclosure;
- [ ] access to the dashboard is assigned;
- [ ] retention/export behavior is documented from the live account;
- [ ] Content Security Policy implications are checked if a beacon is injected;
- [ ] only the public audience is measured unless a separate reason for private-preview telemetry is documented.

Never send to analytics:
- newsletter email addresses;
- submission/source-lead content;
- private intake IDs;
- note/highlight text;
- draft identifiers that reveal unpublished material;
- any confidential-source material.

## What the baseline can measure

Use Cloudflare Web Analytics for:
- page views;
- top public pages;
- referrers;
- country/device/browser aggregates as available;
- web-performance/RUM metrics;
- campaign traffic via ordinary URL/UTM analysis where supported by the reporting workflow.

## Important limitation: returning readers

The Month-1 plan originally named returning readers as a key metric. A privacy-first tool that deliberately avoids persistent visitor identification cannot provide a strong individual-level 30-day returning-reader measure without changing that privacy posture.

Therefore:
- do **not** invent a “returning reader” number from page views;
- call it **not measured** in the baseline;
- use aggregate proxies such as growth in direct visits, repeat newsletter engagement once a real mail provider exists, and recurring referral/search behavior;
- only add a stronger repeat-visitor method after a separate privacy review.

This is an intentional limitation, not a reason to add fingerprinting.

## Plausible considered, not selected for baseline

Plausible is also privacy-focused and its current materials describe cookieless, non-persistent analytics. It is a reasonable future option if Obscured Records needs event analytics or a different reporting workflow. For the baseline, adding another vendor is unnecessary while Cloudflare already fits the deployment stack.

References:
- https://plausible.io/privacy
- https://plausible.io/docs/compliance

## Activation sequence

1. Public-launch sign-off closes.
2. Operator enables the Cloudflare Web Analytics property.
3. Exact provider token/snippet is recorded in deployment configuration, not hard-coded into editorial content.
4. Deploy.
5. Verify that public page views/referrers/performance appear.
6. Verify no private routes/draft content are being reported.
7. Start the current-analytics baseline date on the day verification passes.
8. Keep all historical/self-reported audience numbers outside the current-period dashboard.

## Status

**Selected, not enabled.** No current traffic measurement is claimed by this decision record.
