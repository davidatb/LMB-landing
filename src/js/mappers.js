import { formatPct, normalizeDivisionName } from "./formatters.js";

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
  const divisionName = normalizeDivisionName(standingsRecord.division?.name || standingsRecord.division?.nameShort);
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
  );

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
