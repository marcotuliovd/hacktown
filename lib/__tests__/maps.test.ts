import { buildMapsUrl, resolveMapsUrl } from "@/lib/maps";
import type { HacktownVenue } from "@/types/event";

const venue = (overrides: Partial<HacktownVenue> = {}): HacktownVenue => ({
  name: "Palco Petrobras",
  area: null,
  latitude: null,
  longitude: null,
  maps_url: null,
  ...overrides,
});

describe("buildMapsUrl", () => {
  it("prioriza maps_url da API", () => {
    expect(
      buildMapsUrl(
        venue({ maps_url: "https://maps.google.com/?q=custom" }),
      ),
    ).toBe("https://maps.google.com/?q=custom");
  });

  it("usa lat/lng no deep link do Google Maps", () => {
    expect(
      buildMapsUrl(venue({ latitude: -22.252, longitude: -45.703 })),
    ).toBe("https://www.google.com/maps/search/?api=1&query=-22.252,-45.703");
  });

  it("cai para busca por nome + Santa Rita do Sapucaí", () => {
    expect(buildMapsUrl(venue())).toBe(
      "https://www.google.com/maps/search/?api=1&query=Palco%20Petrobras%2C%20Santa%20Rita%20do%20Sapuca%C3%AD",
    );
  });

  it("retorna null sem venue e sem nome", () => {
    expect(buildMapsUrl(null)).toBeNull();
  });
});

describe("resolveMapsUrl", () => {
  it("casa o nome do venue com um pin do mapa antigo", () => {
    const url = resolveMapsUrl(venue({ name: "palco petrobras" }));
    expect(url).toContain("Palco");
    expect(url).toContain("Santa%20Rita");
  });
});
