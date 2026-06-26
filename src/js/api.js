const STANDINGS_URL = "https://statsapi.mlb.com/api/v1/standings?leagueId=125&season=2026";

export async function getStandings() {
  const response = await fetch(STANDINGS_URL, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Stats API responded with ${response.status}`);
  }

  return response.json();
}
