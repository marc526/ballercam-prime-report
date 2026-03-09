import { ASINS, LOCATIONS, ReportData } from "@/lib/constants";

function getColor(count: number) {
  if (count === 0) return "#ef4444";
  if (count <= 2) return "#f87171";
  if (count <= 4) return "#fbbf24";
  return "#f59e0b";
}

function getRadius(count: number) {
  if (count === 0) return 20;
  return 20 + count * 2;
}

export default function USMap({ report }: { report: ReportData }) {
  const { results } = report;

  const locationCounts = LOCATIONS.map((l) => ({
    ...l,
    count: ASINS.filter((a) => results[a.asin]?.[l.zip]).length,
  }));

  // SVG viewBox is 800x500, locations use percentage-based x/y of the map area
  const mapW = 800;
  const mapH = 500;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
      <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-red-500">📍</span> Prime SKU Count by Location
      </h2>

      <div className="relative w-full" style={{ paddingBottom: "62.5%" }}>
        <svg
          viewBox="0 0 800 500"
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* US map outline — simplified shape */}
          <rect
            x="10"
            y="10"
            width="780"
            height="480"
            rx="12"
            fill="#dce8f5"
            stroke="#b0c8e0"
            strokeWidth="1"
          />
          {/* Rough continental US silhouette */}
          <path
            d="M 80 80 L 720 80 L 740 120 L 760 200 L 720 320 L 680 400
               L 580 440 L 480 450 L 380 440 L 280 430 L 180 400
               L 100 340 L 60 260 L 60 160 Z"
            fill="#c8dff0"
            stroke="#9ab8d8"
            strokeWidth="1.5"
          />
          {/* Florida */}
          <path
            d="M 580 440 L 600 460 L 580 480 L 560 470 L 560 440 Z"
            fill="#c8dff0"
            stroke="#9ab8d8"
            strokeWidth="1"
          />
          {/* Map label */}
          <text
            x="400"
            y="492"
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
                <circle cx={cx} cy={cy} r={r} fill={color} opacity={0.9} />
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
                <text
                  x={cx}
                  y={cy + r + 14}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#374151"
                >
                  {loc.city}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 justify-center text-xs text-gray-600">
        {[
          { color: "#ef4444", label: "0 Prime SKUs" },
          { color: "#f87171", label: "1–2 Prime SKUs" },
          { color: "#fbbf24", label: "3–4 Prime SKUs" },
          { color: "#f59e0b", label: "5+ Prime SKUs" },
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
