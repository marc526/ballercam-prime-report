import { ASINS, LOCATIONS, ReportData } from "@/lib/constants";

export default function PrimeGrid({ report }: { report: ReportData }) {
  const { results } = report;

  const asinTotals = ASINS.map((a) => ({
    ...a,
    total: LOCATIONS.filter((l) => results[a.asin]?.[l.zip]).length,
  }));

  const locationTotals = LOCATIONS.map((l) => ({
    ...l,
    total: ASINS.filter((a) => results[a.asin]?.[l.zip]).length,
  }));

  function badgeColor(total: number) {
    if (total === 0) return "bg-red-100 text-red-600";
    if (total <= 3) return "bg-orange-100 text-orange-600";
    if (total <= 6) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
      <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>📊</span> Full Prime Availability Grid
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="text-left px-3 py-2.5 rounded-tl-lg sticky left-0 bg-gray-800 z-10 min-w-[140px]">
                iPhone Model
              </th>
              {LOCATIONS.map((l) => (
                <th
                  key={l.zip}
                  className="text-center px-2 py-2.5 min-w-[80px]"
                >
                  <div className="font-semibold">{l.city}</div>
                  <div className="text-gray-400 text-xs font-normal">
                    {l.state} · {l.zip}
                  </div>
                </th>
              ))}
              <th className="text-center px-3 py-2.5 rounded-tr-lg min-w-[90px]">
                Prime in
                <div className="text-gray-400 text-xs font-normal">
                  # Locations
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {asinTotals.map((asin, rowIdx) => (
              <tr
                key={asin.asin}
                className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-3 py-2 font-medium text-gray-800 sticky left-0 bg-inherit z-10">
                  {asin.model}
                </td>
                {LOCATIONS.map((l) => {
                  const hasPrime = results[asin.asin]?.[l.zip] ?? false;
                  return (
                    <td
                      key={l.zip}
                      className={`text-center py-2 text-base ${
                        hasPrime ? "bg-green-50" : ""
                      }`}
                    >
                      {hasPrime ? "✅" : "❌"}
                    </td>
                  );
                })}
                <td className="text-center py-2 px-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${badgeColor(asin.total)}`}
                  >
                    {asin.total}/10
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-800 text-white font-bold">
              <td className="px-3 py-2.5 rounded-bl-lg sticky left-0 bg-gray-800 z-10">
                Prime SKU Count
              </td>
              {locationTotals.map((l) => (
                <td key={l.zip} className="text-center py-2.5">
                  <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {l.total}/{ASINS.length}
                  </span>
                </td>
              ))}
              <td className="rounded-br-lg" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
