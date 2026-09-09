import { MAP_SIZE } from "@/data/map-venues";
import type { AgendaRoutePoint } from "@/lib/walking";

interface AgendaRouteMapProps {
  points: AgendaRoutePoint[];
}

interface MappedPoint {
  label: string;
  x: number;
  y: number;
}

function mappedPoints(points: AgendaRoutePoint[]): MappedPoint[] {
  return points.flatMap((point) =>
    point.x != null && point.y != null
      ? [{ label: point.label, x: point.x, y: point.y }]
      : [],
  );
}

function clusterPins(points: MappedPoint[]): { x: number; y: number; labels: string }[] {
  const clusters = new Map<string, { x: number; y: number; labels: string[] }>();
  for (const point of points) {
    const key = `${Math.round(point.x)}:${Math.round(point.y)}`;
    const existing = clusters.get(key);
    if (existing) {
      if (!existing.labels.includes(point.label)) {
        existing.labels.push(point.label);
      }
    } else {
      clusters.set(key, { x: point.x, y: point.y, labels: [point.label] });
    }
  }
  return [...clusters.values()].map((cluster) => ({
    x: cluster.x,
    y: cluster.y,
    labels: cluster.labels.join("/"),
  }));
}

export function AgendaRouteMap({ points }: AgendaRouteMapProps) {
  const mapped = mappedPoints(points);

  if (mapped.length === 0) {
    return (
      <p className="border border-subtle bg-bg-base px-3 py-8 text-center font-sans text-xs uppercase tracking-button text-text-secondary">
        Sem pin no mapa do festival para estes locais
      </p>
    );
  }

  const pinR = 52;
  const fontSize = 42;
  const labels = mapped.map((point) => point.label).join(" → ");
  const segments: { x1: number; y1: number; x2: number; y2: number }[] = [];

  for (let i = 0; i < points.length - 1; i += 1) {
    const from = points[i];
    const to = points[i + 1];
    if (from.x == null || from.y == null || to.x == null || to.y == null) {
      continue;
    }
    if (from.x === to.x && from.y === to.y) continue;
    segments.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y });
  }

  return (
    <div
      className="relative w-full overflow-hidden border border-subtle bg-bg-base"
      style={{ aspectRatio: `${MAP_SIZE.w} / ${MAP_SIZE.h}` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/mapa.svg"
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full"
      />
      <svg
        viewBox={`0 0 ${MAP_SIZE.w} ${MAP_SIZE.h}`}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label={`Rota ${labels} no mapa do festival`}
      >
        {segments.map((segment) => (
          <line
            key={`${segment.x1}-${segment.y1}-${segment.x2}-${segment.y2}`}
            x1={segment.x1}
            y1={segment.y1}
            x2={segment.x2}
            y2={segment.y2}
            stroke="#00FFFF"
            strokeWidth="14"
            strokeLinecap="round"
          />
        ))}
        {clusterPins(mapped).map((pin) => (
          <g key={`${pin.x}-${pin.y}-${pin.labels}`} transform={`translate(${pin.x} ${pin.y})`}>
            <circle r={pinR} fill="#CCFF00" />
            <text
              y={14}
              textAnchor="middle"
              fill="#0B0C10"
              fontSize={pin.labels.length > 1 ? fontSize * 0.72 : fontSize}
              fontFamily="sans-serif"
              fontWeight="700"
            >
              {pin.labels}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
