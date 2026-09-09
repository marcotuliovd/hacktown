export interface MapVenue {
  n: number;
  nome: string;
  obs: string;
  x: number;
  y: number;
  xn: number;
  yn: number;
  lat: number | null;
  lng: number | null;
}

/** Dimensões do SVG extraído de `index.html` (`#mapsvg`). */
export const MAP_SIZE = {
  w: 1942.79,
  h: 1354.94,
} as const;

/**
 * Locais extraídos de `index.html` (mapa do site antigo, `window.__DATA__.locais`).
 * Coordenadas x/y são posições no SVG; lat/lng ainda não foram preenchidos no mapa.
 */
export const MAP_VENUES: MapVenue[] = [
  { n: 1, nome: "Brechó Diferentona", obs: "", x: 902.2, y: 764, xn: 0.46438, yn: 0.56387, lat: null, lng: null },
  { n: 2, nome: "Casa AWS", obs: "", x: 1513.9, y: 1053, xn: 0.77924, yn: 0.77713, lat: null, lng: null },
  { n: 3, nome: "Casa Conectada by Claro", obs: "", x: 1544.7, y: 1109.2, xn: 0.79511, yn: 0.81861, lat: null, lng: null },
  { n: 4, nome: "Casa Copasa", obs: "", x: 1576.7, y: 1134.4, xn: 0.81157, yn: 0.83725, lat: null, lng: null },
  { n: 5, nome: "Casa do Pi", obs: "", x: 852.4, y: 558.3, xn: 0.43873, yn: 0.41208, lat: null, lng: null },
  { n: 6, nome: "Casa Futuros Possíveis", obs: "", x: 602.1, y: 413.2, xn: 0.30994, yn: 0.30495, lat: null, lng: null },
  { n: 7, nome: "Casa HackTown", obs: "", x: 1662.3, y: 1141.9, xn: 0.85561, yn: 0.84278, lat: null, lng: null },
  { n: 8, nome: "Casa MFM", obs: "", x: 1629.4, y: 1125.2, xn: 0.83872, yn: 0.83043, lat: null, lng: null },
  { n: 9, nome: "Cine Teatro", obs: "", x: 700.9, y: 682.8, xn: 0.36078, yn: 0.5039, lat: null, lng: null },
  { n: 10, nome: "Coreto", obs: "", x: 758.1, y: 620.1, xn: 0.39021, yn: 0.45764, lat: null, lng: null },
  { n: 11, nome: "Credenciamento", obs: "", x: 1731.6, y: 1186.6, xn: 0.89131, yn: 0.87576, lat: null, lng: null },
  { n: 12, nome: "Espaço Cidade Criativa Cidade Feliz", obs: "", x: 717.8, y: 808.8, xn: 0.36948, yn: 0.59693, lat: null, lng: null },
  { n: 13, nome: "Espaço Festa da Luz", obs: "", x: 432.9, y: 841, xn: 0.22285, yn: 0.62069, lat: null, lng: null },
  { n: 14, nome: "ETE", obs: "", x: 860.2, y: 1093.7, xn: 0.44277, yn: 0.80719, lat: null, lng: null },
  { n: 15, nome: "FAI/HACKTOWNZINHO/HACKEDU", obs: "", x: 963.9, y: 1346, xn: 0.49614, yn: 0.99341, lat: null, lng: null },
  { n: 16, nome: "Feira da Mantiqueira", obs: "", x: 790, y: 793.5, xn: 0.40664, yn: 0.5856, lat: null, lng: null },
  { n: 17, nome: "Feira de Artesanato", obs: "", x: 842.7, y: 1171.4, xn: 0.43377, yn: 0.8645, lat: null, lng: null },
  { n: 18, nome: "Grandpa Joel's", obs: "", x: 641.3, y: 499.9, xn: 0.33007, yn: 0.36896, lat: null, lng: null },
  { n: 19, nome: "HackBus Santa Cruz", obs: "", x: 812.3, y: 963.4, xn: 0.41813, yn: 0.71103, lat: null, lng: null },
  { n: 20, nome: "HackStore", obs: "", x: 1770.3, y: 1171.3, xn: 0.91123, yn: 0.86443, lat: null, lng: null },
  { n: 21, nome: "HackStore Mantiqueira", obs: "", x: 724.4, y: 842.5, xn: 0.37286, yn: 0.6218, lat: null, lng: null },
  { n: 22, nome: "HackTown Startups", obs: "", x: 1731.6, y: 1149.5, xn: 0.89127, yn: 0.84836, lat: null, lng: null },
  { n: 23, nome: "Inatel", obs: "", x: 1671.8, y: 1183.9, xn: 0.86054, yn: 0.87376, lat: null, lng: null },
  { n: 24, nome: "Maçonaria", obs: "", x: 586.9, y: 558.1, xn: 0.30211, yn: 0.41187, lat: null, lng: null },
  { n: 25, nome: "Ovelha Negra", obs: "", x: 973.6, y: 683.5, xn: 0.50113, yn: 0.50442, lat: null, lng: null },
  { n: 26, nome: "Palco 360", obs: "", x: 814.6, y: 767, xn: 0.41928, yn: 0.56609, lat: null, lng: null },
  { n: 27, nome: "Palco Beco do Saci", obs: "", x: 755.1, y: 829.7, xn: 0.38869, yn: 0.61237, lat: null, lng: null },
  { n: 28, nome: "Palco Elemento", obs: "", x: 870.4, y: 1285.1, xn: 0.44802, yn: 0.94844, lat: null, lng: null },
  { n: 29, nome: "Palco Fecomércio/Sesc/Senac", obs: "", x: 932.7, y: 1057.4, xn: 0.48009, yn: 0.78039, lat: null, lng: null },
  { n: 30, nome: "Palco Petrobras", obs: "", x: 762.8, y: 777.6, xn: 0.39261, yn: 0.57387, lat: null, lng: null },
  { n: 31, nome: "Posto Médico/Ginásio Alcidão", obs: "", x: 768.6, y: 886.7, xn: 0.3956, yn: 0.65441, lat: null, lng: null },
  { n: 32, nome: "Sala Bebold", obs: "", x: 829.2, y: 1044.7, xn: 0.42678, yn: 0.77103, lat: null, lng: null },
  { n: 33, nome: "Shuttle Stellantis ETE", obs: "", x: 868.7, y: 1133.5, xn: 0.44712, yn: 0.83656, lat: null, lng: null },
  { n: 34, nome: "Shuttle Stellantis Inatel", obs: "", x: 1644.5, y: 1223.3, xn: 0.84647, yn: 0.90284, lat: null, lng: null },
  { n: 35, nome: "Undertown", obs: "", x: 934.2, y: 659.4, xn: 0.48085, yn: 0.48663, lat: null, lng: null },
];

export function normalizeVenueName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function findMapVenueByName(name: string): MapVenue | undefined {
  const needle = normalizeVenueName(name);
  if (!needle) return undefined;
  return (
    MAP_VENUES.find((v) => normalizeVenueName(v.nome) === needle) ??
    MAP_VENUES.find((v) => {
      const n = normalizeVenueName(v.nome);
      return n.includes(needle) || needle.includes(n);
    })
  );
}
