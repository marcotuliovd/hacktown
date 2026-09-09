/**
 * Tipos alinhados ao payload REST do HackTown
 * (`GET /rest/v1/events` com embed `venue:venue_id`, `event_tracks`, `event_speakers`).
 *
 * Contrato principal do Prompt 7: `HacktownEvent` com `id`, `title`,
 * `start_time`/`end_time`, `venue` aninhado, `event_tracks[].tracks` e
 * `event_speakers[].speakers` (`photo_url`, `name`).
 */

export interface HacktownVenue {
  name: string | null;
  area: string | null;
  latitude: number | null;
  longitude: number | null;
  maps_url: string | null;
}

export interface HacktownTrack {
  id: string | null;
  name: string | null;
  code: string | null;
}

export interface HacktownSpeaker {
  id: string | null;
  name: string | null;
  photo_url: string | null;
  mini_bio: string | null;
  cargo_empresa: string | null;
}

export interface EventTrackLink {
  tracks: HacktownTrack | null;
}

export interface EventSpeakerLink {
  speakers: HacktownSpeaker | null;
}

export interface HacktownEvent {
  id: string;
  title: string;
  description: string | null;
  /** Data civil do evento, YYYY-MM-DD. */
  event_date: string;
  /** Horário local (HH:MM:SS), não ISO. */
  start_time: string;
  end_time: string;
  age_rating: string | null;
  activity_type: string | null;
  status: string | null;
  guarda_chuva: boolean;
  is_evento_maior: boolean;
  image_url: string | null;
  parent_event_id: string | null;
  formato: string | null;
  mediador: string | null;
  selo: string | null;
  registration_url: string | null;
  venue: HacktownVenue | null;
  event_tracks: EventTrackLink[];
  event_speakers: EventSpeakerLink[];
}

/** Recorte enxuto para a lista pública (evita hidratar o payload completo). */
export interface EventListItemData {
  id: string;
  title: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venueName: string | null;
  activityType: string | null;
}
