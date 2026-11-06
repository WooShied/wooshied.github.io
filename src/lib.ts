const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Oct 2025" -> months since year 0; "Present" -> current month. */
export function monthIndex(s: string): number {
  if (s === "Present") {
    const d = new Date();
    return d.getFullYear() * 12 + d.getMonth();
  }
  const [m, y] = s.split(" ");
  return Number(y) * 12 + Math.max(0, MONTHS.indexOf(m));
}

export function layerColor(id: string, layers: { id: string; color: string }[]): string {
  return layers.find((l) => l.id === id)?.color ?? "currentColor";
}
