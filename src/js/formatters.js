export function formatRecord(wins = 0, losses = 0) {
  return `${Number(wins) || 0}-${Number(losses) || 0}`;
}

export function formatPct(value) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return ".000";
  }

  return numeric.toFixed(3).replace(/^0/, "");
}

export function formatPercent(value) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return "0%";
  }

  return `${Math.round(numeric * 100)}%`;
}

export function formatSignedNumber(value) {
  const numeric = Number(value) || 0;

  if (numeric > 0) {
    return `+${numeric}`;
  }

  return String(numeric);
}

export function clampPercent(value) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numeric * 100)));
}

export function normalizeDivisionName(name = "") {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("north") || lowerName.includes("norte")) {
    return "Zona Norte";
  }

  if (lowerName.includes("south") || lowerName.includes("sur")) {
    return "Zona Sur";
  }

  return name || "División";
}
