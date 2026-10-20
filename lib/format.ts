const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const monthFmt = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });

export function formatDate(iso: string) {
  return dateFmt.format(new Date(iso + "T00:00:00Z"));
}

export function formatRange(start: string | null, end: string | null) {
  if (start && end && start !== end) return `${formatDate(start)} — ${formatDate(end)}`;
  if (start) return formatDate(start);
  if (end) return formatDate(end);
  return "";
}

export function formatMonth(iso: string | null) {
  return iso ? monthFmt.format(new Date(iso + "T00:00:00Z")) : "";
}

export function tripDays(start: string | null, end: string | null) {
  if (!start || !end) return null;
  const days = Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1;
  return days > 0 ? days : null;
}

export function slugify(text: string) {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "viagem"
  );
}

export function tripSlug(title: string, id: string) {
  return `${slugify(title)}-${id.slice(0, 6)}`;
}
