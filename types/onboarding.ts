/**
 * Recortes e estado do onboarding e do painel (Prompts 4–6).
 * Login real entra no Prompt 9 — o perfil aqui é simulado no Zustand.
 */

export interface TrackOption {
  id: string;
  name: string;
  code: string | null;
}

/** Evento enxuto para montar a agenda (sem description/speakers). */
export interface OnboardingEvent {
  id: string;
  title: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venueName: string | null;
  latitude: number | null;
  longitude: number | null;
  activityType: string | null;
  trackIds: string[];
}

export interface OnboardingTimeGroup {
  time: string;
  events: OnboardingEvent[];
}

export type AgendaOptionIndex = 1 | 2 | 3;

export interface AgendaDraft {
  dayIso: string;
  eventIds: string[];
}

/** Agenda do dia escolhida no comparativo (estado simulado do perfil). */
export interface SelectedAgenda {
  option: AgendaOptionIndex;
  dayIso: string;
  eventIds: string[];
}

/** Agendas consolidadas por dia civil (`YYYY-MM-DD`). */
export type SavedAgendas = Record<string, SelectedAgenda>;

export type SlotDecision =
  | { kind: "pick"; eventId: string }
  | { kind: "skip" };

export type SlotDecisions = Record<string, SlotDecision>;
