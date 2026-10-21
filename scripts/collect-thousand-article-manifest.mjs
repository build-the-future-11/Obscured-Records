import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { readDraft } from "./editorial-content.mjs";

const { values } = parseArgs({ options: {
  target: { type: "string", default: "1000" },
  output: { type: "string", default: "content/article-expansion-2026-10-15.json" },
  "include-subcategories": { type: "boolean", default: false },
} });
const TARGET = Number(values.target);
const OUTPUT = path.resolve(values.output);
if (!Number.isSafeInteger(TARGET) || TARGET < 1 || TARGET > 5000) throw new Error("Target must be between 1 and 5,000");
if (fs.existsSync(OUTPUT)) throw new Error(`Preserve the existing source snapshot: ${OUTPUT}`);
const RETRIEVED_AT = new Date().toISOString();
const USER_AGENT = "ObscuredRecordsEditorialDiscovery/1.0 (https://obscured-records.ryangomez-hs.chatgpt.site; owner-private research corpus)";
const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php";
const WIKIDATA_API = "https://www.wikidata.org/w/api.php";
const CACHE_DIRECTORY = `/tmp/obscured-records-source-cache-${path.basename(OUTPUT, ".json")}`;
fs.mkdirSync(CACHE_DIRECTORY, { recursive: true });

const profiles = {
  aviation: {
    label: "aviation-safety record",
    mechanisms: [
      "Reconstruct the operational sequence without allowing a familiar accident label to stand in for weather, maintenance, dispatch, cockpit, traffic-control and recorder evidence.",
      "Separate the initiating condition from the crew's information, the aircraft's response, the emergency options and the findings later adopted by investigators.",
      "Build the timeline from primary operational records, then test later technical explanations against what participants could actually know at each decision point.",
      "Trace how design, maintenance, procedures and real-time judgment interacted instead of assigning the whole event to the final visible error.",
    ],
    systems: [
      "Map the operator, manufacturer, maintainers, airport, air-navigation services, investigators and regulator as distinct institutions with different evidence and duties.",
      "Test whether certification assumptions, operating economics and reporting channels made weak signals visible early enough to change the outcome.",
      "Identify which safety barriers were independent and which quietly depended on the same sensor, procedure, contractor or organizational belief.",
      "Follow each recommendation into implementation rather than treating an investigation report as proof that the risk was removed.",
    ],
    memories: [
      "Compare the event's popular shorthand with the names, local reporting and technical disagreements preserved in the record.",
      "Ask whether a dramatic final moment displaced the longer history of maintenance, oversight and earlier warnings.",
      "Examine how casualty totals and cockpit narratives may have eclipsed passengers, responders and affected communities.",
      "Track how later retellings converted disputed findings into certainty or reduced a system failure to one person's conduct.",
    ],
  },
  maritime: {
    label: "maritime-loss record",
    mechanisms: [
      "Reconstruct route, weather, loading, stability, machinery, communications and rescue timing from records created by different maritime authorities.",
      "Distinguish the first loss of safety margin from flooding, fire, collision, abandonment and the later search or salvage record.",
      "Test competing accounts against manifests, logs, survey evidence, charts, radio traffic and contemporaneous port records.",
      "Follow the vessel's condition and decisions before departure so the final emergency is not mistaken for the whole causal chain.",
    ],
    systems: [
      "Map owner, flag state, class society, charterer, port, coast guard, insurer and investigators without collapsing their duties into a single maritime authority.",
      "Ask how commercial schedules, inspection regimes and fragmented jurisdiction shaped the margin available when conditions deteriorated.",
      "Identify whether lifesaving, communications and evacuation arrangements were independently robust or shared one hidden vulnerability.",
      "Trace recommendations, wreck removal, compensation and later enforcement as separate outcomes rather than one completed reform story.",
    ],
    memories: [
      "Recover the people aboard and ashore from a record often compressed into a ship name, a photograph and a loss total.",
      "Check whether mystery language survives because evidence was genuinely lost or because accessible retellings omit technical and legal records.",
      "Compare national and local memory where the same voyage may occupy very different places in public history.",
      "Examine how famous wrecks become analogies that flatten the distinct weather, trade and regulatory setting of this subject.",
    ],
  },
  rail: {
    label: "rail-safety record",
    mechanisms: [
      "Build a movement timeline from timetables, signals, train orders, track evidence, rolling-stock condition and communications.",
      "Separate the immediate collision or derailment from the earlier dispatch, maintenance, loading and rule-enforcement decisions.",
      "Test human-performance explanations against the indications, workload and operating information available at the time.",
      "Reconcile official findings with infrastructure records and local testimony before choosing a single account of the failure.",
    ],
    systems: [
      "Map infrastructure owner, operator, maintainer, rolling-stock owner, dispatch, regulator and emergency services as a coupled safety system.",
      "Ask whether schedule pressure, deferred work or fragmented contracting weakened barriers that appeared sound on paper.",
      "Identify common dependencies across signalling, communications, training and supervision.",
      "Follow recommended rule and technology changes into actual network practice and later enforcement.",
    ],
    memories: [
      "Recover local routes, workers and passengers that disappear when the event is remembered only through a location and toll.",
      "Test whether blame assigned quickly after the event survived later technical and judicial review.",
      "Compare memorial practice with the less visible record of compensation, reconstruction and operational change.",
      "Ask why some rail losses transform national policy while similar events remain confined to local archives.",
    ],
  },
  engineering: {
    label: "engineering-failure record",
    mechanisms: [
      "Reconstruct loading, geometry, material condition, inspection history, environmental stress and the physical sequence of failure.",
      "Keep observed damage, analytical reconstruction and legal allegation in separate evidentiary layers.",
      "Trace design changes, construction deviations, maintenance decisions and warning signs before interpreting the final collapse.",
      "Compare competing technical hypotheses against drawings, tests, photographs, calculations and the limits recorded by investigators.",
    ],
    systems: [
      "Map designer, client, contractor, supplier, inspector, operator, regulator and emergency authority, including contractual gaps between them.",
      "Test whether review was meaningfully independent or reproduced the assumptions of the original design and delivery chain.",
      "Ask how cost, schedule, access and ownership affected inspection quality and the response to anomalies.",
      "Follow codes, retrofit orders and replacement works into implementation instead of equating announcement with risk reduction.",
    ],
    memories: [
      "Look beyond collapse imagery to the ordinary documents and maintenance choices that made the structure's condition knowable.",
      "Recover workers, residents and responders whose testimony can be displaced by a purely technical retrospective.",
      "Distinguish what the event changed in engineering practice from reforms later attributed to it by repetition.",
      "Examine why one spectacular structure becomes canonical while comparable failures remain scattered across specialist archives.",
    ],
  },
  industrial: {
    label: "industrial-hazard record",
    mechanisms: [
      "Reconstruct inventory, process state, containment, ignition or release pathways, alarms, shutdown actions and off-site movement.",
      "Separate substances known to be present from products inferred after fire, reaction, dispersion or environmental transport.",
      "Trace permits, operating changes, maintenance, worker reports and emergency actions before assigning a mechanism.",
      "Compare the facility's intended safeguards with their actual availability, independence and performance during escalation.",
    ],
    systems: [
      "Map owner, operator, contractors, suppliers, inspectors, regulators, responders and neighboring communities across the hazard boundary.",
      "Ask whether production incentives and fragmented oversight normalized conditions that formal safety documents treated as exceptional.",
      "Identify shared dependencies in power, instrumentation, staffing, containment and emergency communication.",
      "Track cleanup, medical surveillance, compensation and enforcement separately from engineering repair.",
    ],
    memories: [
      "Prevent a fireball, plume or contaminated landscape from becoming a substitute for the workers and records preceding it.",
      "Check whether official casualty and exposure categories excluded people whose harm appeared later or outside the facility fence.",
      "Compare corporate, regulatory and community archives for different accounts of warning and recovery.",
      "Ask how technical acronyms or a notorious chemical name narrowed later understanding of the institutional failure.",
    ],
  },
  environment: {
    label: "environmental-accountability record",
    mechanisms: [
      "Establish the source, pathway, timing, measured extent and uncertainty of the environmental change before describing cause or harm.",
      "Separate direct observations, modeled transport, biomonitoring, health inference and legal attribution.",
      "Reconstruct baseline conditions and sampling methods so later comparisons do not inherit an invisible reference point.",
      "Trace cumulative releases and land-use decisions when no single incident supplies a clean beginning.",
    ],
    systems: [
      "Map operators, landowners, utilities, laboratories, health agencies, environmental regulators and affected jurisdictions.",
      "Ask who had authority to measure, disclose, stop and remediate the harm, and whether those roles conflicted.",
      "Test whether monitoring networks could detect the exposure experienced by the most affected communities.",
      "Follow cleanup targets and restoration claims into long-term measurements rather than accepting program completion as ecological recovery.",
    ],
    memories: [
      "Recover slow and uneven harm that dramatic before-and-after imagery can simplify.",
      "Examine how changing place names, boundaries and technical units make older records difficult to connect.",
      "Compare community knowledge with the narrower questions preserved by permits, litigation and official monitoring.",
      "Ask whose losses became countable and whose cultural, subsistence or intergenerational effects remained outside the formal record.",
    ],
  },
  corporate: {
    label: "corporate-accountability record",
    mechanisms: [
      "Build a dated chain from disclosures, transactions, internal controls, public statements, investigations and adjudicated outcomes.",
      "Separate allegations, admissions, settlements, convictions and later commentary so legal posture is never mistaken for a unified fact record.",
      "Trace money, authority and information across entities rather than treating a brand name as one decision-maker.",
      "Identify when warning signs became available to boards, auditors, regulators, counterparties and the public.",
    ],
    systems: [
      "Map executives, boards, employees, auditors, advisers, lenders, investors, regulators and affected customers with their distinct duties.",
      "Test whether formal independence was undermined by fees, incentives, tenure, information asymmetry or revolving relationships.",
      "Ask which controls produced evidence and which existed only as policy language.",
      "Follow governance reforms, restitution and monitoring obligations into completion and enforcement.",
    ],
    memories: [
      "Resist a villain-centered retelling that erases routine approvals and the people who raised concerns.",
      "Compare market mythology with the more fragmented record in filings, hearings and local consequences.",
      "Check whether headline loss figures combine different periods, currencies or categories of harm.",
      "Ask why some corporate failures become enduring cautionary tales while structurally similar cases disappear after settlement.",
    ],
  },
  finance: {
    label: "financial-failure record",
    mechanisms: [
      "Reconstruct the balance-sheet, funding, valuation, disclosure and liquidity sequence using dated records rather than hindsight labels.",
      "Separate realized losses, modeled exposure, alleged misstatement and broader market effect.",
      "Trace instruments and cash flows across legal entities so aggregate numbers retain their source and meaning.",
      "Identify which information was public, privately reported or unavailable at each decision point.",
    ],
    systems: [
      "Map management, boards, auditors, rating firms, lenders, investors, exchanges, central banks and regulators.",
      "Test how incentives, leverage and common models connected institutions that appeared diversified.",
      "Ask whether supervision had both the information and authority required to act before confidence or funding failed.",
      "Follow rescue, resolution, litigation and compensation as separate policy choices with different beneficiaries.",
    ],
    memories: [
      "Keep household, worker and regional effects visible alongside market indexes and institutional totals.",
      "Check how later narratives simplify uncertainty into a single trigger or prophetic warning.",
      "Reconcile nominal figures, currencies and time periods before repeating a memorable loss estimate.",
      "Examine why technical language can depoliticize decisions about who absorbed losses and who retained claims.",
    ],
  },
  consumer: {
    label: "product-and-consumer-safety record",
    mechanisms: [
      "Reconstruct design, manufacturing, distribution, complaint, testing and recall chronology without assuming every reported incident shares one cause.",
      "Separate hazard evidence, exposure, injury reports, defect findings and legal claims.",
      "Trace lot numbers, model changes and market geography so the affected population is not overstated or obscured.",
      "Identify when firms and regulators could first distinguish a pattern from isolated complaints.",
    ],
    systems: [
      "Map manufacturer, suppliers, retailers, laboratories, regulators, clinicians and consumers across the reporting chain.",
      "Ask whether voluntary reporting and recall systems created incentives to delay, narrow or fragment the record.",
      "Test whether safety assurance depended on the same data and experts used to defend the product.",
      "Follow recall reach, disposal, remediation and later incidents rather than treating an announcement as completion.",
    ],
    memories: [
      "Recover ordinary users and workers from advertising images and litigation shorthand.",
      "Check whether the best-known brand or lawsuit eclipsed earlier complaints and lesser-known affected markets.",
      "Compare official counts with the reporting barriers that determine which events enter surveillance systems.",
      "Ask how design changes were credited and whether the affected public could verify that they worked.",
    ],
  },
  health: {
    label: "public-health record",
    mechanisms: [
      "Define case, exposure, population and time window before connecting symptoms, clusters, contamination or transmission.",
      "Separate clinical observation, surveillance signal, epidemiological association, mechanistic evidence and legal conclusion.",
      "Reconstruct how samples, diagnoses and denominators changed as the investigation developed.",
      "Trace the earliest recoverable warnings and the thresholds used to escalate public action.",
    ],
    systems: [
      "Map patients, families, clinicians, laboratories, local authorities, national agencies, institutions and regulated actors.",
      "Ask whether access to care and reporting made some cases visible while systematically excluding others.",
      "Test the independence, speed and transparency of surveillance, research and risk communication.",
      "Follow compensation, monitoring and prevention commitments beyond the declared end of the emergency.",
    ],
    memories: [
      "Protect individual experience from being reduced to a curve, case count or retrospective diagnosis.",
      "Examine how stigma, privacy and unequal access shaped which testimonies and records survived.",
      "Reconcile changing definitions before comparing official totals across time and jurisdictions.",
      "Ask why some health crises become universal reference points while local or marginalized experiences remain difficult to retrieve.",
    ],
  },
  ethics: {
    label: "research-ethics record",
    mechanisms: [
      "Reconstruct recruitment, consent, intervention, observation, data handling and disclosure from the records available at each stage.",
      "Separate what participants were told from what investigators, sponsors and oversight bodies documented privately.",
      "Trace protocol changes and institutional knowledge without imposing today's terminology on older records uncritically.",
      "Identify the evidentiary basis for harm, benefit and authorization claims, including records that may never have been created.",
    ],
    systems: [
      "Map investigators, institutions, sponsors, review bodies, clinicians, participants, families and later custodians of the data.",
      "Ask how dependency, race, class, disability, confinement or access to care affected meaningful choice.",
      "Test whether oversight was independent, informed and capable of intervening rather than merely documenting compliance.",
      "Follow apologies, policy changes, compensation and record access as distinct forms of institutional response.",
    ],
    memories: [
      "Center participants without inventing voices where archives are incomplete or privacy limits identification.",
      "Check whether a notorious label collapses different protocols, periods and institutions into one story.",
      "Examine who controlled the archive and which records participants or descendants could actually access.",
      "Ask how later ethical teaching simplified contested facts or credited reform without testing implementation.",
    ],
  },
  digital: {
    label: "digital-systems failure record",
    mechanisms: [
      "Reconstruct versions, dependencies, access paths, logs, detection, containment and recovery without treating a vendor summary as a complete incident record.",
      "Separate vulnerability, exploitation, outage, data exposure and downstream harm.",
      "Trace the change or intrusion across systems and time while preserving uncertainty where telemetry was absent.",
      "Identify what operators, suppliers, researchers and users knew before, during and after the event.",
    ],
    systems: [
      "Map maintainers, vendors, cloud or network providers, customers, researchers, incident responders and regulators.",
      "Ask how shared libraries, credentials, update channels and service concentration turned local weakness into systemic reach.",
      "Test whether disclosure and patch processes served affected users as well as organizational liability management.",
      "Follow remediation, notification and recurrence evidence rather than assuming a patch or restored dashboard closed the incident.",
    ],
    memories: [
      "Preserve the experience of users and operators when technical nicknames dominate the historical record.",
      "Check whether retrospective certainty exceeds what incomplete logs and contested attribution can support.",
      "Compare contemporaneous advisories with later marketing, litigation and security-industry retellings.",
      "Ask which failures disappear because systems were restored quickly even though costs moved to less visible organizations and people.",
    ],
  },
  public: {
    label: "public-accountability record",
    mechanisms: [
      "Build a chronology from official acts, disclosures, investigations, testimony and adjudicated outcomes while preserving contested facts.",
      "Separate political accusation, documentary evidence, institutional finding and legal judgment.",
      "Trace authority and information across offices rather than treating government as a single actor.",
      "Identify which records were contemporaneous, later released, reconstructed or still unavailable.",
    ],
    systems: [
      "Map officeholders, civil servants, contractors, oversight bodies, courts, journalists and affected communities.",
      "Ask whether formal checks had practical independence, access and enforcement authority.",
      "Test how secrecy, classification, privilege, delay and fragmented custody shaped public understanding.",
      "Follow promised transparency and institutional reform into subsequent practice.",
    ],
    memories: [
      "Resist partisan shorthand that substitutes affiliation for a document-based account.",
      "Recover local consequences and less powerful participants from leader-centered narratives.",
      "Compare what was publicly knowable at the time with facts revealed only years later.",
      "Ask how anniversaries, inquiries and archives changed the meaning of the episode across generations.",
    ],
  },
  crowd: {
    label: "crowd-and-venue safety record",
    mechanisms: [
      "Reconstruct attendance, ingress, egress, density, barriers, communications and emergency movement without describing collective behavior as an unexplained force.",
      "Separate venue geometry, operational decisions, triggering events and the physical dynamics of crowd compression.",
      "Trace ticketing, policing, stewarding and medical response from contemporaneous records and survivor testimony.",
      "Test official descriptions of panic or disorder against spatial, photographic and timing evidence.",
    ],
    systems: [
      "Map organizer, venue owner, contractors, police, transport, licensing authority, medical services and local government.",
      "Ask whether capacity and emergency plans matched the actual distribution and movement of people.",
      "Identify communication and command dependencies that made several safeguards fail together.",
      "Follow venue changes, prosecutions, compensation and later event practice as separate outcomes.",
    ],
    memories: [
      "Center victims and survivors without repeating language that blamed the crowd for conditions imposed on it.",
      "Check how early official accounts influenced reporting even after contrary evidence emerged.",
      "Recover the geography of gates, pens, routes and neighborhoods that a single memorial image cannot show.",
      "Ask why some venue disasters transformed safety practice while similar warnings elsewhere remained local.",
    ],
  },
  space: {
    label: "spaceflight-safety record",
    mechanisms: [
      "Reconstruct mission phase, hardware state, software, telemetry, communications and decision timing from the preserved technical record.",
      "Separate observed anomaly, modeled mechanism, management decision and later investigative conclusion.",
      "Trace test history and accepted deviations before focusing on the final mission sequence.",
      "Compare official findings with dissenting technical views and the evidence available at the time.",
    ],
    systems: [
      "Map program leadership, crews, engineering teams, contractors, safety offices and political sponsors.",
      "Ask how schedule, mission commitments and organizational hierarchy affected the treatment of uncertainty.",
      "Identify common technical and informational dependencies across supposedly independent barriers.",
      "Follow redesign, return-to-flight and institutional reform into later missions.",
    ],
    memories: [
      "Look beyond iconic footage and heroic narrative to the engineers, technicians and earlier test record.",
      "Check whether later program mythology resolved disagreements that the archive still preserves.",
      "Recover international and local consequences obscured by a mission-centered account.",
      "Ask how secrecy, technical complexity and institutional prestige shaped what entered public memory.",
    ],
  },
  infrastructure: {
    label: "infrastructure-outage record",
    mechanisms: [
      "Reconstruct demand, capacity, topology, protection, control actions and restoration timing across the affected network.",
      "Separate initiating fault, automatic response, operator intervention, cascading effects and customer impact.",
      "Trace the incident across utility and jurisdictional boundaries without assuming one timestamp or cause fits the entire outage.",
      "Test technical explanations against logs, operating standards, weather and maintenance records.",
    ],
    systems: [
      "Map asset owners, system operators, suppliers, regulators, emergency services and dependent public institutions.",
      "Ask whether reliability rules captured the dependencies that actually carried failure across the network.",
      "Identify where redundancy shared substations, software, communications, fuel or staffing.",
      "Follow restoration metrics and resilience promises into later audits and repeat events.",
    ],
    memories: [
      "Recover uneven consequences for hospitals, transit, communications, small businesses and households.",
      "Check whether a simple trigger story hides the protective actions that enlarged or limited the cascade.",
      "Compare operator timelines with the experience of places restored last.",
      "Ask why short outages vanish from institutional memory even when they reveal major common-mode risk.",
    ],
  },
  evidence: {
    label: "public-evidence and deception record",
    mechanisms: [
      "Reconstruct the claim's origin, circulation, amplification, challenge and correction from dated records rather than beginning with the eventual reveal.",
      "Separate deliberate deception, satire, error, rumor, disputed interpretation and later imitation instead of treating every false claim as the same act.",
      "Trace which artifacts, witnesses and tests made the claim persuasive, and which evidence first made a reliable challenge possible.",
      "Compare the earliest surviving version with later retellings so additions and reversals are visible rather than folded into one canonical story.",
    ],
    systems: [
      "Map originators, publishers, platforms, institutions, experts, investigators and audiences according to what each could verify and why they repeated the claim.",
      "Ask how authority, commercial incentive, secrecy, technology and unequal access to evidence shaped credibility.",
      "Test whether correction channels reached the same audiences and archives as the original account.",
      "Follow legal, professional and institutional responses without assuming exposure restored trust or repaired harm.",
    ],
    memories: [
      "Resist a clever-reveal narrative that erases people harmed, institutions misled or evidence lost while the claim circulated.",
      "Check whether the familiar version preserves what contemporaries actually believed or projects the later resolution backward.",
      "Recover failed tests, dissenting voices and ambiguous evidence that a tidy debunking story tends to discard.",
      "Ask why the claim remained culturally useful after its factual status changed, and who controlled the surviving archive.",
    ],
  },
  culture: {
    label: "cultural-and-archival loss record",
    mechanisms: [
      "Reconstruct custody, provenance, physical condition, disputed attribution, loss and recovery from catalogues and contemporaneous records.",
      "Separate documented object history from later legend, market claim and institutional interpretation.",
      "Trace when uncertainty entered the record and who had access to the material needed to resolve it.",
      "Compare inventories, photographs, scientific examination, legal files and community knowledge without privileging one archive automatically.",
    ],
    systems: [
      "Map creators or originating communities, custodians, dealers, collectors, researchers, insurers, public authorities and archives.",
      "Ask how ownership, colonial history, conflict, market incentive and institutional prestige shaped preservation and disclosure.",
      "Test the independence and transparency of authentication, acquisition and restitution processes.",
      "Follow recovery, digitization, repatriation and reconstruction claims into actual access and stewardship.",
    ],
    memories: [
      "Distinguish the fame of an object or controversy from the less visible people and records around it.",
      "Check whether absence in one catalogue was mistaken for absence from community memory.",
      "Recover uncertainty instead of resolving provenance gaps with a compelling anecdote.",
      "Ask whose definition of loss, authenticity and rightful custody controls the surviving public narrative.",
    ],
  },
};

const seeds = [
  ["Aviation accidents and incidents", "aviation", "World", "aviation safety"],
  ["Maritime incidents", "maritime", "World", "maritime safety"],
  ["Shipwrecks", "maritime", "World", "shipwrecks"],
  ["Railway accidents and incidents", "rail", "World", "rail safety"],
  ["Bridge disasters", "engineering", "Underreported", "bridges"],
  ["Engineering failures", "engineering", "Technology", "engineering"],
  ["Building and structure collapses", "engineering", "Underreported", "structural safety"],
  ["Construction accidents", "engineering", "Underreported", "construction safety"],
  ["Tunnel disasters", "engineering", "Underreported", "tunnels"],
  ["Mining disasters", "industrial", "World", "mining safety"],
  ["Chemical disasters", "industrial", "Science", "chemical safety"],
  ["Industrial fires and explosions", "industrial", "Science", "industrial safety"],
  ["Explosions", "industrial", "Underreported", "explosions"],
  ["Nuclear accidents and incidents", "industrial", "Science", "nuclear safety"],
  ["Oil platform disasters", "industrial", "Business", "offshore safety"],
  ["Dam failures", "engineering", "World", "dam safety"],
  ["Oil spills", "environment", "World", "oil spills"],
  ["Environmental disasters", "environment", "World", "environmental harm"],
  ["Water pollution", "environment", "Science", "water pollution"],
  ["Environmental controversies", "environment", "Science", "environmental accountability"],
  ["Corporate scandals", "corporate", "Business", "corporate accountability"],
  ["Accounting scandals", "corporate", "Business", "accounting"],
  ["Financial scandals", "finance", "Business", "financial accountability"],
  ["Financial crises", "finance", "Business", "financial crises"],
  ["Stock market crashes", "finance", "Business", "market failures"],
  ["Bank failures", "finance", "Business", "banking"],
  ["Product recalls", "consumer", "Business", "product safety"],
  ["Food safety scandals", "consumer", "Science", "food safety"],
  ["Medical scandals", "health", "Science", "medical accountability"],
  ["Health disasters", "health", "Science", "public health"],
  ["Mass poisonings", "health", "Science", "toxic exposure"],
  ["Epidemics", "health", "Science", "epidemics"],
  ["Pandemics", "health", "Science", "pandemics"],
  ["Famines", "health", "World", "food systems"],
  ["Human subject research in the United States", "ethics", "Science", "research ethics"],
  ["Computer security exploits", "digital", "Technology", "computer security"],
  ["Data breaches", "digital", "Technology", "data protection"],
  ["Cyberattacks", "digital", "Technology", "cybersecurity"],
  ["Computer errors", "digital", "Technology", "computer failures"],
  ["Software bugs", "digital", "Technology", "software safety"],
  ["Internet outages", "digital", "Technology", "internet infrastructure"],
  ["Privacy controversies", "digital", "Technology", "privacy"],
  ["Political scandals", "public", "World", "public accountability"],
  ["Political controversies", "public", "World", "political records"],
  ["Stadium disasters", "crowd", "Underreported", "venue safety"],
  ["Crowd collapses and crushes", "crowd", "Underreported", "crowd safety"],
  ["Amusement park accidents", "crowd", "Underreported", "amusement safety"],
  ["Space accidents and incidents", "space", "Science", "spaceflight safety"],
  ["Power outages", "infrastructure", "Technology", "power systems"],
  ["Library fires", "culture", "Culture", "archives"],
  ["Archaeological controversies", "culture", "Culture", "archaeology"],
  ["Lost works of art", "culture", "Culture", "cultural loss"],
  ["Destruction of cultural heritage", "culture", "Culture", "cultural heritage"],
  ["Hoaxes", "evidence", "Culture", "public evidence"],
].map(([category, profile, section, tag]) => ({ category, profile, section, tag }));

const genericTitles = new Set([
  "aviation accidents and incidents", "maritime incident", "shipwreck", "railway accidents and incidents",
  "bridge disaster", "engineering failure", "building collapse", "construction accident", "tunnel disaster",
  "mining accident", "chemical accident", "explosion", "nuclear and radiation accidents and incidents",
  "oil spill", "environmental disaster", "water pollution", "corporate scandal", "accounting scandal",
  "financial crisis", "stock market crash", "bank failure", "product recall", "food safety incident",
  "medical scandal", "epidemic", "pandemic", "famine", "computer security exploit", "data breach",
  "cyberattack", "computer error", "software bug", "internet outage", "political scandal", "power outage",
  "hoax", "archaeological controversy",
]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(base, params, label) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(url, {
      headers: { "user-agent": USER_AGENT, "api-user-agent": USER_AGENT },
      signal: AbortSignal.timeout(30000),
    });
    if (response.ok) {
      const data = await response.json();
      if (!data.error) return data;
      if (data.error.code !== "maxlag") throw new Error(`${label}: ${data.error.code}: ${data.error.info}`);
    } else if (![429, 500, 502, 503, 504].includes(response.status)) {
      throw new Error(`${label}: HTTP ${response.status}`);
    }
    const retryAfter = Number(response.headers.get("retry-after"));
    await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : attempt * 2000);
  }
  throw new Error(`${label}: exhausted retries`);
}

function chunks(items, size) {
  const output = [];
  for (let index = 0; index < items.length; index += size) output.push(items.slice(index, index + size));
  return output;
}

function hash(value) {
  let result = 2166136261;
  for (const character of value) {
    result ^= character.codePointAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 78)
    .replace(/-$/g, "");
}

function wikipediaTitle(urlValue) {
  try {
    const url = new URL(urlValue);
    if (url.hostname !== "en.wikipedia.org" || !url.pathname.startsWith("/wiki/")) return null;
    return decodeURIComponent(url.pathname.slice(6)).replaceAll("_", " ");
  } catch {
    return null;
  }
}

function normalizedUrl(urlValue) {
  try {
    const url = new URL(urlValue);
    url.hash = "";
    return url.href.replace(/\/$/, "").toLowerCase();
  } catch {
    return urlValue.toLowerCase();
  }
}

function titleRejected(title) {
  const normalized = title.trim().toLowerCase();
  return genericTitles.has(normalized)
    || /^(?:list|lists|outline|index|timeline|chronology|bibliography|glossary) of\b/i.test(title)
    || /\((?:disambiguation|list)\)$/i.test(title);
}

function existingCorpus() {
  const slugs = new Set();
  const titles = new Set();
  const urls = new Set();
  const wikiTitles = new Set();
  const wikidataIds = new Set();
  for (const file of fs.readdirSync("content/drafts").filter((name) => name.endsWith(".md"))) {
    const { metadata } = readDraft(path.join("content/drafts", file));
    slugs.add(metadata.slug);
    titles.add(metadata.title.toLowerCase());
    for (const source of metadata.sources) {
      urls.add(normalizedUrl(source.url));
      const title = wikipediaTitle(source.url);
      if (title) wikiTitles.add(title);
      const entityId = source.url.match(/^https:\/\/www\.wikidata\.org\/wiki\/(Q\d+)$/)?.[1];
      if (entityId) wikidataIds.add(entityId);
    }
  }
  for (const file of fs.readdirSync("content/articles").filter((name) => name.endsWith(".mdx"))) {
    const source = fs.readFileSync(path.join("content/articles", file), "utf8");
    const slug = source.match(/^slug:\s*"([^"]+)"/m)?.[1];
    const title = source.match(/^title:\s*"([^"]+)"/m)?.[1];
    const sourceUrl = source.match(/^sourceUrl:\s*"([^"]+)"/m)?.[1];
    if (slug) slugs.add(slug);
    if (title) titles.add(title.toLowerCase());
    if (sourceUrl) {
      urls.add(normalizedUrl(sourceUrl));
      const wikiTitle = wikipediaTitle(sourceUrl);
      if (wikiTitle) wikiTitles.add(wikiTitle);
    }
  }
  return { slugs, titles, urls, wikiTitles, wikidataIds };
}

async function resolveExistingPageIds(wikiTitles) {
  const pageIds = new Set();
  for (const batch of chunks([...wikiTitles], 25)) {
    const data = await fetchJson(WIKIPEDIA_API, {
      action: "query", titles: batch.join("|"), redirects: "1", prop: "info",
      format: "json", formatversion: "2", origin: "*", maxlag: "5",
    }, "existing Wikipedia source resolution");
    for (const page of data.query?.pages ?? []) if (!page.missing && page.pageid) pageIds.add(page.pageid);
    await sleep(80);
  }
  return pageIds;
}

async function fetchCategory(seed) {
  const cacheFile = path.join(CACHE_DIRECTORY, `category-${slugify(seed.category)}.json`);
  if (fs.existsSync(cacheFile)) return { ...seed, pages: JSON.parse(fs.readFileSync(cacheFile, "utf8")) };
  const pages = [];
  let continuation = {};
  do {
    const data = await fetchJson(WIKIPEDIA_API, {
      action: "query",
      list: "categorymembers",
      cmtitle: `Category:${seed.category}`,
      cmnamespace: "0",
      cmtype: "page",
      cmlimit: "max",
      cmprop: "ids|title",
      format: "json",
      formatversion: "2",
      maxlag: "5",
      ...continuation,
    }, `Category:${seed.category}`);
    pages.push(...(data.query?.categorymembers ?? []));
    continuation = data.continue ?? null;
    await sleep(250);
  } while (continuation);
  const eligible = pages
    .filter((page) => page.ns === 0 && page.pageid && !titleRejected(page.title))
    .sort((left, right) => hash(`${seed.category}:${left.pageid}`) - hash(`${seed.category}:${right.pageid}`));
  fs.writeFileSync(cacheFile, JSON.stringify(eligible));
  return { ...seed, pages: eligible };
}

async function fetchCategories() {
  const output = [];
  for (const seed of seeds) {
    output.push(await fetchCategory(seed));
  }
  if (values["include-subcategories"]) {
    const seenCategories = new Set(seeds.map((seed) => seed.category));
    for (const seed of seeds) {
      const cacheFile = path.join(CACHE_DIRECTORY, `subcategories-${slugify(seed.category)}.json`);
      let children;
      if (fs.existsSync(cacheFile)) children = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
      else {
        const data = await fetchJson(WIKIPEDIA_API, {
          action: "query", list: "categorymembers", cmtitle: `Category:${seed.category}`,
          cmtype: "subcat", cmlimit: "max", format: "json", formatversion: "2", maxlag: "5",
        }, `Subcategories of ${seed.category}`);
        children = data.query?.categorymembers ?? [];
        fs.writeFileSync(cacheFile, JSON.stringify(children));
        await sleep(250);
      }
      const selected = children
        .filter((page) => !/by (?:country|year|continent|decade|type|century)|lists of/i.test(page.title))
        .sort((left, right) => hash(left.title) - hash(right.title)).slice(0, 4);
      for (const child of selected) {
        const category = child.title.replace(/^Category:/, "");
        if (seenCategories.has(category)) continue;
        seenCategories.add(category);
        output.push(await fetchCategory({ ...seed, category }));
      }
      console.error(`Discovery: ${output.length} indexes, ${new Set(output.flatMap((pool) => pool.pages.map((page) => page.pageid))).size} candidate pages`);
    }
  }
  return output;
}

async function fetchPageDetails(pageIds) {
  const pages = new Map();
  for (const batch of chunks(pageIds, 50)) {
    const data = await fetchJson(WIKIPEDIA_API, {
      action: "query",
      pageids: batch.join("|"),
      prop: "info|pageprops|revisions",
      inprop: "url",
      ppprop: "wikibase_item|disambiguation",
      rvprop: "ids|timestamp",
      format: "json",
      formatversion: "2",
      maxlag: "5",
    }, "Wikipedia page-detail batch");
    for (const page of data.query?.pages ?? []) pages.set(page.pageid, page);
    await sleep(250);
  }
  return pages;
}

async function fetchWikidataEntities(ids) {
  const entities = new Map();
  for (const batch of chunks(ids, 50)) {
    const data = await fetchJson(WIKIDATA_API, {
      action: "wbgetentities",
      ids: batch.join("|"),
      props: "labels|descriptions|info",
      languages: "en",
      languagefallback: "1",
      format: "json",
      formatversion: "2",
      origin: "*",
      maxlag: "5",
    }, "Wikidata entity batch");
    const rows = Array.isArray(data.entities) ? data.entities : Object.values(data.entities ?? {});
    for (const entity of rows) entities.set(entity.id, entity);
    await sleep(80);
  }
  return entities;
}

function choose(items, key, offset = 0) {
  return items[(hash(key) + offset) % items.length];
}

function planFor(candidate, entity, slug) {
  const profile = profiles[candidate.profile];
  const subject = candidate.title;
  const key = `${candidate.pageid}:${subject}`;
  const description = entity?.descriptions?.en?.value?.trim() ?? "";
  const headingLabel = profile.label.replace(/\b[a-z]/g, (character) => character.toUpperCase());
  const titleClosers = [
    `Reconstructing the ${headingLabel}`,
    `The Evidence Behind a ${headingLabel}`,
    `A Source Map for the ${headingLabel}`,
    `Chronology, Evidence and Institutional Responsibility`,
    `What the ${headingLabel} Still Needs to Establish`,
  ];
  const title = `${subject}: ${choose(titleClosers, key)}`;
  const descriptionClause = description
    ? `Wikidata's current English description identifies the subject as “${description}.”`
    : "The linked Wikidata item does not currently supply an English description.";
  const event = `${subject} enters this private reporting corpus through Wikipedia's “${candidate.category}” index. ${descriptionClause} Those discovery signals are not accepted as verified narrative. The finished article must establish which event, dispute, system or loss the name denotes; where and when it belongs; who created the surviving record; and which primary and independent sources can support a fair chronology.`;
  const mechanism = `${choose(profile.mechanisms, key, 1)} For ${subject}, every date, quantity, quotation and causal statement remains open until the underlying record is located and reconciled.`;
  const system = `${choose(profile.systems, key, 2)} The reporting must name the institutions specific to ${subject}, distinguish their powers from their public claims and document meaningful disagreement rather than smoothing it away.`;
  const memory = `${choose(profile.memories, key, 3)} The obscurity question for ${subject} is therefore an evidence problem: the article must show how records were preserved, restricted, dispersed, digitized or repeated before arguing why public memory changed.`;
  const evidencePlan = [
    `Locate the earliest contemporaneous record that unambiguously identifies ${subject} and fixes the scope of the chronology.`,
    `Obtain the principal investigation, inquiry, court, regulatory or technical record relevant to this ${profile.label}.`,
    `Find an independent contemporary source and a later retrospective source, then document where either conflicts with the official account.`,
  ];
  const stakeholderPlan = [
    `Identify people directly affected by ${subject} without inferring names, motives or testimony from aggregate accounts.`,
    `Map the organizations with power to prevent, disclose, investigate, remedy or preserve the record of ${subject}.`,
    `Seek a source able to test the dominant explanation, including local, labor, survivor, community or specialist archives where appropriate.`,
  ];
  const openQuestions = [
    `What is the earliest claim about ${subject} that can be tied to a dated primary record?`,
    `Which widely repeated number or causal statement about ${subject} has the weakest visible provenance?`,
    `What changed afterward, who verified implementation and what evidence would show that the change endured?`,
  ];
  return {
    slug,
    title,
    dek: `A source-led reconstruction of ${subject}, centered on chronology, institutional responsibility, missing voices and the evidence still required before publication.`,
    section: candidate.section,
    tags: [candidate.tag, "archival research", "verification pending"],
    profile: candidate.profile,
    event,
    mechanism,
    system,
    memory,
    evidencePlan,
    stakeholderPlan,
    openQuestions,
    source: { title: `${subject} — Wikipedia orientation page`, url: candidate.fullurl },
    discovery: {
      category: candidate.category,
      wikipediaPageId: candidate.pageid,
      wikipediaRevisionId: candidate.revisions?.[0]?.revid ?? candidate.lastrevid ?? null,
      wikipediaRevisionTimestamp: candidate.revisions?.[0]?.timestamp ?? null,
      wikidataId: candidate.pageprops.wikibase_item,
      wikidataRevisionId: entity?.lastrevid ?? null,
      wikidataUrl: `https://www.wikidata.org/wiki/${candidate.pageprops.wikibase_item}`,
      wikidataDescription: description || null,
      retrievedAt: RETRIEVED_AT,
    },
  };
}

const existing = existingCorpus();
console.error(`Excluding ${existing.slugs.size} existing slugs and ${existing.wikidataIds.size} Wikidata identities`);
const existingPageIds = await resolveExistingPageIds(existing.wikiTitles);
const categoryPools = await fetchCategories();
const preliminary = [];
const seenPageIds = new Set(existingPageIds);
const seenSlugs = new Set(existing.slugs);
const positions = new Array(categoryPools.length).fill(0);

while (preliminary.length < TARGET * 2) {
  let progressed = false;
  for (let index = 0; index < categoryPools.length && preliminary.length < TARGET * 2; index += 1) {
    const pool = categoryPools[index];
    while (positions[index] < pool.pages.length) {
      const page = pool.pages[positions[index]++];
      const proposedSlug = `${slugify(page.title)}-record`;
      if (!proposedSlug || seenPageIds.has(page.pageid) || seenSlugs.has(proposedSlug)) continue;
      preliminary.push({ ...page, profile: pool.profile, section: pool.section, tag: pool.tag, category: pool.category, proposedSlug });
      seenPageIds.add(page.pageid);
      seenSlugs.add(proposedSlug);
      progressed = true;
      break;
    }
  }
  if (!progressed) break;
}

console.error(`Resolving ${preliminary.length} distinct candidates`);
const details = await fetchPageDetails(preliminary.map((page) => page.pageid));
const selected = [];
const seenWikidataIds = new Set(existing.wikidataIds);
for (const candidate of preliminary) {
  const page = details.get(candidate.pageid);
  if (!page?.fullurl || !page.pageprops?.wikibase_item || !page.revisions?.[0]?.revid || "disambiguation" in (page.pageprops ?? {})) continue;
  if (seenWikidataIds.has(page.pageprops.wikibase_item) || existing.urls.has(normalizedUrl(page.fullurl))) continue;
  selected.push({ ...candidate, ...page });
  seenWikidataIds.add(page.pageprops.wikibase_item);
  if (selected.length === TARGET) break;
}

if (selected.length !== TARGET) {
  const availability = categoryPools.map((pool) => `${pool.category}:${pool.pages.length}`).join(", ");
  throw new Error(`Only ${selected.length} eligible new subjects were available; category pages: ${availability}`);
}

console.error(`Capturing Wikidata revisions for ${selected.length} selected subjects`);
const entities = await fetchWikidataEntities(selected.map((page) => page.pageprops.wikibase_item));
if (selected.some((page) => !entities.get(page.pageprops.wikibase_item)?.lastrevid)) throw new Error("A selected subject lacks a Wikidata revision; preserve the failure instead of inventing provenance");
const records = selected
  .map((candidate) => planFor(candidate, entities.get(candidate.pageprops.wikibase_item), candidate.proposedSlug))
  .sort((left, right) => left.slug.localeCompare(right.slug));

const uniqueFields = ["slug", "title", "dek", "event", "mechanism", "system", "memory"];
for (const field of uniqueFields) {
  if (new Set(records.map((record) => record[field])).size !== TARGET) throw new Error(`${field} is not unique across the manifest`);
}
if (new Set(records.map((record) => record.source.url)).size !== TARGET) throw new Error("Source URLs are not unique");
if (new Set(records.map((record) => record.discovery.wikipediaPageId)).size !== TARGET) throw new Error("Wikipedia page IDs are not unique");
if (new Set(records.map((record) => record.discovery.wikidataId)).size !== TARGET) throw new Error("Wikidata IDs are not unique");
if (records.some((record) => existing.titles.has(record.title.toLowerCase()))) throw new Error("Generated title collides with the existing corpus");

fs.writeFileSync(OUTPUT, `${JSON.stringify(records, null, 2)}\n`);
const distribution = records.reduce((counts, record) => {
  counts[record.section] = (counts[record.section] ?? 0) + 1;
  return counts;
}, {});
console.log(JSON.stringify({ output: OUTPUT, records: records.length, categories: new Set(records.map((record) => record.discovery.category)).size, distribution, retrievedAt: RETRIEVED_AT }, null, 2));
