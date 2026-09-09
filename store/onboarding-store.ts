"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  AgendaDraft,
  AgendaOptionIndex,
  SavedAgendas,
  SelectedAgenda,
} from "@/types/onboarding";

export type AgendaOptionsTuple = [
  AgendaDraft | null,
  AgendaDraft | null,
  AgendaDraft | null,
];

const EMPTY_OPTIONS: AgendaOptionsTuple = [null, null, null];

export const ONBOARDING_STORAGE_KEY = "hacktown-onboarding";

interface OnboardingState {
  favoriteTrackIds: string[];
  agendaOptions: AgendaOptionsTuple;
  selectedAgenda: SelectedAgenda | null;
  savedAgendas: SavedAgendas;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setFavoriteTrackIds: (ids: string[]) => void;
  toggleTrack: (id: string) => void;
  saveAgendaOption: (index: AgendaOptionIndex, draft: AgendaDraft) => void;
  clearAgendaOption: (index: AgendaOptionIndex) => void;
  selectAgenda: (index: AgendaOptionIndex) => void;
  deleteSavedAgenda: (dayIso: string) => void;
  startNewDay: (dayIso: string) => void;
  prepareEditDay: (dayIso: string) => boolean;
  resetOnboarding: () => void;
}

export function mergeSavedAgendas(
  selectedAgenda: SelectedAgenda | null | undefined,
  savedAgendas: SavedAgendas | undefined,
): SavedAgendas {
  const next: SavedAgendas = { ...(savedAgendas ?? {}) };
  if (selectedAgenda?.dayIso && !next[selectedAgenda.dayIso]) {
    next[selectedAgenda.dayIso] = {
      option: selectedAgenda.option,
      dayIso: selectedAgenda.dayIso,
      eventIds: [...selectedAgenda.eventIds],
    };
  }
  return next;
}

function draftDayIso(options: AgendaOptionsTuple): string | null {
  return options.find((draft) => draft != null)?.dayIso ?? null;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      favoriteTrackIds: [],
      agendaOptions: EMPTY_OPTIONS,
      selectedAgenda: null,
      savedAgendas: {},
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setFavoriteTrackIds: (ids) =>
        set({ favoriteTrackIds: Array.from(new Set(ids)) }),
      toggleTrack: (id) => {
        const current = get().favoriteTrackIds;
        set({
          favoriteTrackIds: current.includes(id)
            ? current.filter((trackId) => trackId !== id)
            : [...current, id],
        });
      },
      saveAgendaOption: (index, draft) => {
        const next = [...get().agendaOptions] as AgendaOptionsTuple;
        next[index - 1] = {
          dayIso: draft.dayIso,
          eventIds: [...draft.eventIds],
        };
        set({ agendaOptions: next });
      },
      clearAgendaOption: (index) => {
        const next = [...get().agendaOptions] as AgendaOptionsTuple;
        next[index - 1] = null;
        if (index <= 1) {
          next[1] = null;
          next[2] = null;
        } else if (index === 2) {
          next[2] = null;
        }
        const selected = get().selectedAgenda;
        const selectedGone =
          selected != null && next[selected.option - 1] == null;
        set({
          agendaOptions: next,
          selectedAgenda: selectedGone ? null : selected,
        });
      },
      selectAgenda: (index) => {
        const draft = get().agendaOptions[index - 1];
        if (!draft) return;
        const selected: SelectedAgenda = {
          option: index,
          dayIso: draft.dayIso,
          eventIds: [...draft.eventIds],
        };
        set({
          selectedAgenda: selected,
          savedAgendas: {
            ...get().savedAgendas,
            [draft.dayIso]: selected,
          },
        });
      },
      deleteSavedAgenda: (dayIso) => {
        const next = { ...get().savedAgendas };
        delete next[dayIso];
        const selected = get().selectedAgenda;
        set({
          savedAgendas: next,
          selectedAgenda: selected?.dayIso === dayIso ? null : selected,
        });
      },
      startNewDay: (dayIso) => {
        const currentDay = draftDayIso(get().agendaOptions);
        if (currentDay && currentDay !== dayIso) {
          set({ agendaOptions: [null, null, null] });
        }
      },
      prepareEditDay: (dayIso) => {
        const saved = get().savedAgendas[dayIso];
        if (!saved) return false;
        set({
          agendaOptions: [
            { dayIso: saved.dayIso, eventIds: [...saved.eventIds] },
            null,
            null,
          ],
        });
        return true;
      },
      resetOnboarding: () =>
        set({
          favoriteTrackIds: [],
          agendaOptions: [null, null, null],
          selectedAgenda: null,
          savedAgendas: {},
        }),
    }),
    {
      name: ONBOARDING_STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        favoriteTrackIds: state.favoriteTrackIds,
        agendaOptions: state.agendaOptions,
        selectedAgenda: state.selectedAgenda,
        savedAgendas: state.savedAgendas,
      }),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<OnboardingState>;
        return {
          ...currentState,
          ...persisted,
          savedAgendas: mergeSavedAgendas(
            persisted.selectedAgenda ?? currentState.selectedAgenda,
            persisted.savedAgendas,
          ),
        };
      },
      migrate: (persistedState) => {
        const persisted = (persistedState ?? {}) as Partial<OnboardingState>;
        return {
          ...persisted,
          savedAgendas: mergeSavedAgendas(
            persisted.selectedAgenda ?? null,
            persisted.savedAgendas,
          ),
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.savedAgendas = mergeSavedAgendas(
          state.selectedAgenda,
          state.savedAgendas,
        );
        state.setHasHydrated(true);
      },
    },
  ),
);

export function resetOnboardingStore() {
  useOnboardingStore.setState({
    favoriteTrackIds: [],
    agendaOptions: [null, null, null],
    selectedAgenda: null,
    savedAgendas: {},
    hasHydrated: true,
  });
  useOnboardingStore.persist.clearStorage();
}
