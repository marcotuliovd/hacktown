import {
  ONBOARDING_STORAGE_KEY,
  mergeSavedAgendas,
  resetOnboardingStore,
  useOnboardingStore,
} from "@/store/onboarding-store";

describe("onboarding store", () => {
  beforeEach(() => {
    localStorage.clear();
    resetOnboardingStore();
  });

  it("alterna trilhas favoritas", () => {
    const { toggleTrack } = useOnboardingStore.getState();
    toggleTrack("ia");
    toggleTrack("saude");
    expect(useOnboardingStore.getState().favoriteTrackIds).toEqual([
      "ia",
      "saude",
    ]);
    toggleTrack("ia");
    expect(useOnboardingStore.getState().favoriteTrackIds).toEqual(["saude"]);
  });

  it("salva até 3 opções de agenda", () => {
    const { saveAgendaOption } = useOnboardingStore.getState();
    saveAgendaOption(1, { dayIso: "2026-09-05", eventIds: ["a"] });
    saveAgendaOption(2, { dayIso: "2026-09-05", eventIds: ["b"] });
    expect(useOnboardingStore.getState().agendaOptions[0]?.eventIds).toEqual([
      "a",
    ]);
    expect(useOnboardingStore.getState().agendaOptions[1]?.eventIds).toEqual([
      "b",
    ]);
    expect(useOnboardingStore.getState().agendaOptions[2]).toBeNull();
  });

  it("consolida a agenda selecionada e persiste", () => {
    const { saveAgendaOption, selectAgenda } = useOnboardingStore.getState();
    saveAgendaOption(1, { dayIso: "2026-09-05", eventIds: ["a"] });
    saveAgendaOption(2, { dayIso: "2026-09-05", eventIds: ["b"] });
    selectAgenda(2);
    expect(useOnboardingStore.getState().selectedAgenda).toEqual({
      option: 2,
      dayIso: "2026-09-05",
      eventIds: ["b"],
    });
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    expect(raw).toContain('"option":2');
  });

  it("ignora selectAgenda em slot vazio", () => {
    useOnboardingStore.getState().selectAgenda(1);
    expect(useOnboardingStore.getState().selectedAgenda).toBeNull();
  });

  it("ao limpar a opção selecionada, descarta a agenda consolidada", () => {
    const { saveAgendaOption, selectAgenda, clearAgendaOption } =
      useOnboardingStore.getState();
    saveAgendaOption(1, { dayIso: "2026-09-05", eventIds: ["a"] });
    saveAgendaOption(2, { dayIso: "2026-09-05", eventIds: ["b"] });
    selectAgenda(2);
    clearAgendaOption(1);
    expect(useOnboardingStore.getState().selectedAgenda).toBeNull();
  });

  it("ao limpar a opção 1, descarta as opções seguintes", () => {
    const { saveAgendaOption, clearAgendaOption } =
      useOnboardingStore.getState();
    saveAgendaOption(1, { dayIso: "2026-09-05", eventIds: ["a"] });
    saveAgendaOption(2, { dayIso: "2026-09-05", eventIds: ["b"] });
    saveAgendaOption(3, { dayIso: "2026-09-05", eventIds: ["c"] });
    clearAgendaOption(1);
    expect(useOnboardingStore.getState().agendaOptions).toEqual([
      null,
      null,
      null,
    ]);
  });

  it("persiste o rascunho no localStorage", () => {
    useOnboardingStore.getState().toggleTrack("ia");
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    expect(raw).toContain("ia");
  });

  it("upsert da agenda salva não apaga outro dia", () => {
    const { saveAgendaOption, selectAgenda } = useOnboardingStore.getState();
    saveAgendaOption(1, { dayIso: "2026-09-05", eventIds: ["a"] });
    selectAgenda(1);
    saveAgendaOption(1, { dayIso: "2026-09-06", eventIds: ["b"] });
    selectAgenda(1);

    expect(useOnboardingStore.getState().savedAgendas).toEqual({
      "2026-09-05": {
        option: 1,
        dayIso: "2026-09-05",
        eventIds: ["a"],
      },
      "2026-09-06": {
        option: 1,
        dayIso: "2026-09-06",
        eventIds: ["b"],
      },
    });
  });

  it("exclui só o dia pedido", () => {
    const { saveAgendaOption, selectAgenda, deleteSavedAgenda } =
      useOnboardingStore.getState();
    saveAgendaOption(1, { dayIso: "2026-09-05", eventIds: ["a"] });
    selectAgenda(1);
    saveAgendaOption(1, { dayIso: "2026-09-06", eventIds: ["b"] });
    selectAgenda(1);
    deleteSavedAgenda("2026-09-05");

    expect(useOnboardingStore.getState().savedAgendas["2026-09-05"]).toBeUndefined();
    expect(useOnboardingStore.getState().savedAgendas["2026-09-06"]?.eventIds).toEqual(
      ["b"],
    );
    expect(useOnboardingStore.getState().selectedAgenda?.dayIso).toBe("2026-09-06");
  });

  it("startNewDay limpa rascunhos de outro dia e preserve o mesmo dia", () => {
    const { saveAgendaOption, startNewDay } = useOnboardingStore.getState();
    saveAgendaOption(1, { dayIso: "2026-09-05", eventIds: ["a"] });
    startNewDay("2026-09-05");
    expect(useOnboardingStore.getState().agendaOptions[0]?.eventIds).toEqual(["a"]);

    startNewDay("2026-09-06");
    expect(useOnboardingStore.getState().agendaOptions).toEqual([null, null, null]);
  });

  it("prepareEditDay carrega a agenda salva na opção 1", () => {
    const { saveAgendaOption, selectAgenda, prepareEditDay } =
      useOnboardingStore.getState();
    saveAgendaOption(1, { dayIso: "2026-09-05", eventIds: ["a", "b"] });
    saveAgendaOption(2, { dayIso: "2026-09-05", eventIds: ["c"] });
    selectAgenda(2);

    expect(prepareEditDay("2026-09-05")).toBe(true);
    expect(useOnboardingStore.getState().agendaOptions).toEqual([
      { dayIso: "2026-09-05", eventIds: ["c"] },
      null,
      null,
    ]);
    expect(prepareEditDay("2026-09-07")).toBe(false);
  });

  it("migra selectedAgenda legado para savedAgendas", () => {
    expect(
      mergeSavedAgendas(
        { option: 2, dayIso: "2026-09-04", eventIds: ["x"] },
        {},
      ),
    ).toEqual({
      "2026-09-04": { option: 2, dayIso: "2026-09-04", eventIds: ["x"] },
    });
    expect(
      mergeSavedAgendas(
        { option: 1, dayIso: "2026-09-04", eventIds: ["old"] },
        {
          "2026-09-04": { option: 1, dayIso: "2026-09-04", eventIds: ["kept"] },
        },
      )["2026-09-04"].eventIds,
    ).toEqual(["kept"]);
  });
});
