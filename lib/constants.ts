export const ASINS = [
  { asin: "B0FZF3R8VC", model: "iPhone 13 Pro" },
  { asin: "B0FZDX1N6N", model: "iPhone 13 Pro Max" },
  { asin: "B0FZDT9XW6", model: "iPhone 14" },
  { asin: "B0FZF3SHL2", model: "iPhone 14 Plus" },
  { asin: "B0FZDX1DTJ", model: "iPhone 14 Pro" },
  { asin: "B0FZF5236Y", model: "iPhone 14 Pro Max" },
  { asin: "B0FZDTG2F7", model: "iPhone 15" },
  { asin: "B0FZDY2ZT8", model: "iPhone 15 Plus" },
  { asin: "B0FZDQX8T1", model: "iPhone 15 Pro" },
  { asin: "B0G1CYJ88R", model: "iPhone 15 Pro Max" },
  { asin: "B0FZF19Z91", model: "iPhone 16" },
  { asin: "B0FZF41D8K", model: "iPhone 16 Plus" },
  { asin: "B0FZDXV7JJ", model: "iPhone 16 Pro" },
  { asin: "B0G1826FYW", model: "iPhone 16 Pro Max" },
  { asin: "B0FZDY4LGV", model: "iPhone 16e" },
  { asin: "B0G2199F5H", model: "iPhone 17" },
  { asin: "B0G2143V1X", model: "iPhone 17 Air" },
  { asin: "B0G1ZRYT2Q", model: "iPhone 17 Pro" },
  { asin: "B0G21QKPXC", model: "iPhone 17 Pro Max" },
];

export const LOCATIONS = [
  { zip: "10001", city: "New York", state: "NY", x: 73.5, y: 31.5 },
  { zip: "77001", city: "Houston", state: "TX", x: 53.5, y: 62.5 },
  { zip: "60601", city: "Chicago", state: "IL", x: 62.0, y: 30.0 },
  { zip: "98101", city: "Seattle", state: "WA", x: 10.5, y: 15.5 },
  { zip: "13090", city: "Liverpool", state: "NY", x: 70.5, y: 26.5 },
  { zip: "91101", city: "Pasadena", state: "CA", x: 14.5, y: 52.5 },
  { zip: "32801", city: "Orlando", state: "FL", x: 67.5, y: 66.5 },
  { zip: "27601", city: "Raleigh", state: "NC", x: 70.0, y: 44.5 },
  { zip: "94103", city: "San Francisco", state: "CA", x: 8.0, y: 38.5 },
  { zip: "80202", city: "Denver", state: "CO", x: 38.0, y: 38.5 },
];

export type PrimeResult = {
  [asin: string]: {
    [zip: string]: boolean;
  };
};

export type ReportData = {
  results: PrimeResult;
  checkedAt: string;
  checkedAtMs: number;
};
