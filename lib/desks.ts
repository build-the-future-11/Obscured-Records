export type EditorialDesk = {
  slug: "editorial" | "originals" | "investigations";
  number: string;
  name: string;
  label: string;
  thesis: string;
  description: string;
  mandate: readonly string[];
  questions: readonly string[];
  archiveSlugs: readonly string[];
};

export const editorialDesks: readonly EditorialDesk[] = [
  {
    slug: "editorial",
    number: "01",
    name: "Editorial",
    label: "Context / Analysis / Public understanding",
    thesis: "Make the important story legible without making it smaller.",
    description: "The Editorial desk adds context to consequential events, tests the assumptions around them and builds clear, source-led explanations for readers who want more than a headline.",
    mandate: ["Explain the system around the event", "Separate verified fact from interpretation", "Make complexity useful without flattening it"],
    questions: ["What does the existing coverage assume?", "Which context changes how the story is understood?", "What can the source record actually support?"],
    archiveSlugs: ["air-france-8969", "lake-nyos", "minamata-food-chain", "aral-sea"],
  },
  {
    slug: "originals",
    number: "02",
    name: "Originals",
    label: "Features / Firsthand questions / New frames",
    thesis: "Begin with a question that has not received a good enough answer.",
    description: "Originals develops distinctive features from primary material, reporting and a clear editorial premise. The desk is designed for work that needs room to find its own form.",
    mandate: ["Start from an overlooked reporting question", "Build around people, documents and consequences", "Choose the form the evidence needs"],
    questions: ["What is new about the reporting or frame?", "Whose knowledge is missing from the record?", "What would make this worth a reader’s time?"],
    archiveSlugs: ["fedex-flight-705", "goiania-blue-powder", "therac-25", "wirecard-missing-billions"],
  },
  {
    slug: "investigations",
    number: "03",
    name: "Investigations",
    label: "Documents / Accountability / Systems",
    thesis: "Follow the record until the mechanism of failure becomes visible.",
    description: "The Investigations desk pursues evidence-led accountability reporting through documents, data, source development and careful claims that can withstand scrutiny.",
    mandate: ["Define the accountability question", "Preserve a reviewable evidence trail", "Report what is known, disputed and still missing"],
    questions: ["Who had responsibility and what did they know?", "Which record could confirm or falsify the claim?", "Who bears the consequence of the failure?"],
    archiveSlugs: ["wirecard-missing-billions", "satyam-confession", "parmalat-fictional-cash", "olympus-two-decade-coverup"],
  },
] as const;

export const deskSlugs = editorialDesks.map((desk) => desk.slug);

export function getDesk(slug: string) {
  return editorialDesks.find((desk) => desk.slug === slug);
}
