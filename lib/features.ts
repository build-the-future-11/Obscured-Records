export type FeatureSection = {
  heading: string;
  paragraphs: string[];
};

export type FeatureSource = {
  label: string;
  publisher: string;
  url: string;
  kind: "Primary document" | "Official report" | "Research" | "Public record";
};

export type FeatureRecord = {
  label: "Feature";
  updated: string;
  location: string;
  standfirst: string;
  timeline: Array<{ date: string; event: string }>;
  sections: FeatureSection[];
  sources: FeatureSource[];
};

export const features: Record<string, FeatureRecord> = {
  "fedex-flight-705": {
    label: "Feature",
    updated: "19 Sep 2026",
    location: "Memphis, Tennessee",
    standfirst: "The violence aboard Flight 705 is remembered as an impossible cockpit fight. The record also exposes a security system built on employee trust, a plan designed around insurance, and an aircraft pushed far beyond its operating limits.",
    timeline: [
      { date: "7 Apr 1994 · 14:50", event: "FedEx Flight 705 departs Memphis for San Jose with three operating crew and Auburn Calloway in the jump seat." },
      { date: "Minutes after takeoff", event: "Calloway attacks the crew. First Officer James Tucker keeps control while the aircraft enters extreme banks and dives." },
      { date: "About 30 minutes later", event: "The damaged DC-10 returns to Memphis. Police and medical teams meet the aircraft." },
      { date: "1995–1997", event: "Calloway is convicted and his life sentence is upheld by the Sixth Circuit Court of Appeals." },
    ],
    sections: [
      {
        heading: "A plan built around an accident",
        paragraphs: [
          "Auburn Calloway was a FedEx flight engineer facing a disciplinary hearing. In the weeks before Flight 705, court records show that he reorganized parts of his finances and changed beneficiaries on insurance policies. Prosecutors argued that he intended to kill the crew, crash the aircraft and make the deaths appear accidental so that his family could receive the benefits.",
          "He boarded as an employee passenger carrying hammers, a speargun and other equipment. The plan depended on an assumption that was ordinary in cargo aviation at the time: a uniformed colleague in a jump seat was part of the trusted system. There was no passenger cabin, no crowd of witnesses and no conventional hijacking demand. The threat began inside the institution rather than outside it.",
        ],
      },
      {
        heading: "The aircraft became part of the defence",
        paragraphs: [
          "Calloway struck Captain David Sanders, First Officer James Tucker and Flight Engineer Andrew Peterson with hammers. Tucker, badly injured, remained at the controls while Sanders and Peterson fought in the cockpit and galley. To make it harder for Calloway to stand and attack, Tucker rolled and dived the fully fuelled DC-10 with forces well outside an ordinary transport flight.",
          "The manoeuvres were not cinematic flourishes. They were an improvised use of mass, gravity and the aircraft's control surfaces. The crew had to subdue an attacker without losing the jet, then bring a damaged aircraft back while each man was suffering major injuries. The return to Memphis preserved the physical evidence and the cockpit record that later anchored the criminal case.",
        ],
      },
      {
        heading: "What the case changed",
        paragraphs: [
          "The case sits at the boundary between aviation security and workplace access. Screening systems are often designed around strangers carrying prohibited items. Flight 705 showed how credentials, familiarity and organizational trust can allow a determined insider to move differently through the same environment.",
          "The aircraft itself returned to service, but the three crew members lived with lasting injuries. Their survival should not erase the institutional lesson: security is not only a perimeter. It is also the set of assumptions an organization makes about people already inside it.",
        ],
      },
    ],
    sources: [
      { label: "United States v. Auburn Calloway, 116 F.3d 1129", publisher: "U.S. Court of Appeals for the Sixth Circuit", url: "https://law.justia.com/cases/federal/appellate-courts/F3/116/1129/610984/", kind: "Public record" },
      { label: "FedEx Flight 705 incident files", publisher: "Federal Bureau of Investigation Vault", url: "https://vault.fbi.gov/fedex-flight-705-incident-on-april-7-1994", kind: "Primary document" },
      { label: "U.S. Attorneys' Bulletin, Vol. 44 No. 1", publisher: "U.S. Department of Justice", url: "https://www.justice.gov/sites/default/files/usao/legacy/2007/01/11/usab4401.pdf", kind: "Official report" },
    ],
  },
  "wirecard-missing-billions": {
    label: "Feature",
    updated: "19 Sep 2026",
    location: "Aschheim, Germany",
    standfirst: "Wirecard did not collapse because one number went missing. It collapsed after warnings, unusual margins and opaque third-party business repeatedly failed to trigger an effective response from auditors, supervisors and political institutions.",
    timeline: [
      { date: "2015", event: "Public reporting begins raising sustained questions about Wirecard's accounting and third-party acquiring business." },
      { date: "2019", event: "German authorities impose a temporary ban on short selling Wirecard shares while scrutiny of critics intensifies." },
      { date: "18 Jun 2020", event: "Wirecard says auditors cannot confirm €1.9 billion supposedly held in trustee accounts." },
      { date: "25 Jun 2020", event: "Wirecard files for insolvency." },
    ],
    sections: [
      {
        heading: "The prestige shield",
        paragraphs: [
          "Wirecard presented itself as the modern answer to Europe's dependence on foreign payment technology. That story mattered. A fast-growing company with a technology label could be treated as strategically important even when much of its business involved the familiar work of moving card payments between merchants, banks and networks.",
          "Its complexity became protective. Revenue attributed to third-party partners was difficult for outsiders to verify, yet it helped support profit margins that appeared exceptional for the industry. The more complicated the structure looked, the easier it became to describe basic verification problems as misunderstandings of an innovative company.",
        ],
      },
      {
        heading: "Warnings met the wrong machinery",
        paragraphs: [
          "Journalists and whistle-blowers raised concerns for years. Instead of producing a single, decisive investigation of the company's accounts, the warnings moved through a fragmented system. Wirecard Bank was directly supervised as a bank, while much of the larger group sat within a different reporting and enforcement structure.",
          "ESMA's fast-track review later identified weaknesses in market monitoring, examination procedures, professional scepticism and information exchange. The failure was distributed. No single omission explains the collapse; the scandal was able to survive because several lines of defence treated another institution as the place where the decisive check would occur.",
        ],
      },
      {
        heading: "The cash that could not be found",
        paragraphs: [
          "In June 2020, auditors could not obtain sufficient evidence for €1.9 billion reported in trustee accounts. Wirecard soon said the money probably did not exist. Insolvency followed within days, turning an argument about aggressive reporting into proof that the balance sheet could not be trusted.",
          "The lasting record is less about a charismatic fraud than about verification. Cash is one of the simplest assets to confirm. When institutions accepted substitutes for direct evidence, national prestige, market confidence and organizational complexity were allowed to stand in for the thing an audit is meant to demand: proof.",
        ],
      },
    ],
    sources: [
      { label: "Final report of the Wirecard committee of inquiry", publisher: "German Bundestag", url: "https://www.bundestag.de/presse/hib/849326-849326", kind: "Official report" },
      { label: "Fast Track Peer Review Report — Wirecard", publisher: "European Securities and Markets Authority", url: "https://www.esma.europa.eu/document/fast-track-peer-review-report-wirecard", kind: "Official report" },
      { label: "Wider supervisory implications of the Wirecard case", publisher: "European Parliament", url: "https://op.europa.eu/en/publication-detail/-/publication/af6b6959-1f41-11ec-bd8e-01aa75ed71a1/language-en", kind: "Research" },
    ],
  },
  "goiania-blue-powder": {
    label: "Feature",
    updated: "19 Sep 2026",
    location: "Goiânia, Brazil",
    standfirst: "A stolen radiotherapy source passed through homes and a scrapyard because the danger was invisible and the material inside appeared beautiful. The accident became a case study in what happens when hazardous equipment outlives the institution responsible for it.",
    timeline: [
      { date: "13 Sep 1987", event: "Two men remove part of an abandoned radiotherapy unit from a former clinic." },
      { date: "Mid-September", event: "The capsule is opened at a scrapyard. Glowing caesium chloride fragments are shared with relatives and neighbours." },
      { date: "28 Sep 1987", event: "The material is taken to public-health authorities and the radiological emergency is recognized." },
      { date: "Following months", event: "Large-scale monitoring, decontamination and waste removal continue across Goiânia." },
    ],
    sections: [
      {
        heading: "An orphaned source",
        paragraphs: [
          "The radiotherapy institute had moved, but a teletherapy unit containing caesium-137 remained behind. The building was partly demolished and insufficiently secured. When scavengers entered and removed the rotating assembly, they were not breaching a working nuclear facility. They were taking metal from a place that looked abandoned.",
          "The source capsule eventually reached a scrapyard. When it was opened, the caesium chloride inside produced a blue glow in the dark. Pieces were handled, carried home and shown to other people. Because the material could be divided and dissolved, contamination moved through ordinary contact long before anyone recognized a radiological pattern.",
        ],
      },
      {
        heading: "The emergency spread socially",
        paragraphs: [
          "People became ill with symptoms that initially resembled food poisoning or another common sickness. The source travelled through relationships: family members, neighbours, customers and workers. This is why the accident cannot be understood only as a technical failure. The material acquired social meaning before it acquired a warning label—it was curious, valuable-looking and worth sharing.",
          "Once authorities identified the source, the response required monitoring tens of thousands of residents, isolating contaminated people, demolishing structures and packaging large quantities of waste. Four people died in the first weeks. Hundreds showed measurable contamination, while fear and stigma spread much farther than the isotope itself.",
        ],
      },
      {
        heading: "The lesson of equipment left behind",
        paragraphs: [
          "The International Atomic Energy Agency's account emphasized failures of security, regulatory control, communication and preparedness. A dangerous source had effectively become ownerless while remaining physically intact. The accident changed how governments thought about sealed sources used in medicine and industry after facilities close or equipment is discarded.",
          "Goiânia remains a warning against treating disposal as an administrative afterthought. A device can stop producing medical value without stopping its radiation. Institutions can close, ownership can become disputed and records can vanish, but the physical hazard keeps its own schedule.",
        ],
      },
    ],
    sources: [
      { label: "The Radiological Accident in Goiânia", publisher: "International Atomic Energy Agency", url: "https://www.iaea.org/publications/3684/the-radiological-accident-in-goiania", kind: "Official report" },
      { label: "Radioactive source involved in the Goiânia accident", publisher: "IAEA Imagebank / Wikimedia Commons", url: "https://commons.wikimedia.org/wiki/File:02010019_radioactive_cesium_source_Goi%C3%A2nia_accident.jpg", kind: "Public record" },
      { label: "Medical handling of the accident", publisher: "IAEA", url: "https://www.iaea.org/publications/3684/the-radiological-accident-in-goiania", kind: "Research" },
    ],
  },
  "lake-nyos": {
    label: "Feature",
    updated: "19 Sep 2026",
    location: "Northwest Cameroon",
    standfirst: "Lake Nyos killed without fire, lava or visible destruction. Carbon dioxide stored in deep water escaped into the night and followed the landscape downhill, turning a geological process into a mass-casualty event.",
    timeline: [
      { date: "21 Aug 1986", event: "A catastrophic release of carbon dioxide begins at Lake Nyos." },
      { date: "That night", event: "Dense gas moves through nearby valleys, asphyxiating residents and livestock in low-lying communities." },
      { date: "1986–1987", event: "International teams investigate the lake, the gas source and possible mitigation." },
      { date: "2001 onward", event: "Controlled degassing pipes begin removing gas-rich deep water." },
    ],
    sections: [
      {
        heading: "A lake storing pressure",
        paragraphs: [
          "Lake Nyos occupies a volcanic crater. Carbon dioxide from deep geological sources entered the bottom water and dissolved under pressure. Because the lake's layers did not mix completely, gas-rich water could remain below while the surface looked ordinary.",
          "On 21 August 1986, that stable arrangement failed. The exact initiating mechanism remains debated, but once deep water rose and pressure fell, dissolved gas came out of solution. The process accelerated: bubbles lifted more water, which released more gas, producing a rapid overturn rather than a conventional volcanic eruption.",
        ],
      },
      {
        heading: "The cloud followed the ground",
        paragraphs: [
          "Carbon dioxide is colourless and denser than ordinary air. The cloud moved over the crater rim and into valleys, displacing breathable air in settlements below. Buildings were largely undamaged. Many victims appeared to have collapsed where they were, which made the landscape difficult to interpret when rescuers arrived.",
          "At least 1,700 people died, along with thousands of livestock. Survivors described losing consciousness and waking among bodies. The absence of visible destruction initially made the event look mysterious, but chemical and geological evidence pointed to a massive release of CO₂ accumulated in the lake.",
        ],
      },
      {
        heading: "Engineering a slow release",
        paragraphs: [
          "Investigators warned that significant gas remained. Engineers eventually installed pipes reaching into the deep water. Once flow begins, the expanding gas drives a self-sustaining fountain, allowing carbon dioxide to escape gradually at the surface instead of accumulating under pressure.",
          "Degassing transformed the problem from an unknown catastrophe into a monitored infrastructure project. It did not erase the need for vigilance: the lake, its natural dam and the communities around it remain part of the same risk system. Nyos matters because the eventual safety mechanism emerged from understanding the precise physical process that made the disaster invisible.",
        ],
      },
    ],
    sources: [
      { label: "Final report of the U.S. scientific team", publisher: "U.S. Geological Survey", url: "https://www.usgs.gov/publications/21-august-1986-lake-nyos-gas-disaster-cameroon-final-report-united-states-scientific", kind: "Official report" },
      { label: "Degassing Lakes Nyos and Monoun", publisher: "U.S. Geological Survey / PNAS", url: "https://www.usgs.gov/publications/degassing-lakes-nyos-and-monoun-defusing-certain-disaster", kind: "Research" },
      { label: "Lake Nyos degassing photograph and description", publisher: "U.S. Geological Survey", url: "https://www.usgs.gov/media/images/exploding-lakes-cameroon", kind: "Public record" },
    ],
  },
  "therac-25": {
    label: "Feature",
    updated: "19 Sep 2026",
    location: "United States and Canada",
    standfirst: "The Therac-25 accidents are often reduced to a software bug. The fuller record is about a safety architecture that placed too much trust in code, weak incident reporting, and a manufacturer that initially treated each injury as an isolated anomaly.",
    timeline: [
      { date: "1982", event: "The Therac-25 enters clinical use as a computer-controlled radiation therapy system." },
      { date: "1985–1987", event: "Six known accidents expose patients to massive radiation overdoses." },
      { date: "1986", event: "Regulators and hospitals connect incidents that had previously appeared separate." },
      { date: "1993", event: "Nancy Leveson and Clark Turner publish a detailed engineering investigation of the accidents." },
    ],
    sections: [
      {
        heading: "Software inherited authority",
        paragraphs: [
          "Earlier machines in the Therac family combined computer control with independent hardware interlocks. In the Therac-25, more safety responsibility moved into software. That choice was not inherently reckless, but it changed the consequences of software failure: code was no longer merely assisting an operator; it was helping determine whether a hazardous beam configuration could exist.",
          "Operators worked through a text interface and often entered treatment data quickly. Particular sequences of rapid editing could leave parts of the system in inconsistent states. The machine could display cryptic malfunction messages while delivering far more radiation than intended, and the interface did not give operators a clear account of what had physically happened.",
        ],
      },
      {
        heading: "Incidents looked local until they did not",
        paragraphs: [
          "Patients reported sudden heat or pain. Hospitals contacted the manufacturer, but early incidents were not immediately assembled into a convincing system-wide pattern. A machine might be checked and returned to service because technicians could not reproduce the exact sequence that produced the failure.",
          "This fragmentation mattered. Safety-critical systems generate weak signals before they generate a recognized pattern: an unexplained message, a patient report, an operator's unusual observation. If those signals remain inside individual organizations, each event can be dismissed as impossible because no one sees the accumulating record.",
        ],
      },
      {
        heading: "Why the case still travels",
        paragraphs: [
          "Leveson and Turner's investigation did not argue that software should never control dangerous equipment. It showed why software reliability alone is not a complete safety argument. Safety depends on the surrounding design: independent constraints, understandable interfaces, incident reporting, testing assumptions and the ability to observe the physical state of the system.",
          "The enduring lesson is organizational. A rare software state became lethal because design decisions, operator feedback and institutional communication aligned in the wrong direction. The bug mattered, but the system that allowed the bug to carry authority mattered more.",
        ],
      },
    ],
    sources: [
      { label: "An Investigation of the Therac-25 Accidents", publisher: "IEEE Computer", url: "https://publications.computer.org/computer-magazine/from-the-archives-computers-legacy/", kind: "Research" },
      { label: "The Therac-25: 30 Years Later", publisher: "IEEE Computer Society", url: "https://publications.computer.org/computer-magazine/2017/11/17/therac-25-30-years-later/", kind: "Research" },
      { label: "Therac-25 machine photograph", publisher: "Wikimedia Commons / public domain", url: "https://commons.wikimedia.org/wiki/File:Therac_25.png", kind: "Public record" },
    ],
  },
  "aral-sea": {
    label: "Feature",
    updated: "19 Sep 2026",
    location: "Kazakhstan and Uzbekistan",
    standfirst: "The Aral Sea did not simply dry up. Rivers were redirected to serve an agricultural system, costs were displaced onto fishing towns and public health, and later recovery divided the former sea into sharply different futures.",
    timeline: [
      { date: "1960s", event: "Large-scale irrigation diversions sharply reduce inflow from the Amu Darya and Syr Darya." },
      { date: "1980s", event: "The retreating shoreline becomes visible in satellite records and the fishing economy collapses." },
      { date: "2005", event: "The Kok-Aral Dam is completed, helping stabilize and raise the North Aral Sea." },
      { date: "2014", event: "Satellite observations show the eastern basin of the South Aral Sea completely dry." },
    ],
    sections: [
      {
        heading: "A water budget rewritten by policy",
        paragraphs: [
          "The Aral Sea is a terminal lake: water arrives through rivers and leaves mainly through evaporation. Its level therefore depends on continued inflow. Soviet irrigation projects redirected the Amu Darya and Syr Darya to expand cotton and rice production across an arid region where canals lost large quantities of water along the way.",
          "The decision produced agricultural output far from the shoreline while the environmental cost accumulated in the lake. As inflow fell, salinity rose and fish populations collapsed. Ports ended up kilometres from water. What looked like a natural desert scene was the downstream result of infrastructure and production targets.",
        ],
      },
      {
        heading: "The exposed lakebed became a new source",
        paragraphs: [
          "Retreat did not end at the water's edge. Wind moved salt and contaminated sediment from the exposed bed across settlements and farmland. The regional climate changed, livelihoods disappeared and communities inherited health and economic burdens from decisions made elsewhere in the system.",
          "Satellite imagery made the transformation unusually legible. Year after year, the same viewpoint recorded a body of water dividing and shrinking. The images are powerful because they convert a dispersed policy history into a visible outline, but the shoreline alone cannot show who benefited from the diversions or who absorbed the costs.",
        ],
      },
      {
        heading: "One sea, two trajectories",
        paragraphs: [
          "The Kok-Aral Dam helped retain Syr Darya water in the North Aral Sea. Water levels rose, salinity declined and some fishing returned. South of the dam, the larger South Aral continued to fragment and shrink. The contrast is evidence that decline was not simply inevitable, while also showing the limits of a project designed around one portion of a transboundary basin.",
          "The Aral record is therefore not a single before-and-after tragedy. It is a continuing experiment in allocation, engineering and political geography. Restoration is possible at meaningful scales, but every recovery plan also decides which shoreline, river and community will receive water first.",
        ],
      },
    ],
    sources: [
      { label: "Aral Sea, Kazakhstan and Uzbekistan — Earthshots", publisher: "U.S. Geological Survey EROS", url: "https://eros.usgs.gov/earthshots/aral-sea-kazakhstan-and-uzbekistan", kind: "Official report" },
      { label: "Aral Sea water resources satellite comparison", publisher: "U.S. Geological Survey", url: "https://pubs.usgs.gov/unnumbered/70048798/report.pdf", kind: "Primary document" },
      { label: "World of Change: Shrinking Aral Sea", publisher: "NASA Earth Observatory", url: "https://earthobservatory.nasa.gov/world-of-change/aral-sea", kind: "Research" },
    ],
  },
  "minamata-food-chain": {
    label: "Feature",
    updated: "19 Sep 2026",
    location: "Minamata, Japan",
    standfirst: "Minamata disease was recognized through sick families and animals before institutions accepted the industrial pathway. The delay between evidence and action became part of the harm.",
    timeline: [
      { date: "1956", event: "Minamata disease is officially identified after patients with severe neurological symptoms are reported." },
      { date: "1959", event: "Researchers present strong evidence connecting organic mercury and factory effluent to the disease." },
      { date: "1968", event: "Japan's government formally concludes that industrial methylmercury caused Minamata disease." },
      { date: "2013", event: "The Minamata Convention on Mercury is adopted as a global treaty." },
    ],
    sections: [
      {
        heading: "The food chain carried the evidence",
        paragraphs: [
          "Methylmercury released during acetaldehyde production entered Minamata Bay, accumulated in fish and shellfish and became more concentrated as it moved through the food web. People who depended on seafood received repeated exposure without seeing, tasting or smelling the contaminant.",
          "The disease damaged the central nervous system. Patients experienced numbness, loss of coordination, impaired vision and hearing, convulsions and, in severe cases, death. Congenital disease showed that exposure could also reach children before birth. Families encountered not only illness but disbelief, stigma and economic isolation.",
        ],
      },
      {
        heading: "Knowledge did not automatically become protection",
        paragraphs: [
          "Researchers developed evidence for organic mercury contamination while fishing communities continued to face exposure. The question was not simply whether a scientific hypothesis existed. It was whether institutions were willing to impose restrictions, identify a polluter and accept the economic consequences of stopping production.",
          "Japan's National Institute for Minamata Disease later described the delay as a central lesson: measures to prevent health damage must not wait for every scientific dispute to close. When the potential harm is severe and exposure is continuing, temporary protection and clear public communication are themselves evidence-based actions.",
        ],
      },
      {
        heading: "A name that became a treaty",
        paragraphs: [
          "Minamata eventually became shorthand for industrial mercury poisoning, but commemoration can flatten the people who fought for recognition and compensation. Certification rules, court cases and cleanup continued for decades. The official record grew because patients and families refused to let uncertainty be used as an endpoint.",
          "The global Minamata Convention carries the city's name into international mercury controls. That legacy is deliberately uncomfortable: a place marked by preventable harm is used to remind governments that managing a toxic substance requires attention to its full life cycle, not only the point where industry first uses it.",
        ],
      },
    ],
    sources: [
      { label: "Lessons from Minamata Disease and Mercury Management in Japan", publisher: "Ministry of the Environment, Japan", url: "https://www.env.go.jp/chemi/tmms/pr-m/mat01/en_full.pdf", kind: "Official report" },
      { label: "What can be learned from the Minamata disease experience", publisher: "National Institute for Minamata Disease", url: "https://nimd.env.go.jp/english/research/result/study_group_report/", kind: "Research" },
      { label: "Lessons from Minamata disease", publisher: "National Institute for Minamata Disease", url: "https://nimd.env.go.jp/english/qa/lessons/", kind: "Official report" },
    ],
  },
  "move-bombing": {
    label: "Feature",
    updated: "19 Sep 2026",
    location: "Philadelphia, Pennsylvania",
    standfirst: "On 13 May 1985, a police operation ended with an explosive dropped on a row house and a fire that destroyed a neighbourhood block. The official investigations are also a record of how institutions described their own decisions afterward.",
    timeline: [
      { date: "13 May 1985 · morning", event: "Police begin an operation at the MOVE house on Osage Avenue." },
      { date: "13 May · evening", event: "A police helicopter drops an explosive device on the roof bunker." },
      { date: "Overnight", event: "The fire spreads through the block. Eleven people die and 61 homes are destroyed." },
      { date: "1986 onward", event: "A city commission, litigation and later investigations examine the operation and its aftermath." },
    ],
    sections: [
      {
        heading: "A police action became an urban fire",
        paragraphs: [
          "The confrontation followed years of conflict between Philadelphia authorities and MOVE, a Black liberation and communal organization. Police arrived with arrest warrants and used water cannons, tear gas and gunfire against the fortified row house. By evening, officials approved dropping an explosive device onto a rooftop bunker.",
          "The explosion ignited a fire. Officials allowed it to burn for a period because the bunker was viewed as a tactical obstacle. The fire escaped the target property and moved through attached houses. Eleven people inside the MOVE home died, including five children, and 61 homes were destroyed.",
        ],
      },
      {
        heading: "The scale came from the setting",
        paragraphs: [
          "A row-house block is a connected system: walls, roofs and narrow spaces transmit fire across property lines. Decisions made as part of an armed operation therefore carried consequences for residents who were not the target of the warrants. The city had deployed force inside the physical structure of a neighbourhood.",
          "The Philadelphia Special Investigation Commission later called the decision to use the bomb unconscionable. Its work recorded failures of planning, command and political judgment, but the existence of a report did not settle responsibility. Rebuilding problems and disputes over accountability continued long after the fire.",
        ],
      },
      {
        heading: "The record kept reopening",
        paragraphs: [
          "Decades later, revelations about the handling of victims' remains produced new city investigations. That history matters because it shows that an event's archive does not end when the immediate inquiry closes. Evidence can be mishandled, institutional custody can become opaque and families can be forced to demand answers more than once.",
          "The MOVE bombing resists a single category. It was a police operation, a political confrontation, a mass-casualty fire and the destruction of a residential block. Keeping those descriptions together is essential; separating them makes each institution's part appear smaller than the event that residents experienced.",
        ],
      },
    ],
    sources: [
      { label: "MOVE bombing documents", publisher: "City of Philadelphia", url: "https://www.phila.gov/documents/move-bombing-documents/", kind: "Primary document" },
      { label: "Independent report on the handling of MOVE victims' remains", publisher: "City of Philadelphia", url: "https://www.phila.gov/documents/independent-report-on-the-history-and-handling-of-move-victims-remains/", kind: "Official report" },
      { label: "Philadelphia Special Investigation Commission archive", publisher: "City of Philadelphia", url: "https://www.phila.gov/documents/move-bombing-documents/", kind: "Official report" },
    ],
  },
};

export function getFeature(slug: string) {
  return features[slug];
}

export function getReadingLabel(slug: string) {
  const feature = getFeature(slug);
  if (!feature) return "Brief · 2 min";
  const words = [feature.standfirst, ...feature.sections.flatMap((section) => section.paragraphs)]
    .join(" ")
    .trim()
    .split(/\s+/).length;
  return `Feature · ${Math.max(4, Math.ceil(words / 210))} min`;
}
