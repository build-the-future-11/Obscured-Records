const monthNumbers: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

export function toIsoEditorialDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const match = value.match(/^(\d{1,2}) ([A-Z][a-z]{2}) (\d{4})$/);
  if (!match) throw new Error(`Unsupported editorial date: ${value}`);

  const month = monthNumbers[match[2]];
  if (!month) throw new Error(`Unsupported editorial month: ${match[2]}`);

  return `${match[3]}-${month}-${match[1].padStart(2, "0")}`;
}

export function toRssEditorialDate(value: string): string {
  const iso = toIsoEditorialDate(value);
  return new Date(`${iso}T00:00:00.000Z`).toUTCString();
}
