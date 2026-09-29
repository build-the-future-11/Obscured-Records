# Metrics and Distribution Specification

## Purpose

Provide one measurement and distribution contract for Obscured Records. The system must help answer whether readers are finding, reading, returning to and subscribing to the publication without manufacturing certainty or collecting unnecessary data.

## Measurement principles

1. Current analytics are the only basis for current traffic claims.
2. Historical/self-reported numbers may be retained as historical context but must not be mixed into current dashboards.
3. Collection should be proportionate to the decision being made.
4. Editorial quality metrics are separate from growth metrics.
5. A target is not an achieved result.
6. Missing instrumentation must appear as “not measured,” not zero and not inferred.

## Core KPI definitions

### Returning reader
A browser/session identity that visits on at least two distinct days inside a defined 30-day window. If the selected analytics product cannot measure this without disproportionate tracking, use a less invasive repeat-session proxy and document the limitation.

### Engaged reading
Prefer a bounded combination of:
- article active time;
- scroll depth/completion proxy;
- navigation to another record;
- save/highlight use where available locally;
- newsletter conversion.

Do not equate an open tab with engaged time.

### Newsletter conversion
Distinct completed capture events divided by eligible article/landing sessions. Until confirmed opt-in exists, call the numerator **pending newsletter captures**, not subscribers.

### Distribution success
For each story:
- direct visits;
- search visits;
- referral visits;
- newsletter visits once sending exists;
- partner/syndication visits;
- repeat visits attributable to the story where measurable.

## Recommended event vocabulary

Only implement events that the accepted analytics approach can collect consistently and appropriately.

- page_view
- article_view
- article_engaged_30s
- article_engaged_120s
- article_scroll_50
- article_scroll_90
- internal_story_click
- source_link_open
- newsletter_capture_success
- newsletter_capture_failure
- submission_open
- submission_success
- search_open
- search_result_click
- save_story
- share_click

Avoid recording article note/highlight text, private submissions, email addresses or source-lead text in analytics payloads.

## Required dimensions

Where available and privacy-appropriate:
- route/article slug;
- section;
- referrer class;
- UTM source;
- UTM medium;
- UTM campaign;
- device class;
- date.

Do not attach private user identifiers merely to improve dashboards.

## UTM convention

Use:

- utm_source = partner/platform/newsletter name
- utm_medium = referral | social | email | syndication | partner
- utm_campaign = story slug or campaign identifier
- utm_content = optional placement variant

Example:

`?utm_source=example-newsletter&utm_medium=partner&utm_campaign=mars-climate-orbiter-interface`

## Story scorecard

At 7 and 30 days record:

| Metric | Value | Measured? | Notes |
|---|---:|---|---|
| Page/article visits |  |  |  |
| Engaged 30s rate |  |  |  |
| Engaged 120s rate |  |  |  |
| 90% scroll proxy |  |  |  |
| Internal story CTR |  |  |  |
| Search visits |  |  |  |
| Referral visits |  |  |  |
| Direct visits |  |  |  |
| Pending newsletter captures |  |  |  |
| Backlinks/referring domains |  |  |  |
| Corrections/reader notes |  |  |  |
| Update decision |  |  |  |

The review decision should be one of: leave, update, expand, repackage, link more strongly, or retire from promotion.

## Weekly publication scorecard

### Audience
- total measured visits;
- returning-reader proxy;
- direct share;
- search share;
- referral share;
- median engaged reading time.

### Editorial
- stories in draft;
- stories in review;
- stories approved;
- stories published;
- stories held;
- corrections;
- median review cycle.

### Distribution
- launch packages completed;
- active partner relationships;
- new referring domains;
- top referral sources;
- cluster pages gaining search impressions.

### Newsletter
- pending captures;
- confirmed subscribers only if confirmation exists;
- delivery/open/click metrics only if an authenticated send system exists.

### Operations
- intake items awaiting triage;
- uptime incidents;
- unresolved severe accessibility defects;
- unresolved media rights items;
- rollback/backup test status.

## Distribution checklist per approved article

Before release:
- [ ] canonical URL correct;
- [ ] title and dek reviewed;
- [ ] share image rights confirmed;
- [ ] social/partner excerpt prepared;
- [ ] newsletter blurb prepared;
- [ ] relevant internal links added;
- [ ] target communities/partners chosen;
- [ ] UTMs assigned;
- [ ] seven-day review scheduled;
- [ ] thirty-day review scheduled.

After release:
- [ ] verify route/feed/sitemap presence;
- [ ] check referral/search pickup;
- [ ] answer correction or source feedback;
- [ ] update internal links from related archive stories;
- [ ] record 7-day scorecard;
- [ ] record 30-day scorecard.

## Topic-cluster template

For each cluster record:

- cluster name;
- reader question;
- pillar/flagship URL;
- supporting records;
- missing reporting;
- key primary sources;
- target search queries;
- internal-link map;
- update cadence;
- distribution partners;
- performance review date.

## Privacy gate before implementation

Before enabling any external analytics product, document:

- provider;
- data collected;
- cookies/local storage used;
- retention period;
- IP handling;
- cross-site or advertising use;
- opt-out/consent implications;
- privacy-policy changes;
- who can access the dashboard;
- deletion/export capability.

If those questions cannot be answered, analytics remains unenabled.
