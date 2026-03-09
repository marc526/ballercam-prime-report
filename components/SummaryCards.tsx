import { ASINS, LOCATIONS, ReportData } from "@/lib/constants";

export default function SummaryCards({ report }: { report: ReportData }) {
  const { results } = report;

  // SKUs with Prime in at least one location
  const skusWithAnyPrime = ASINS.filter((a) =>
    LOCATIONS.some((l) => results[a.asin]?.[l.zip])
  ).length;

  // Most Prime-friendly city (most SKUs with Prime)
  const locationPrimeCounts = LOCATIONS.map((l) => ({
    ...l,
    count: ASINS.filter((a) => results[a.asin]?.[l.zip]).length,
  }));
  const topCity = locationPrimeCounts.reduce((a, b) =>
    b.count > a.count ? b : a
  );

  // Best-covered SKU (most locations with Prime)
  const asinPrimeCounts = ASINS.map((a) => ({
    ...a,
    count: LOCATIONS.filter((l) => results[a.asin]?.[l.zip]).length,
  }));
  const topSku = asinPrimeCounts.reduce((a, b) => (b.count > a.count ? b : a));

  const cards = [
    {
      value: ASINS.length.toString(),
      label: "SKUs Analyzed",
      sub: "13 Pro → 17 Pro Max",
      color: "text-[#00a8e1]",
    },
    {
      value: skusWithAnyPrime.toString(),
      label: "SKUs w/ Any Prime",
      sub: "Across 10 locations",
      color: "text-[#00a8e1]",
    },
    {
      value: topCity.city.toUpperCase(),
      label: "Most Prime-Friendly",
      sub: `${topCity.count} of 19 SKUs = Prime`,
      color: "text-[#2ea84c]",
    },
    {
      value: `${topSku.count}/10`,
      label: topSku.model,
      sub: "Widest Prime coverage",
      color: "text-[#00a8e1]",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card, i) => (
        <div key={i} className="bg-white rounded-xl p-5 shadow-sm text-center">
          <div className={`text-4xl font-extrabold ${card.color}`}>
            {card.value}
          </div>
          <div className="text-gray-700 font-semibold mt-1 text-sm">
            {card.label}
          </div>
          <div className="text-gray-400 text-xs mt-0.5">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}
