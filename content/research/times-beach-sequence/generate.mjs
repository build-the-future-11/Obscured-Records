import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const dataUrl = new URL("./timeline.json", import.meta.url);
const outputUrl = new URL("./timeline.svg", import.meta.url);

const escapeXml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const wrap = (text, max = 42) => {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
};

const textLines = (lines, x, y, className, gap) => lines
  .map((line, index) => `<text x="${x}" y="${y + index * gap}" class="${className}">${escapeXml(line)}</text>`)
  .join("\n");

export function render(data) {
  const phaseById = new Map(data.phases.map((phase) => [phase.id, phase]));
  const cards = data.events.map((event, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 72 + column * 560;
    const y = 230 + row * 175;
    const phase = phaseById.get(event.phase);
    const title = wrap(event.title, 38).slice(0, 2);
    const detail = wrap(event.detail, 62).slice(0, 3);
    return [
      `<g aria-label="${escapeXml(`${event.date}: ${event.title}`)}">`,
      `<rect x="${x}" y="${y}" width="500" height="140" rx="18" class="card"/>`,
      `<rect x="${x}" y="${y}" width="10" height="140" rx="5" fill="${escapeXml(phase.color)}"/>`,
      `<text x="${x + 28}" y="${y + 30}" class="date">${escapeXml(event.date)}</text>`,
      textLines(title, x + 28, y + 55, "event-title", 20),
      textLines(detail, x + 28, y + 98, "detail", 17),
      "</g>",
    ].join("\n");
  }).join("\n");

  const legend = data.phases.map((phase, index) => {
    const x = 72 + index * 360;
    return `<g><circle cx="${x}" cy="172" r="8" fill="${escapeXml(phase.color)}"/><text x="${x + 16}" y="178" class="legend">${escapeXml(phase.label)}</text></g>`;
  }).join("\n");

  const caption = wrap(data.caption, 132);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1020" viewBox="0 0 1200 1020" role="img" aria-labelledby="title desc">
<title id="title">${escapeXml(data.title)}</title>
<desc id="desc">${escapeXml(data.caption)}</desc>
<style>
  .background{fill:#f7f4ed}.card{fill:#fff;stroke:#d7d0c4;stroke-width:1.5}.eyebrow{font:600 15px system-ui,sans-serif;letter-spacing:1.4px;fill:#725d43}.heading{font:700 34px Georgia,serif;fill:#211c16}.subtitle{font:18px system-ui,sans-serif;fill:#5a5147}.legend{font:600 14px system-ui,sans-serif;fill:#453c33}.date{font:700 15px system-ui,sans-serif;fill:#725d43}.event-title{font:700 17px system-ui,sans-serif;fill:#211c16}.detail{font:14px system-ui,sans-serif;fill:#554b42}.caption{font:13px system-ui,sans-serif;fill:#4f463e}.rule{stroke:#c8bba8;stroke-width:1}
</style>
<rect width="1200" height="1020" class="background"/>
<text x="72" y="58" class="eyebrow">SOURCE-LOCATED EDITORIAL DIAGRAM · RECORD 0406</text>
<text x="72" y="104" class="heading">${escapeXml(data.title)}</text>
<text x="72" y="136" class="subtitle">${escapeXml(data.subtitle)}</text>
${legend}
<line x1="72" y1="200" x2="1128" y2="200" class="rule"/>
${cards}
<line x1="72" y1="938" x2="1128" y2="938" class="rule"/>
${textLines(caption, 72, 964, "caption", 17)}
</svg>
`;
}

const data = JSON.parse(await readFile(dataUrl, "utf8"));
const svg = render(data);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await writeFile(outputUrl, svg, "utf8");
}
