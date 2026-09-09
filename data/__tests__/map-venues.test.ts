import { findMapVenueByName, MAP_SIZE, MAP_VENUES } from "@/data/map-venues";

describe("map venues (index.html)", () => {
  it("carrega os 35 locais do mapa antigo", () => {
    expect(MAP_VENUES).toHaveLength(35);
    expect(MAP_SIZE).toEqual({ w: 1942.79, h: 1354.94 });
  });

  it("encontra local ignorando acentos e caixa", () => {
    expect(findMapVenueByName("palco petrobras")?.n).toBe(30);
    expect(findMapVenueByName("Casa Futuros Possiveis")?.n).toBe(6);
  });
});
