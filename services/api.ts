import { unstable_cache } from "next/cache";
import { cache as reactCache } from "react";
import type {
  EventSpeakerLink,
  EventTrackLink,
  HacktownEvent,
  HacktownSpeaker,
  HacktownTrack,
  HacktownVenue,
} from "@/types/event";

export const EVENTS_REVALIDATE_SECONDS = 3600;
export const EVENTS_PAGE_SIZE = 1000;

/** Select da lista (sem speakers — o payload cheio passa de 2MB e o ISR do Next recusa). */
export const EVENTS_LIST_SELECT =
  "id,title,description,event_date,start_time,end_time,age_rating,activity_type,is_evento_maior,image_url,venue:venue_id(name,area,maps_url,latitude,longitude),event_tracks(tracks(id,name,code))";

/** Select da ficha (evento único). */
export const EVENTS_DETAIL_SELECT =
  "id,title,description,event_date,start_time,end_time,age_rating,activity_type,status,guarda_chuva,is_evento_maior,image_url,parent_event_id,formato,mediador,selo,registration_url,venue:venue_id(name,area,maps_url,latitude,longitude),event_tracks(tracks(id,name,code)),event_speakers(speakers(id,name,cargo_empresa,mini_bio,photo_url))";

/** Publishable — já exposta no client do schedule hub. Override via NEXT_PUBLIC_*. */
const PUBLIC_SUPABASE_URL = "https://xbsooiedncsrmrhjasvk.supabase.co";
const PUBLIC_SUPABASE_KEY = "sb_publishable_-xZkCMPyJLSSXZZvwHRGLw_QFbLS_yN";

function getSupabaseConfig(): { url: string; key: string } {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    PUBLIC_SUPABASE_KEY;
  return {
    url: url.replace(/\/$/, ""),
    key,
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function firstRecord(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) return asRecord(value[0]);
  return asRecord(value);
}

function normalizeVenue(value: unknown): HacktownVenue | null {
  const raw = firstRecord(value);
  if (!raw) return null;
  const name = asString(raw.name);
  const area = asString(raw.area);
  const latitude = asNumber(raw.latitude);
  const longitude = asNumber(raw.longitude);
  const maps_url = asString(raw.maps_url);
  if (!name && latitude == null && longitude == null && !maps_url && !area) {
    return null;
  }
  return { name, area, latitude, longitude, maps_url };
}

function normalizeTrack(value: unknown): HacktownTrack | null {
  const raw = firstRecord(value);
  if (!raw) return null;
  return {
    id: asString(raw.id),
    name: asString(raw.name),
    code: asString(raw.code),
  };
}

function normalizeSpeaker(value: unknown): HacktownSpeaker | null {
  const raw = firstRecord(value);
  if (!raw) return null;
  return {
    id: asString(raw.id),
    name: asString(raw.name),
    photo_url: asString(raw.photo_url),
    mini_bio: asString(raw.mini_bio),
    cargo_empresa: asString(raw.cargo_empresa),
  };
}

function normalizeTrackLinks(value: unknown): EventTrackLink[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const raw = asRecord(item);
    return { tracks: normalizeTrack(raw?.tracks ?? item) };
  });
}

function normalizeSpeakerLinks(value: unknown): EventSpeakerLink[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const raw = asRecord(item);
    return { speakers: normalizeSpeaker(raw?.speakers ?? item) };
  });
}

export function normalizeEvent(raw: unknown): HacktownEvent | null {
  const record = asRecord(raw);
  if (!record) return null;

  const id = asString(record.id);
  const title = asString(record.title);
  const event_date = asString(record.event_date);
  const start_time = asString(record.start_time);
  const end_time = asString(record.end_time);
  if (!id || !title || !event_date || !start_time || !end_time) return null;

  return {
    id,
    title,
    description: asString(record.description),
    event_date,
    start_time,
    end_time,
    age_rating: asString(record.age_rating),
    activity_type: asString(record.activity_type),
    status: asString(record.status),
    guarda_chuva: asBoolean(record.guarda_chuva),
    is_evento_maior: asBoolean(record.is_evento_maior),
    image_url: asString(record.image_url),
    parent_event_id: asString(record.parent_event_id),
    formato: asString(record.formato),
    mediador: asString(record.mediador),
    selo: asString(record.selo),
    registration_url: asString(record.registration_url),
    venue: normalizeVenue(record.venue),
    event_tracks: normalizeTrackLinks(record.event_tracks),
    event_speakers: normalizeSpeakerLinks(record.event_speakers),
  };
}

async function fetchEventsJson(
  search: URLSearchParams,
  cacheMode: "list" | "detail",
): Promise<{ rows: unknown[]; status: number; body: string }> {
  const { url, key } = getSupabaseConfig();
  const endpoint = `${url}/rest/v1/events?${search.toString()}`;

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: "*/*",
    "Accept-Profile": "public",
  };

  const response = await fetch(
    endpoint,
    cacheMode === "list"
      ? { headers, cache: "no-store" as const }
      : {
          headers,
          next: { revalidate: EVENTS_REVALIDATE_SECONDS, tags: ["events"] },
        },
  );

  const body = await response.text().catch(() => "");
  if (!response.ok) {
    return { rows: [], status: response.status, body };
  }

  const payload: unknown = body ? JSON.parse(body) : [];
  if (!Array.isArray(payload)) {
    throw new Error("A API de eventos não retornou um array.");
  }
  return { rows: payload, status: response.status, body };
}

async function fetchEventsPage(
  offset: number,
  pageSize: number,
): Promise<{ rows: unknown[]; status: number; body: string }> {
  const params = new URLSearchParams({
    select: process.env.SUPABASE_EVENTS_SELECT || EVENTS_LIST_SELECT,
    status: "eq.publicado",
    order: "event_date.asc,start_time.asc,id.asc",
    offset: String(offset),
    limit: String(pageSize),
  });
  return fetchEventsJson(params, "list");
}

/**
 * Busca todos os eventos publicados (paginado com offset/limit).
 * Use `getEvents()` nas Server Components para dedupe no request.
 */
export async function fetchEventsFromApi(): Promise<HacktownEvent[]> {
  const all: HacktownEvent[] = [];
  let offset = 0;

  for (;;) {
    const page = await fetchEventsPage(offset, EVENTS_PAGE_SIZE);
    if (page.status >= 400) {
      throw new Error(
        `Falha ao buscar eventos (${page.status}): ${page.body.slice(0, 280)}`,
      );
    }
    for (const row of page.rows) {
      const event = normalizeEvent(row);
      if (event) all.push(event);
    }
    if (page.rows.length < EVENTS_PAGE_SIZE) break;
    offset += EVENTS_PAGE_SIZE;
  }

  return all;
}

function memoizeRequest<Args extends unknown[], R>(
  fn: (...args: Args) => R,
): (...args: Args) => R {
  return typeof reactCache === "function" ? reactCache(fn) : fn;
}

const fetchEventsCached =
  process.env.NODE_ENV === "test"
    ? fetchEventsFromApi
    : unstable_cache(fetchEventsFromApi, ["hacktown-events-list"], {
        revalidate: EVENTS_REVALIDATE_SECONDS,
        tags: ["events"],
      });

/** Deduplica getEvents() no mesmo request (App Router) e revalida a cada 1 h. */
export const getEvents: () => Promise<HacktownEvent[]> =
  memoizeRequest(fetchEventsCached);

export async function fetchEventByIdFromApi(
  id: string,
): Promise<HacktownEvent | null> {
  const params = new URLSearchParams({
    select: EVENTS_DETAIL_SELECT,
    id: `eq.${id}`,
    status: "eq.publicado",
    limit: "1",
  });
  const page = await fetchEventsJson(params, "detail");
  if (page.status >= 400) {
    throw new Error(
      `Falha ao buscar evento (${page.status}): ${page.body.slice(0, 280)}`,
    );
  }
  const row = page.rows[0];
  return row ? normalizeEvent(row) : null;
}

export const getEventById: (id: string) => Promise<HacktownEvent | null> =
  memoizeRequest(fetchEventByIdFromApi);
