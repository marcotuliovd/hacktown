"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { MAP_SIZE, MAP_VENUES, type MapVenue } from "@/data/map-venues";
import { cn } from "@/lib/cn";

interface FestivalMapProps {
  selectedN: number | null;
  highlightedNs?: number[];
  onSelect: (n: number | null) => void;
}

interface Transform {
  k: number;
  tx: number;
  ty: number;
  kMin: number;
  kMax: number;
}

const PIN_MARGIN = 70;

function dist(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function mid(
  a: { x: number; y: number },
  b: { x: number; y: number },
): { x: number; y: number } {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function FestivalMap({
  selectedN,
  highlightedNs = [],
  onSelect,
}: FestivalMapProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<Transform>({
    k: 1,
    tx: 0,
    ty: 0,
    kMin: 0.2,
    kMax: 6,
  });
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const dragRef = useRef<{
    x: number;
    y: number;
    tx: number;
    ty: number;
  } | null>(null);
  const pinchRef = useRef<{
    d: number;
    k0: number;
    wx: number;
    wy: number;
  } | null>(null);
  const movedRef = useRef(false);

  const apply = useCallback(() => {
    const world = worldRef.current;
    if (!world) return;
    const { k, tx, ty } = transformRef.current;
    world.style.transform = `translate(${tx}px, ${ty}px) scale(${k})`;
    world.style.setProperty("--ps", String(1 / k));
  }, []);

  const fit = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const t = transformRef.current;
    if (rect.width <= 0 || rect.height <= 0) {
      t.k = 0.3;
      t.tx = 0;
      t.ty = 0;
      apply();
      return;
    }
    t.k = Math.min(rect.width / MAP_SIZE.w, rect.height / MAP_SIZE.h);
    t.kMin = t.k;
    t.kMax = Math.max(6, t.k * 10);
    t.tx = (rect.width - MAP_SIZE.w * t.k) / 2;
    t.ty = (rect.height - MAP_SIZE.h * t.k) / 2;
    apply();
  }, [apply]);

  const setZoom = useCallback(
    (nextK: number, clientX: number, clientY: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const t = transformRef.current;
      const k = Math.min(t.kMax, Math.max(t.kMin, nextK));
      if (k === t.k) return;
      const rect = stage.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      t.tx = px - ((px - t.tx) * k) / t.k;
      t.ty = py - ((py - t.ty) * k) / t.k;
      t.k = k;
      apply();
    },
    [apply],
  );

  const panToVenue = useCallback(
    (venue: MapVenue, force = false) => {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const t = transformRef.current;
      const sx = t.tx + venue.x * t.k;
      const sy = t.ty + venue.y * t.k;
      const offScreen =
        sx < PIN_MARGIN ||
        sx > rect.width - PIN_MARGIN ||
        sy < PIN_MARGIN ||
        sy > rect.height - PIN_MARGIN;
      if (!force && !offScreen) return;
      t.tx = rect.width / 2 - venue.x * t.k;
      t.ty = rect.height / 2 - venue.y * t.k;
      apply();
    },
    [apply],
  );

  useLayoutEffect(() => {
    fit();
  }, [fit]);

  useEffect(() => {
    const onResize = () => {
      if (selectedN == null) fit();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [fit, selectedN]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      let dy = event.deltaY;
      if (event.deltaMode === 1) dy *= 16;
      else if (event.deltaMode === 2) dy *= 400;
      dy = Math.max(-90, Math.min(90, dy));
      setZoom(
        transformRef.current.k * Math.exp(-dy * 0.0022),
        event.clientX,
        event.clientY,
      );
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [setZoom]);

  useEffect(() => {
    if (selectedN == null) return;
    const venue = MAP_VENUES.find((item) => item.n === selectedN);
    if (!venue) return;
    panToVenue(venue, true);
  }, [selectedN, panToVenue]);

  function startPinch() {
    const pts = [...pointersRef.current.values()];
    if (pts.length < 2) return;
    const [a, b] = pts;
    const m = mid(a, b);
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const t = transformRef.current;
    pinchRef.current = {
      d: dist(a, b),
      k0: t.k,
      wx: (m.x - rect.left - t.tx) / t.k,
      wy: (m.y - rect.top - t.ty) / t.k,
    };
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest(".festival-map-pin")) return;
    const stage = stageRef.current;
    if (!stage) return;
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    try {
      stage.setPointerCapture(event.pointerId);
    } catch {
      /* jsdom */
    }
    if (pointersRef.current.size === 1) {
      dragRef.current = {
        x: event.clientX,
        y: event.clientY,
        tx: transformRef.current.tx,
        ty: transformRef.current.ty,
      };
      movedRef.current = false;
      stage.classList.add("cursor-grabbing");
    } else if (pointersRef.current.size === 2) {
      dragRef.current = null;
      stage.classList.remove("cursor-grabbing");
      startPinch();
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    const t = transformRef.current;

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const pts = [...pointersRef.current.values()];
      const [a, b] = pts;
      const m = mid(a, b);
      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect) return;
      const nk = Math.min(
        t.kMax,
        Math.max(t.kMin, pinchRef.current.k0 * (dist(a, b) / pinchRef.current.d)),
      );
      t.k = nk;
      t.tx = m.x - rect.left - pinchRef.current.wx * nk;
      t.ty = m.y - rect.top - pinchRef.current.wy * nk;
      movedRef.current = true;
      apply();
      return;
    }

    const drag = dragRef.current;
    if (!drag) return;
    if (
      Math.abs(event.clientX - drag.x) + Math.abs(event.clientY - drag.y) >
      4
    ) {
      movedRef.current = true;
    }
    t.tx = drag.tx + (event.clientX - drag.x);
    t.ty = drag.ty + (event.clientY - drag.y);
    apply();
  }

  function endPointer(event: ReactPointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    const stage = stageRef.current;
    if (pointersRef.current.size === 1) {
      const remaining = [...pointersRef.current.values()][0];
      dragRef.current = {
        x: remaining.x,
        y: remaining.y,
        tx: transformRef.current.tx,
        ty: transformRef.current.ty,
      };
      stage?.classList.add("cursor-grabbing");
    }
    if (pointersRef.current.size === 0) {
      dragRef.current = null;
      stage?.classList.remove("cursor-grabbing");
    }
  }

  function onStageClick(event: ReactMouseEvent<HTMLDivElement>) {
    if (movedRef.current) return;
    if ((event.target as HTMLElement).closest(".festival-map-pin")) return;
    if ((event.target as HTMLElement).closest("[data-map-card]")) return;
    onSelect(null);
  }

  function zoomBy(factor: number) {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    setZoom(
      transformRef.current.k * factor,
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    );
  }

  const selected = MAP_VENUES.find((venue) => venue.n === selectedN) ?? null;
  const hasHighlight = highlightedNs.length > 0;

  return (
    <div className="relative h-full min-h-0 w-full bg-bg-base">
      <div
        ref={stageRef}
        className="absolute inset-0 cursor-grab touch-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onClick={onStageClick}
        onDoubleClick={() => {
          onSelect(null);
          fit();
        }}
        role="application"
        aria-label="Mapa interativo do HackTown"
      >
        <div
          ref={worldRef}
          className="absolute origin-top-left select-none"
          style={{ width: MAP_SIZE.w, height: MAP_SIZE.h }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mapa.svg"
            alt=""
            draggable={false}
            className="block h-full w-full"
          />
          {MAP_VENUES.map((venue) => {
            const isActive = selectedN === venue.n;
            const isHighlighted = highlightedNs.includes(venue.n);
            const dim = hasHighlight
              ? !isHighlighted && !isActive
              : selectedN != null && !isActive;
            return (
              <button
                key={venue.n}
                type="button"
                className={cn(
                  "festival-map-pin",
                  isActive && "act",
                  dim && "dim",
                )}
                style={{ left: venue.x, top: venue.y }}
                aria-label={`${venue.n}. ${venue.nome}`}
                aria-pressed={isActive}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(venue.n);
                }}
              >
                {venue.n}
              </button>
            );
          })}
        </div>
      </div>

      <p className="pointer-events-none absolute left-3 right-16 top-3 z-10 border border-subtle bg-bg-base/90 px-2 py-1 font-sans text-[10px] uppercase tracking-button text-text-secondary sm:left-1/2 sm:right-auto sm:max-w-none sm:-translate-x-1/2 sm:px-3">
        <span className="sm:hidden">Arraste · pinça para zoom</span>
        <span className="hidden sm:inline">
          Arraste para mover · pinça ou rolagem para aproximar
        </span>
      </p>

      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 lg:bottom-3 lg:top-auto">
        <ZoomButton label="Aproximar" onClick={() => zoomBy(1.25)}>
          +
        </ZoomButton>
        <ZoomButton label="Afastar" onClick={() => zoomBy(1 / 1.25)}>
          −
        </ZoomButton>
        <ZoomButton label="Enquadrar mapa" onClick={fit}>
          ⌂
        </ZoomButton>
      </div>

      {selected ? (
        <div
          data-map-card
          className="absolute bottom-3 left-3 z-10 w-[min(340px,calc(100%-1.5rem))] border border-subtle border-l-4 border-l-neon-green bg-bg-surface p-3 shadow-glow lg:w-[min(340px,calc(100%-4.5rem))]"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-8 shrink-0 place-items-center bg-neon-green font-sans text-sm font-black text-black">
              {selected.n}
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-2xl leading-none text-text-primary">
                {selected.nome}
              </h2>
              {selected.obs ? (
                <p className="mt-1 font-sans text-xs text-text-secondary">
                  {selected.obs}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Fechar"
              className="ml-auto grid size-11 shrink-0 place-items-center font-sans text-lg leading-none text-text-secondary"
              onClick={() => onSelect(null)}
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-11 place-items-center border border-subtle bg-bg-surface/90 font-sans text-lg font-bold text-text-primary hover:border-neon-green hover:text-neon-green"
    >
      {children}
    </button>
  );
}
