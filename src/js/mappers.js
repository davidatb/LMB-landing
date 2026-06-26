import { formatPct, normalizeDivisionName } from "./formatters.js";

const TEAM_DIVISION_BY_NAME = new Map([
  ["toros", "Zona Norte"],
  ["charros", "Zona Norte"],
  ["caliente", "Zona Norte"],
  ["acereros", "Zona Norte"],
  ["sultanes", "Zona Norte"],
  ["rieleros", "Zona Norte"],
  ["algodoneros", "Zona Norte"],
  ["tecos", "Zona Norte"],
  ["tecolotes", "Zona Norte"],
  ["saraperos", "Zona Norte"],
  ["dorados", "Zona Norte"],
  ["diablos", "Zona Sur"],
  ["diablos rojos", "Zona Sur"],
  ["olmecas", "Zona Sur"],
  ["guerreros", "Zona Sur"],
  ["bravos", "Zona Sur"],
  ["pericos", "Zona Sur"],
  ["tigres", "Zona Sur"],
  ["conspiradores", "Zona Sur"],
  ["piratas", "Zona Sur"],
  ["el aguila", "Zona Sur"],
  ["leones", "Zona Sur"],
]);

const DIVISION_ORDER = ["Zona Norte", "Zona Sur"];

function normalizeTeamKey(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferDivisionName(team = {}) {
  const candidates = [team.teamName, team.clubName, team.name, team.abbreviation].filter(Boolean);

  for (const candidate of candidates) {
    const key = normalizeTeamKey(candidate);

    for (const [teamName, divisionName] of TEAM_DIVISION_BY_NAME.entries()) {
      if (key.includes(teamName)) {
        return divisionName;
      }
    }
  }

  return "División";
}

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function getPct(wins, losses, explicitPct) {
  const numericPct = Number(explicitPct);

  if (Number.isFinite(numericPct)) {
    return numericPct;
  }

  const games = toNumber(wins) + toNumber(losses);
  return games > 0 ? toNumber(wins) / games : 0;
}

function getSplit(teamRecord, keywords) {
  const splitRecords = teamRecord.records?.splitRecords || [];

  return splitRecords.find((split) => {
    const type = String(split.type || "").toLowerCase();
    return keywords.some((keyword) => type.includes(keyword.toLowerCase()));
  });
}

function mapSplit(teamRecord, label, keywords) {
  const split = getSplit(teamRecord, keywords);

  if (!split) {
    return {
      label,
      wins: 0,
      losses: 0,
      pct: 0,
      available: false,
    };
  }

  const wins = toNumber(split.wins);
  const losses = toNumber(split.losses);

  return {
    label,
    wins,
    losses,
    pct: getPct(wins, losses, split.pct),
    available: true,
  };
}

function mapStreak(streak = {}) {
  const code = String(streak.streakCode || "").trim();
  const number = toNumber(streak.streakNumber);
  const type = String(streak.streakType || "").toLowerCase();
  const normalizedCode = code.toUpperCase();

  const isWin = normalizedCode.startsWith("W") || type.includes("win");
  const isLoss = normalizedCode.startsWith("L") || type.includes("loss");
  const count = number || toNumber(normalizedCode.replace(/\D/g, ""), 0);

  if (!count || (!isWin && !isLoss)) {
    return {
      label: "Racha no disponible",
      type: "neutral",
      count: 0,
    };
  }

  return {
    label: `${isWin ? "Racha ganadora" : "Racha perdedora"}: ${count} ${count === 1 ? "juego" : "juegos"}`,
    type: isWin ? "win" : "loss",
    count,
  };
}

function mapTeamRecord(teamRecord, standingsRecord) {
  const wins = toNumber(teamRecord.wins);
  const losses = toNumber(teamRecord.losses);
  const runsScored = toNumber(teamRecord.runsScored);
  const runsAllowed = toNumber(teamRecord.runsAllowed);
  const runDifferential = toNumber(teamRecord.runDifferential, runsScored - runsAllowed);
  const pct = getPct(wins, losses, teamRecord.winningPercentage);
  const rawDivisionName = normalizeDivisionName(standingsRecord.division?.name || standingsRecord.division?.nameShort);
  const fallbackDivisionName = inferDivisionName(teamRecord.team);
  const divisionName = DIVISION_ORDER.includes(rawDivisionName) ? rawDivisionName : fallbackDivisionName;
  const lastTen = mapSplit(teamRecord, "Últimos 10", ["lastTen", "last ten"]);
  const home = mapSplit(teamRecord, "Casa", ["home"]);
  const away = mapSplit(teamRecord, "Visitante", ["away"]);
  const day = mapSplit(teamRecord, "Día", ["day"]);
  const night = mapSplit(teamRecord, "Noche", ["night"]);

  const splits = [
    {
      label: "Temporada",
      wins,
      losses,
      pct,
      available: true,
    },
    home,
    away,
    day,
    night,
  ].filter((split) => split.available && split.wins + split.losses > 0);

  return {
    id: String(teamRecord.team?.id || teamRecord.team?.name || "team-unknown"),
    name: teamRecord.team?.name || "Equipo",
    shortName: teamRecord.team?.teamName || teamRecord.team?.name || "Equipo",
    clubName: teamRecord.team?.clubName || "",
    abbreviation: teamRecord.team?.abbreviation || "",
    divisionName,
    divisionId: String(standingsRecord.division?.id || divisionName),
    wins,
    losses,
    pct,
    pctLabel: formatPct(pct),
    gamesPlayed: wins + losses,
    divisionRank: toNumber(teamRecord.divisionRank),
    leagueRank: toNumber(teamRecord.leagueRank),
    gamesBack: teamRecord.gamesBack || "0.0",
    wildCardGamesBack: teamRecord.wildCardGamesBack || "0.0",
    runsScored,
    runsAllowed,
    runDifferential,
    lastTen,
    home,
    away,
    day,
    night,
    splits,
    streak: mapStreak(teamRecord.streak),
  };
}

export function mapStandings(apiData) {
  const records = Array.isArray(apiData.records) ? apiData.records : [];
  const teams = records.flatMap((standingsRecord) => {
    const teamRecords = standingsRecord.teamRecords || [];
    return teamRecords.map((teamRecord) => mapTeamRecord(teamRecord, standingsRecord));
  });

  const sortedTeams = teams.sort((teamA, teamB) => {
    if (teamA.divisionName !== teamB.divisionName) {
      return teamA.divisionName.localeCompare(teamB.divisionName, "es");
    }

    if (teamA.divisionRank && teamB.divisionRank) {
      return teamA.divisionRank - teamB.divisionRank;
    }

    return teamB.pct - teamA.pct;
  });

  const divisions = Array.from(
    new Map(
      sortedTeams.map((team) => [
        team.divisionName,
        {
          id: team.divisionName,
          name: team.divisionName,
          teams: sortedTeams.filter((candidate) => candidate.divisionName === team.divisionName),
        },
      ]),
    ).values(),
  ).sort((divisionA, divisionB) => {
    const orderA = DIVISION_ORDER.indexOf(divisionA.name);
    const orderB = DIVISION_ORDER.indexOf(divisionB.name);

    if (orderA !== -1 || orderB !== -1) {
      return (orderA === -1 ? 99 : orderA) - (orderB === -1 ? 99 : orderB);
    }

    return divisionA.name.localeCompare(divisionB.name, "es");
  });

  const leader = [...sortedTeams].sort((teamA, teamB) => {
    if (teamA.leagueRank && teamB.leagueRank) {
      return teamA.leagueRank - teamB.leagueRank;
    }

    return teamB.pct - teamA.pct;
  })[0];

  return {
    teams: sortedTeams,
    divisions,
    leader,
  };
}
