const TEAM_LOGO_URLS = new Map([
  ["algodoneros", "https://d11rb39sj794dg.cloudfront.net/public/2024-04/Algodoneros.png"],
  ["tecos", "https://d11rb39sj794dg.cloudfront.net/public/2024-04/Tecolotes.png"],
  ["tecolotes", "https://d11rb39sj794dg.cloudfront.net/public/2024-04/Tecolotes.png"],
  ["acereros", "https://d11rb39sj794dg.cloudfront.net/public/2024-04/Acereros.png"],
  ["caliente", "https://d11rb39sj794dg.cloudfront.net/public/2025-03/caliente.png"],
  ["charros", "https://d11rb39sj794dg.cloudfront.net/public/2026-01/LOGO%20CH%20AZUL_1a1.png"],
  ["rieleros", "https://d11rb39sj794dg.cloudfront.net/public/2026-01/rieleros_azul.png"],
  ["saraperos", "https://d11rb39sj794dg.cloudfront.net/public/2024-04/Saraperos.png"],
  ["sultanes", "https://d11rb39sj794dg.cloudfront.net/public/2024-04/Sultanes.png"],
  ["toros", "https://d11rb39sj794dg.cloudfront.net/public/2024-04/Toros.png"],
  ["diablos rojos", "https://d11rb39sj794dg.cloudfront.net/public/2024-04/Diablos.png"],
  ["diablos", "https://d11rb39sj794dg.cloudfront.net/public/2024-04/Diablos.png"],
  ["el aguila", "https://d11rb39sj794dg.cloudfront.net/public/2025-05/veracruz.png"],
  ["veracruz", "https://d11rb39sj794dg.cloudfront.net/public/2025-05/veracruz.png"],
  ["guerreros", "https://d11rb39sj794dg.cloudfront.net/public/2024-04/Guerreros.png"],
  ["leones", "https://d11rb39sj794dg.cloudfront.net/public/2025-05/LOGO%20LEONES%202025.png"],
  ["pericos", "https://d11rb39sj794dg.cloudfront.net/public/2024-04/Pericos.png"],
  ["piratas", "https://d11rb39sj794dg.cloudfront.net/public/2024-04/Piratas.png"],
  ["tigres", "https://d11rb39sj794dg.cloudfront.net/public/2025-04/Tigres_2025.png"],
  ["bravos", "https://d11rb39sj794dg.cloudfront.net/public/2025-04/contactos%20Dimo%20fix.png"],
  ["olmecas", "https://d11rb39sj794dg.cloudfront.net/public/2026-03/olmecas_azul.png"],
  ["dorados", "https://d11rb39sj794dg.cloudfront.net/public/2024-04/Dorados1.png"],
  ["conspiradores", "https://d11rb39sj794dg.cloudfront.net/public/2024-04/Conspiradores.png"],
]);

function normalizeAssetKey(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getTeamLogo(team) {
  const candidates = [team?.shortName, team?.name, team?.clubName, team?.abbreviation].filter(Boolean);

  for (const candidate of candidates) {
    const key = normalizeAssetKey(candidate);

    for (const [teamName, logoUrl] of TEAM_LOGO_URLS.entries()) {
      if (key.includes(teamName)) {
        return logoUrl;
      }
    }
  }

  return "assets/images/lmb-logo.webp";
}
