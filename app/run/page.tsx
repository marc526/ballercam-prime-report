"use client";

import { useState } from "react";
import { ASINS, LOCATIONS, PrimeResult } from "@/lib/constants";

type LogEntry = { message: string; type: "info" | "success" | "warn" | "error" };

async function changeAmazonZip(zip: string): Promise<boolean> {
  try {
    const res = await fetch(
      "https://www.amazon.com/gp/delivery/ajax/address-change.html",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "anti-csrftoken-a2z": "",
        },
        body: new URLSearchParams({
          locationType: "LOCATION_INPUT",
          zipCode: zip,
          storeContext: "generic",
          deviceType: "web",
          pageType: "Gateway",
          actionSource: "glow",
        }).toString(),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

async function checkAsinPrime(asin: string): Promise<boolean> {
  try {
    const res = await fetch(`https://www.amazon.com/dp/${asin}`, {
      credentials: "include",
      headers: {
        Accept: "text/html",
      },
    });
    const html = await res.text();
    return html.includes("Prime members") || html.includes("FREE delivery");
  } catch {
    return false;
  }
}

export default function RunPage() {
  const [secret, setSecret] = useState("");
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  function addLog(message: string, type: LogEntry["type"] = "info") {
    setLog((prev) => [...prev, { message, type }]);
  }

  async function runReport() {
    if (!secret) {
      alert("Enter your save secret first.");
      return;
    }
    setRunning(true);
    setDone(false);
    setLog([]);
    setProgress(0);

    const results: PrimeResult = {};
    const total = LOCATIONS.length * ASINS.length;
    let completed = 0;

    for (const loc of LOCATIONS) {
      addLog(`📍 Switching to ZIP ${loc.zip} (${loc.city}, ${loc.state})…`, "info");
      const changed = await changeAmazonZip(loc.zip);
      if (!changed) {
        addLog(`  ⚠️  ZIP change may have failed for ${loc.zip} — continuing anyway`, "warn");
      }

      // Small delay to let Amazon register the location change
      await new Promise((r) => setTimeout(r, 1200));

      // Fetch all ASINs in parallel for this ZIP
      addLog(`  Checking ${ASINS.length} ASINs for ${loc.city}…`, "info");
      const checks = await Promise.all(
        ASINS.map(async (a) => {
          const hasPrime = await checkAsinPrime(a.asin);
          if (!results[a.asin]) results[a.asin] = {};
          results[a.asin][loc.zip] = hasPrime;
          completed++;
          setProgress(Math.round((completed / total) * 100));
          return { asin: a.asin, model: a.model, hasPrime };
        })
      );

      const primeCount = checks.filter((c) => c.hasPrime).length;
      addLog(
        `  ✅ ${loc.city}: ${primeCount}/${ASINS.length} SKUs have Prime`,
        primeCount > 0 ? "success" : "warn"
      );
    }

    addLog("💾 Saving results…", "info");

    const reportData = {
      results,
      checkedAt: new Date().toISOString(),
      checkedAtMs: Date.now(),
    };

    const saveRes = await fetch("/api/save-results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-save-secret": secret,
      },
      body: JSON.stringify(reportData),
    });

    if (saveRes.ok) {
      addLog("🎉 Report saved! Visit / to see the public report.", "success");
      setDone(true);
    } else {
      addLog("❌ Failed to save results — check your secret.", "error");
    }

    setRunning(false);
  }

  const logColors: Record<LogEntry["type"], string> = {
    info: "text-gray-300",
    success: "text-green-400",
    warn: "text-yellow-400",
    error: "text-red-400",
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">🏀 BallerCam Prime — Run Report</h1>
        <p className="text-gray-400 text-sm mb-6">
          This page runs the Amazon Prime checks in your browser using your Amazon
          session. Make sure you&apos;re logged into Amazon before running.
        </p>

        <div className="bg-gray-800 rounded-xl p-5 mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Save Secret
          </label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Enter your SAVE_SECRET from Vercel env"
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-gray-500 text-xs mt-1">
            Set in Vercel → Project → Environment Variables as{" "}
            <code className="bg-gray-700 px-1 rounded">SAVE_SECRET</code>
          </p>
        </div>

        <button
          onClick={runReport}
          disabled={running}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors mb-6"
        >
          {running ? "Running…" : "▶ Run Prime Report"}
        </button>

        {(running || log.length > 0) && (
          <div className="bg-gray-800 rounded-xl p-5">
            {running && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="font-mono text-xs space-y-0.5 max-h-80 overflow-y-auto">
              {log.map((entry, i) => (
                <div key={i} className={logColors[entry.type]}>
                  {entry.message}
                </div>
              ))}
            </div>

            {done && (
              <a
                href="/"
                className="block mt-4 text-center bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg transition-colors"
              >
                View Public Report →
              </a>
            )}
          </div>
        )}

        <div className="mt-8 bg-gray-800 rounded-xl p-4 text-xs text-gray-400">
          <p className="font-semibold text-gray-300 mb-2">⚠️ Before running:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Log into Amazon in this browser</li>
            <li>Amazon must be accessible (not blocked in your region)</li>
            <li>The run takes ~2–3 minutes (sequential ZIP changes + parallel ASIN fetches)</li>
            <li>If ZIP changes fail silently, results may all reflect your default location</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
