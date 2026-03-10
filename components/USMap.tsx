import { ASINS, LOCATIONS, ReportData } from "@/lib/constants";

function getColor(count: number) {
  if (count === 0) return "#ef4444";
  if (count <= 2) return "#f87171";
  if (count <= 4) return "#fbbf24";
  if (count <= 9) return "#f59e0b";
  return "#22c55e";
}

function getRadius(count: number) {
  if (count === 0) return 20;
  return 20 + count * 2;
}

// ViewBox is 900×396 — ratio 44%, fills card width at a comfortable height
// City x/y positions are percentages of mapW/mapH
const mapW = 900;
const mapH = 396;

export default function USMap({ report }: { report: ReportData }) {
  const { results } = report;

  const locationCounts = LOCATIONS.map((l) => ({
    ...l,
    count: ASINS.filter((a) => results[a.asin]?.[l.zip]).length,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
      <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span className="text-red-500">📍</span> Prime SKU Count by Location
      </h2>

      {/* padding-bottom: 44% = 396/900 — keeps aspect ratio, fills full card width */}
      <div className="relative w-full" style={{ paddingBottom: "44%" }}>
        <svg
          viewBox={`0 0 ${mapW} ${mapH}`}
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="dot-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00000033" />
            </filter>
            <linearGradient id="mapBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e4eef8" />
              <stop offset="100%" stopColor="#cddff2" />
            </linearGradient>
          </defs>

          {/* Background */}
          <rect x="0" y="0" width={mapW} height={mapH} rx="10" fill="url(#mapBg)" />

          {/* Continental US silhouette — scaled to 900×396 viewBox */}
          <path
            d="M 90 63 L 810 63 L 835 98 L 855 160 L 812 253 L 768 318
               L 655 350 L 542 358 L 428 350 L 315 341 L 200 318
               L 112 270 L 66 206 L 66 126 Z"
            fill="#b6d0e8"
            stroke="#8ab0ce"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Florida peninsula */}
          <path
            d="M 655 350 L 672 368 L 655 384 L 636 375 L 634 350 Z"
            fill="#b6d0e8"
            stroke="#8ab0ce"
            strokeWidth="1"
            strokeLinejoin="round"
          />

          {/* Subtle state-line feel — just a few internal lines */}
          <line x1="66" y1="206" x2="810" y2="180" stroke="#9bbdd6" strokeWidth="0.5" opacity="0.4" />
          <line x1="350" y1="63" x2="340" y2="358" stroke="#9bbdd6" strokeWidth="0.5" opacity="0.4" />

          {/* Map label */}
          <text
            x={mapW / 2}
            y={mapH - 5}
            textAnchor="middle"
            fontSize="11"
            fill="#7a9ab8"
            fontStyle="italic"
          >
            Approximate US Geography
          </text>

          {/* Location circles */}
          {locationCounts.map((loc) => {
            const cx = (loc.x / 100) * mapW;
            const cy = (loc.y / 100) * mapH;
            const r = getRadius(loc.count);
            const color = getColor(loc.count);
            return (
              <g key={loc.zip}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={color}
                  opacity={0.95}
                  filter="url(#dot-shadow)"
                />
                <text
                  x={cx}
                  y={cy + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="13"
                  fontWeight="bold"
                  fill="white"
                >
                  {loc.count}
                </text>
                {/* City label with white background for legibility */}
                <text
                  x={cx}
                  y={cy + r + 16}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="600"
                  fill="white"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  paintOrder="stroke"
                >
                  {loc.city}
                </text>
                <text
                  x={cx}
                  y={cy + r + 16}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="600"
                  fill="#1e3a5f"
                >
                  {loc.city}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 justify-center text-xs text-gray-600">
        {[
          { color: "#ef4444", label: "0 Prime SKUs" },
          { color: "#f87171", label: "1–2 Prime SKUs" },
          { color: "#fbbf24", label: "3–4 Prime SKUs" },
          { color: "#f59e0b", label: "5–9 Prime SKUs" },
          { color: "#22c55e", label: "10+ Prime SKUs" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
