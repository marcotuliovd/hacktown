import { EVENTS_PAGE_SIZE, fetchEventByIdFromApi, fetchEventsFromApi, normalizeEvent } from "@/services/api";

const samplePayload = {
  id: "9f5948e6-6d72-4d6b-af73-fce1b97dd238",
  title: "Saindo do lugar - práticas gentis para retomar o fôlego",
  description: "Uma prática de yoga e mindfulness.",
  event_date: "2026-09-03",
  start_time: "09:00:00",
  end_time: "10:00:00",
  age_rating: "Livre",
  activity_type: "Experiência",
  status: "publicado",
  guarda_chuva: false,
  is_evento_maior: false,
  image_url: null,
  parent_event_id: null,
  formato: "presencial",
  mediador: null,
  selo: null,
  registration_url: null,
  venue: {
    area: "ETE",
    name: "ETE - Ao lado da Bolha",
    latitude: null,
    maps_url: null,
    longitude: null,
  },
  event_tracks: [
    {
      tracks: {
        id: "3de0f154-c563-4b6d-8a03-188a5ec824e5",
        code: "17",
        name: "Saúde e Bem-Estar",
      },
    },
  ],
  event_speakers: [
    {
      speakers: {
        id: "888f251d-4bb9-4304-ac2f-350ee3842533",
        name: "Cinthia Costa",
        mini_bio: "TEDx Speaker",
        photo_url: "https://cdn.example/cinthia.jpg",
        cargo_empresa: "TEDx Speaker",
      },
    },
  ],
};

describe("normalizeEvent", () => {
  it("mapeia o payload real do Supabase", () => {
    const event = normalizeEvent(samplePayload);

    expect(event).toMatchObject({
      id: samplePayload.id,
      title: samplePayload.title,
      event_date: "2026-09-03",
      start_time: "09:00:00",
      end_time: "10:00:00",
      activity_type: "Experiência",
      age_rating: "Livre",
      venue: { name: "ETE - Ao lado da Bolha", area: "ETE", latitude: null },
      event_tracks: [
        { tracks: { name: "Saúde e Bem-Estar", code: "17" } },
      ],
      event_speakers: [
        { speakers: { name: "Cinthia Costa", cargo_empresa: "TEDx Speaker" } },
      ],
    });
  });

  it("descarta registros sem campos obrigatórios", () => {
    expect(normalizeEvent({ title: "Sem id" })).toBeNull();
  });
});

describe("fetchEventsFromApi", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
    };
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it("pagina com offset/limit quando a primeira página vem cheia", async () => {
    const fullPage = Array.from({ length: EVENTS_PAGE_SIZE }, (_, i) => ({
      ...samplePayload,
      id: `e-${i}`,
      title: `Evento ${i}`,
    }));
    const tail = [{ ...samplePayload, id: "tail", title: "Último" }];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(fullPage),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(tail),
      });

    const events = await fetchEventsFromApi();
    expect(events).toHaveLength(EVENTS_PAGE_SIZE + 1);
    expect(events[events.length - 1].id).toBe("tail");
    expect(global.fetch).toHaveBeenCalledTimes(2);

    const firstUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    const secondUrl = (global.fetch as jest.Mock).mock.calls[1][0] as string;
    expect(firstUrl).toContain("offset=0");
    expect(firstUrl).toContain("limit=1000");
    expect(firstUrl).toContain("status=eq.publicado");
    expect(firstUrl).toContain("venue%3Avenue_id");
    expect(firstUrl).toContain("event_tracks");
    expect(secondUrl).toContain("offset=1000");

    const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
    expect(headers.apikey).toBe("sb_publishable_test");
    expect(headers["Accept-Profile"]).toBe("public");
  });

  it("usa a URL pública quando o env não está definido", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_PUBLISHABLE_KEY;
    delete process.env.SUPABASE_ANON_KEY;

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => "[]",
    });

    await fetchEventsFromApi();
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url.startsWith("https://xbsooiedncsrmrhjasvk.supabase.co/")).toBe(
      true,
    );
    expect((global.fetch as jest.Mock).mock.calls[0][1].headers.apikey).toBe(
      "sb_publishable_-xZkCMPyJLSSXZZvwHRGLw_QFbLS_yN",
    );
  });

  it("busca um evento por id com o select da ficha", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify([samplePayload]),
    });

    const event = await fetchEventByIdFromApi(samplePayload.id);
    expect(event?.title).toContain("Saindo do lugar");
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain(`id=eq.${samplePayload.id}`);
    expect(url).toContain("event_speakers");
    const init = (global.fetch as jest.Mock).mock.calls[0][1] as {
      next?: { revalidate?: number; tags?: string[] };
    };
    expect(init.next?.revalidate).toBe(3600);
    expect(init.next?.tags).toEqual(["events"]);
  });
});

describe("normalizeEvent — bordas do payload", () => {
  it("aceita venue aninhado em array (PostgREST às vezes devolve lista)", () => {
    const event = normalizeEvent({
      ...samplePayload,
      venue: [
        {
          name: "Coreto",
          area: "Praça",
          latitude: "-22.25",
          longitude: "-45.7",
          maps_url: "",
        },
      ],
    });
    expect(event?.venue).toEqual({
      name: "Coreto",
      area: "Praça",
      latitude: -22.25,
      longitude: -45.7,
      maps_url: null,
    });
  });

  it("mantém speaker sem photo_url e tracks vazios", () => {
    const event = normalizeEvent({
      ...samplePayload,
      event_tracks: [],
      event_speakers: [
        {
          speakers: {
            id: "s1",
            name: "Ada",
            photo_url: null,
            mini_bio: null,
            cargo_empresa: "Palestrante",
          },
        },
      ],
    });
    expect(event?.event_tracks).toEqual([]);
    expect(event?.event_speakers[0].speakers).toMatchObject({
      name: "Ada",
      photo_url: null,
    });
  });
});

describe("fetchEventsFromApi — erros", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
    };
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it("lança em falha HTTP da lista", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => "jwt expired",
    });
    await expect(fetchEventsFromApi()).rejects.toThrow(/401/);
  });

  it("lança em falha HTTP da ficha", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "boom",
    });
    await expect(fetchEventByIdFromApi("abc")).rejects.toThrow(/500/);
  });
});
