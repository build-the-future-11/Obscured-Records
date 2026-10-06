# Johnstown source and graphic packet

This is original AI-assisted archival analysis, not original reporting, a hydraulic simulation, or an approved reader-site article. No interviews or human editorial review are claimed. The National Park Service pages are official interpretive histories that incorporate historical accounts; this pass did not inspect their underlying original manuscripts. A separate 73-page engineering history was inspected only in selected passages and was not used as a cited authority in the article.

## Sources actually inspected on 30 September 2026

1. https://www.nps.gov/jofl/learn/historyculture/the-south-fork-dam.htm — sections History, Timeline and Image comparison. Supports the purpose/ownership and alteration paragraph. Page updated March 10, 2026.
2. https://www.nps.gov/jofl/learn/historyculture/johnstown-flood-timeline.htm — May 31 entries and the approximate-time notice. Supports the three warning labels, communication disruption and arrival label. Page updated January 19, 2026.
3. https://www.nps.gov/jofl/faqs.htm — breach-time and warning questions. Supports preservation of differing breach times. Its estimate of a larger death toll is not adopted as a newly verified count.
4. https://www.nps.gov/places/in-the-lakebed.htm — overtopping/erosion account and official-count caveat. Page updated February 22, 2024.

The body uses numbered links and separates historical statements from editorial interpretation. No direct quotation is used. Derived historical summary remains below 200 words per cited page across the draft, figure labels and this short ledger; original analysis is not presented as a source finding.

## Graphic

`timeline.csv` contains five manually transcribed, source-linked events. `reported_time_start`/`reported_time_end` are historical clock labels on 1889-05-31. A repeated endpoint means a reported point time, not exact measurement. The breach range preserves two commonly reported times, not a probability distribution, confidence interval or measured duration of breach development. No timezone conversion is applied.

Run from repository root:

    python content/research/johnstown-warning-and-escape/generate_timeline.py

Requires Python 3 and Matplotlib 3.10.8 (the version executed in this pass). Outputs `timeline.svg`, `timeline.png` and `figure_receipt.json`. The script uses a fixed SVG hash salt and omits generated-date metadata. It does not fetch data or modify the article. Both formats were generated, and the PNG was visually inspected for clipping, legible text and faithful encoding. No source image has been copied.

Caption: Five reported events in the May 31, 1889 Johnstown flood record. Times are approximate; the breach range records differing accounts. Warning times identify outgoing messages, not household receipt or available evacuation time. Sources: NPS timeline and FAQ.

Alt text: A horizontal clock-time chart lists warning messages at 13:00, 13:52 and 14:45, dam failure accounts between 15:10 and 15:15, and arrival in Johnstown at 16:07. An explicit note says the times are approximate.

## Editorial gate

The new draft remains `draft`, with an unassigned AI-assisted author field, empty completed-check array and null approval fields. A consenting human editor/author must review historical claims, general engineering explanation, source uncertainty and graphic before publication. The website's public-launch HOLD is unchanged. The files under content/research are not added to application imports or public assets.
