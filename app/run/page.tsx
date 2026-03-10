"use client";

import { useEffect, useRef, useState } from "react";

// Bookmarklet runs on amazon.com (same origin = no CORS), then opens
// /run#data=BASE64 which auto-saves here.
function buildBookmarklet(): string {
  const vercelUrl = "https://ballercam-prime-report.vercel.app";
  // Single line — Chrome's bookmark URL field truncates on newlines
  const code = `(async function(){const ASINS=[{asin:'B0FZF3R8VC',model:'iPhone 13 Pro'},{asin:'B0FZDX1N6N',model:'iPhone 13 Pro Max'},{asin:'B0FZDT9XW6',model:'iPhone 14'},{asin:'B0FZF3SHL2',model:'iPhone 14 Plus'},{asin:'B0FZDX1DTJ',model:'iPhone 14 Pro'},{asin:'B0FZF5236Y',model:'iPhone 14 Pro Max'},{asin:'B0FZDTG2F7',model:'iPhone 15'},{asin:'B0FZDY2ZT8',model:'iPhone 15 Plus'},{asin:'B0FZDQX8T1',model:'iPhone 15 Pro'},{asin:'B0G1CYJ88R',model:'iPhone 15 Pro Max'},{asin:'B0FZF19Z91',model:'iPhone 16'},{asin:'B0FZF41D8K',model:'iPhone 16 Plus'},{asin:'B0FZDXV7JJ',model:'iPhone 16 Pro'},{asin:'B0G1826FYW',model:'iPhone 16 Pro Max'},{asin:'B0FZDY4LGV',model:'iPhone 16e'},{asin:'B0G2199F5H',model:'iPhone 17'},{asin:'B0G2143V1X',model:'iPhone 17 Air'},{asin:'B0G1ZRYT2Q',model:'iPhone 17 Pro'},{asin:'B0G21QKPXC',model:'iPhone 17 Pro Max'}];const LOCS=[{zip:'10001',city:'New York',state:'NY'},{zip:'77001',city:'Houston',state:'TX'},{zip:'60601',city:'Chicago',state:'IL'},{zip:'98101',city:'Seattle',state:'WA'},{zip:'13090',city:'Liverpool',state:'NY'},{zip:'91101',city:'Pasadena',state:'CA'},{zip:'32801',city:'Orlando',state:'FL'},{zip:'27601',city:'Raleigh',state:'NC'},{zip:'94103',city:'San Francisco',state:'CA'},{zip:'80202',city:'Denver',state:'CO'}];const box=document.createElement('div');box.style.cssText='position:fixed;top:16px;right:16px;background:#232f3e;color:#fff;padding:20px;border-radius:12px;z-index:2147483647;font-family:sans-serif;font-size:13px;width:300px;max-height:400px;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.5)';document.body.appendChild(box);const rows=[];function render(s){box.innerHTML='<b>🏀 BallerCam Prime Checker</b><br><br>'+rows.slice(-10).join('<br>')+(s?'<br><span style="color:#9ca3af">'+s+'</span>':'');}render('Starting…');async function changeZip(zip){try{const r=await fetch('/gp/delivery/ajax/address-change.html',{method:'POST',credentials:'include',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({locationType:'LOCATION_INPUT',zipCode:zip,storeContext:'generic',deviceType:'web',pageType:'Gateway',actionSource:'glow'}).toString()});return r.ok;}catch(e){return false;}}async function checkAsin(asin){try{const r=await fetch('/dp/'+asin,{credentials:'include'});const h=await r.text();return h.includes('Prime members');}catch(e){return false;}}const results={};for(const loc of LOCS){render('📍 '+loc.city+'…');await changeZip(loc.zip);await new Promise(r=>setTimeout(r,1500));const checks=await Promise.all(ASINS.map(async a=>{const p=await checkAsin(a.asin);if(!results[a.asin])results[a.asin]={};results[a.asin][loc.zip]=p;return p;}));const n=checks.filter(Boolean).length;rows.push((n>2?'🟡':'🔴')+' '+loc.city+': '+n+'/'+ASINS.length);render('');}const data={results,checkedAt:new Date().toISOString(),checkedAtMs:Date.now()};const encoded=btoa(JSON.stringify(data));const url='${vercelUrl}/run#data='+encoded;box.innerHTML='<b>🏀 BallerCam Prime Checker</b><br><br>'+rows.join('<br>')+'<br><br><span style="color:#4ade80;font-weight:bold">✅ Done!</span><br><br><a href="'+url+'" target="_blank" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:13px">→ Save Report</a>';})();`;
  return "javascript:" + code;
}

function CopyBookmarklet({ linkRef }: { linkRef: React.RefObject<HTMLAnchorElement | null> }) {
  const [copied, setCopied] = useState(false);
  const code = buildBookmarklet();

  // Still set the ref href in case drag ever works
  useEffect(() => {
    if (linkRef.current) linkRef.current.setAttribute("href", code);
  }, [code, linkRef]);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button
      onClick={copy}
      className="w-full bg-[#ff9900] hover:bg-[#ffb84d] text-black font-bold px-6 py-3 rounded-xl text-sm transition-colors"
    >
      {copied ? "✅ Copied! Now add it as a bookmark →" : "📋 Copy Bookmarklet Code"}
    </button>
  );
}

export default function RunPage() {
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState<
    "idle" | "saving" | "success" | "error" | "no-secret"
  >("idle");
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);

  // Load saved secret from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ballercam-prime-secret");
    if (saved) setSecret(saved);
  }, []);

  // Handle incoming data from bookmarklet (hash-based)
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#data=")) return;

    const encoded = hash.slice(6);
    window.history.replaceState(null, "", "/run"); // clean up URL

    const savedSecret = localStorage.getItem("ballercam-prime-secret");
    if (!savedSecret) {
      setStatus("no-secret");
      return;
    }

    // Auto-save
    (async () => {
      setStatus("saving");
      try {
        const json = atob(encoded);
        const parsed = JSON.parse(json);
        setCheckedAt(parsed.checkedAt);
        const res = await fetch("/api/save-results", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-save-secret": savedSecret,
          },
          body: json,
        });
        setStatus(res.ok ? "success" : "error");
      } catch {
        setStatus("error");
      }
    })();
  }, []);

  function handleSecretChange(val: string) {
    setSecret(val);
    localStorage.setItem("ballercam-prime-secret", val);
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">
          🏀 BallerCam Prime — Runner
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          One-time setup, then one click every week.
        </p>

        {/* Auto-save result */}
        {status === "saving" && (
          <div className="mb-6 p-4 bg-blue-900 border border-blue-600 rounded-xl text-blue-200 text-sm">
            ⏳ Saving report data…
          </div>
        )}
        {status === "success" && (
          <div className="mb-6 p-4 bg-green-900 border border-green-600 rounded-xl">
            <p className="text-green-300 font-bold text-base mb-1">
              ✅ Report saved!
            </p>
            <p className="text-green-400 text-sm mb-3">
              {checkedAt
                ? `Checked ${new Date(checkedAt).toLocaleString()}`
                : ""}
              {" · "}Vercel auto-deploys in ~1 min.
            </p>
            <a
              href="/"
              className="inline-block bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              View Public Report →
            </a>
          </div>
        )}
        {status === "error" && (
          <div className="mb-6 p-4 bg-red-900 border border-red-600 rounded-xl text-red-300 text-sm">
            ❌ Save failed — check your secret below and try running again.
          </div>
        )}
        {status === "no-secret" && (
          <div className="mb-6 p-4 bg-yellow-900 border border-yellow-600 rounded-xl text-yellow-300 text-sm">
            ⚠️ Results received but no secret saved. Enter your secret below,
            then run the bookmarklet again.
          </div>
        )}

        {/* Secret */}
        <div className="bg-gray-800 rounded-xl p-5 mb-5">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Save Secret{" "}
            <span className="text-gray-500 font-normal">
              (saved in your browser)
            </span>
          </label>
          <input
            type="password"
            value={secret}
            onChange={(e) => handleSecretChange(e.target.value)}
            placeholder="prime-report-secret-2026"
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-gray-500 text-xs mt-1">
            Stored locally — you only need to enter this once.
          </p>
        </div>

        {/* Bookmarklet */}
        <div className="bg-gray-800 rounded-xl p-5 mb-5">
          <p className="text-sm font-medium text-gray-300 mb-3">
            Install bookmarklet{" "}
            <span className="text-gray-500 font-normal">(one-time setup)</span>
          </p>
          <CopyBookmarklet linkRef={linkRef} />
          <div className="mt-4 text-xs text-gray-400 space-y-1">
            <p className="font-semibold text-gray-300">To install in Chrome:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click <b>Copy Code</b> above</li>
              <li>Right-click your bookmarks bar → <b>Add page…</b></li>
              <li>Set name: <span className="text-gray-200">🏀 BallerCam Prime</span></li>
              <li>Paste the copied code as the <b>URL</b></li>
              <li>Click Save</li>
            </ol>
          </div>
        </div>

        {/* Weekly instructions */}
        <div className="bg-gray-800 rounded-xl p-5 text-sm text-gray-400">
          <p className="font-semibold text-gray-200 mb-2">Weekly run:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Go to{" "}
              <a
                href="https://www.amazon.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#00a8e1] underline"
              >
                amazon.com
              </a>{" "}
              (logged in)
            </li>
            <li>Click the bookmarklet — a status panel appears in the corner</li>
            <li>Wait ~2–3 min for all 10 locations to complete</li>
            <li>
              A new tab opens here and auto-saves — you&apos;re done
            </li>
          </ol>
        </div>
      </div>
    </main>
  );
}
