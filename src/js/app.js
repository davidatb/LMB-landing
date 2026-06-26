import { getStandings } from "./api.js";
import { animateBars, animateNumber } from "./animations.js";
import {
  clampPercent,
  formatPct,
  formatPercent,
  formatRecord,
  formatSignedNumber,
} from "./formatters.js";
import { mapStandings } from "./mappers.js";

const elements = {
  dataStatus: document.querySelector("#data-status"),
  loadingState: document.querySelector("#loading-state"),
  errorState: document.querySelector("#error-state"),
  retryButton: document.querySelector("#retry-button"),
  divisionToggle: document.querySelector("#division-toggle"),
  teamSelect: document.querySelector("#team-select"),
  teamChips: document.querySelector("#team-chips"),
  teamCard: document.querySelector("#team-card"),
  teamDivision: document.querySelector("#team-division"),
  teamName: document.querySelector("#team-name"),
  teamRank: document.querySelector("#team-rank"),
  teamRecord: document.querySelector("#team-record"),
  teamPct: document.querySelector("#team-pct"),
  teamStreak: document.querySelector("#team-streak"),
  teamContext: document.querySelector("#team-context"),
  lastTenRecord: document.querySelector("#last-ten-record"),
  lastTenDots: document.querySelector("#last-ten-dots"),
  lastTenNote: document.querySelector("#last-ten-note"),
  runDiff: document.querySelector("#run-diff"),
  runsScored: document.querySelector("#runs-scored"),
  runsAllowed: document.querySelector("#runs-allowed"),
  homeRecord: document.querySelector("#home-record"),
  homePct: document.querySelector("#home-pct"),
  awayRecord: document.querySelector("#away-record"),
  awayPct: document.querySelector("#away-pct"),
  splitBars: document.querySelector("#split-bars"),
  summaryList: document.querySelector("#summary-list"),
};

const state = {
  standings: null,
  selectedDivision: "all",
  selectedTeamId: null,
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function setStatus(label, modifier) {
  elements.dataStatus.textContent = label;
  elements.dataStatus.classList.remove("is-ready", "is-error");

  if (modifier) {
    elements.dataStatus.classList.add(modifier);
  }
}

function setViewMode(mode) {
  elements.loadingState.hidden = mode !== "loading";
  elements.errorState.hidden = mode !== "error";
  elements.teamCard.hidden = mode !== "ready";
}

function getVisibleTeams() {
  if (!state.standings) {
    return [];
  }

  if (state.selectedDivision === "all") {
    return state.standings.teams;
  }

  return state.standings.teams.filter((team) => team.divisionName === state.selectedDivision);
}

function getSelectedTeam() {
  if (!state.standings) {
    return null;
  }

  return state.standings.teams.find((team) => team.id === state.selectedTeamId) || state.standings.leader;
}

function renderDivisionToggle() {
  const divisions = state.standings?.divisions || [];
  const buttons = [
    {
      id: "all",
      name: "Todos",
    },
    ...divisions,
  ];

  elements.divisionToggle.innerHTML = buttons
    .map((division) => {
      const isActive = division.id === state.selectedDivision;

      return `
        <button
          class="division-toggle__button ${isActive ? "is-active" : ""}"
          type="button"
          data-division="${escapeAttribute(division.id)}"
          aria-selected="${isActive}"
          role="tab"
        >
          ${escapeHtml(division.name)}
        </button>
      `;
    })
    .join("");
}

function renderTeamControls() {
  const visibleTeams = getVisibleTeams();

  elements.teamSelect.disabled = false;
  elements.teamSelect.innerHTML = visibleTeams
    .map((team) => {
      const selected = team.id === state.selectedTeamId ? "selected" : "";
      return `<option value="${escapeAttribute(team.id)}" ${selected}>${escapeHtml(team.name)}</option>`;
    })
    .join("");

  elements.teamChips.innerHTML = visibleTeams
    .map((team) => {
      const isActive = team.id === state.selectedTeamId;
      const rankLabel = team.divisionRank ? `#${team.divisionRank}` : "";

      return `
        <button
          class="team-chips__button ${isActive ? "is-active" : ""}"
          type="button"
          data-team-id="${escapeAttribute(team.id)}"
          aria-pressed="${isActive}"
        >
          ${escapeHtml(`${rankLabel} ${team.shortName}`)}
        </button>
      `;
    })
    .join("");
}

function renderLastTen(team) {
  const lastTen = team.lastTen;
  const wins = lastTen.available ? lastTen.wins : 0;
  const losses = lastTen.available ? lastTen.losses : 0;

  elements.lastTenRecord.textContent = lastTen.available ? formatRecord(wins, losses) : "Sin datos";
  elements.lastTenDots.innerHTML = "";

  if (!lastTen.available) {
    elements.lastTenNote.textContent = "El API no devolvió balance de últimos 10 para este equipo.";
    return;
  }

  const dots = [
    ...Array.from({ length: wins }, () => "W"),
    ...Array.from({ length: losses }, () => "L"),
  ].slice(0, 10);

  elements.lastTenDots.innerHTML = dots
    .map(
      (result) => `
        <span class="form-dots__dot ${result === "W" ? "is-win" : "is-loss"}">${result}</span>
      `,
    )
    .join("");

  elements.lastTenNote.textContent = `${formatRecord(wins, losses)} en los últimos 10 juegos. Balance visual no cronológico.`;
}

function renderBars(team) {
  elements.splitBars.innerHTML = team.splits
    .map((split) => {
      const percent = clampPercent(split.pct);

      return `
        <div class="bar-row">
          <span class="bar-row__label">${escapeHtml(split.label)}</span>
          <span class="bar-row__track" aria-hidden="true">
            <span class="bar-row__fill" data-bar-value="${percent}"></span>
          </span>
          <span class="bar-row__value">${formatPercent(split.pct)}</span>
        </div>
      `;
    })
    .join("");

  animateBars(elements.splitBars);
}

function renderSummary(team) {
  const items = [
    ["Ranking liga", team.leagueRank ? `#${team.leagueRank}` : "Sin dato"],
    ["Juegos", String(team.gamesPlayed)],
    ["Ventaja / diferencia", team.gamesBack === "-" ? "0.0" : `${team.gamesBack} J`],
    ["Diferencial", formatSignedNumber(team.runDifferential)],
  ];

  elements.summaryList.innerHTML = items
    .map(
      ([label, value]) => `
        <div>
          <dt>${escapeHtml(label)}</dt>
          <dd>${escapeHtml(value)}</dd>
        </div>
      `,
    )
    .join("");
}

function renderTeamProfile() {
  const team = getSelectedTeam();

  if (!team) {
    return;
  }

  state.selectedTeamId = team.id;

  elements.teamDivision.textContent = team.divisionName;
  elements.teamName.textContent = team.shortName;
  elements.teamRank.textContent = `${team.divisionRank ? `#${team.divisionRank} división` : "Ranking divisional no disponible"} · ${team.leagueRank ? `#${team.leagueRank} liga` : "ranking liga no disponible"}`;
  elements.teamRecord.textContent = formatRecord(team.wins, team.losses);
  elements.teamPct.textContent = `PCT ${formatPct(team.pct)}`;
  elements.teamContext.textContent = `${team.name} · ${team.gamesPlayed} juegos registrados en temporada regular 2026.`;

  elements.teamStreak.className = "streak-pill";
  elements.teamStreak.textContent = team.streak.label;

  if (team.streak.type === "win") {
    elements.teamStreak.classList.add("is-win");
  }

  if (team.streak.type === "loss") {
    elements.teamStreak.classList.add("is-loss");
  }

  renderLastTen(team);

  animateNumber(elements.runDiff, team.runDifferential, {
    formatter: (value) => formatSignedNumber(Math.round(value)),
  });
  animateNumber(elements.runsScored, team.runsScored);
  animateNumber(elements.runsAllowed, team.runsAllowed);

  elements.homeRecord.textContent = team.home.available ? formatRecord(team.home.wins, team.home.losses) : "Sin datos";
  elements.homePct.textContent = team.home.available ? `PCT ${formatPct(team.home.pct)}` : "PCT .000";
  elements.awayRecord.textContent = team.away.available ? formatRecord(team.away.wins, team.away.losses) : "Sin datos";
  elements.awayPct.textContent = team.away.available ? `PCT ${formatPct(team.away.pct)}` : "PCT .000";

  renderBars(team);
  renderSummary(team);
  renderTeamControls();
}

function handleDivisionChange(event) {
  const button = event.target.closest("[data-division]");

  if (!button) {
    return;
  }

  state.selectedDivision = button.dataset.division;

  const visibleTeams = getVisibleTeams();

  if (!visibleTeams.some((team) => team.id === state.selectedTeamId)) {
    state.selectedTeamId = visibleTeams[0]?.id || state.standings.leader?.id;
  }

  renderDivisionToggle();
  renderTeamProfile();
}

function handleTeamSelect(event) {
  state.selectedTeamId = event.target.value;
  renderTeamProfile();
}

function handleTeamChipClick(event) {
  const button = event.target.closest("[data-team-id]");

  if (!button) {
    return;
  }

  state.selectedTeamId = button.dataset.teamId;
  renderTeamProfile();
}

async function loadStandings() {
  setViewMode("loading");
  setStatus("Cargando datos…");

  try {
    const apiData = await getStandings();
    state.standings = mapStandings(apiData);
    state.selectedTeamId = state.standings.leader?.id || state.standings.teams[0]?.id;
    state.selectedDivision = state.standings.leader?.divisionName || "all";

    renderDivisionToggle();
    renderTeamControls();
    renderTeamProfile();
    setViewMode("ready");
    setStatus("Datos actualizados", "is-ready");
  } catch (error) {
    console.error(error);
    setViewMode("error");
    setStatus("Error al cargar", "is-error");
  }
}

elements.divisionToggle.addEventListener("click", handleDivisionChange);
elements.teamSelect.addEventListener("change", handleTeamSelect);
elements.teamChips.addEventListener("click", handleTeamChipClick);
elements.retryButton.addEventListener("click", loadStandings);

loadStandings();
