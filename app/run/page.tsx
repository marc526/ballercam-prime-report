"use client";

import { useState } from "react";

const BOOKMARKLET_CODE = `javascript:(async function(){
const ASINS=[
  {asin:'B0FZF3R8VC',model:'iPhone 13 Pro'},
  {asin:'B0FZDX1N6N',model:'iPhone 13 Pro Max'},
  {asin:'B0FZDT9XW6',model:'iPhone 14'},
  {asin:'B0FZF3SHL2',model:'iPhone 14 Plus'},
  {asin:'B0FZDX1DTJ',model:'iPhone 14 Pro'},
  {asin:'B0FZF5236Y',model:'iPhone 14 Pro Max'},
  {asin:'B0FZDTG2F7',model:'iPhone 15'},
  {asin:'B0FZDY2ZT8',model:'iPhone 15 Plus'},
  {asin:'B0FZDQX8T1',model:'iPhone 15 Pro'},
  {asin:'B0G1CYJ88R',model:'iPhone 15 Pro Max'},
  {asin:'B0FZF19Z91',model:'iPhone 16'},
  {asin:'B0FZF41D8K',model:'iPhone 16 Plus'},
  {asin:'B0FZDXV7JJ',model:'iPhone 16 Pro'},
  {asin:'B0G1826FYW',model:'iPhone 16 Pro Max'},
  {asin:'B0FZDY4LGV',model:'iPhone 16e'},
  {asin:'B0G2199F5H',model:'iPhone 17'},
  {asin:'B0G2143V1X',model:'iPhone 17 Air'},
  {asin:'B0G1ZRYT2Q',model:'iPhone 17 Pro'},
  {asin:'B0G21QKPXC',model:'iPhone 17 Pro Max'}
];
const LOCS=[
  {zip:'10001',city:'New York',state:'NY'},
  {zip:'77001',city:'Houston',state:'TX'},
  {zip:'60601',city:'Chicago',state:'IL'},
  {zip:'98101',city:'Seattle',state:'WA'},
  {zip:'13090',city:'Liverpool',state:'NY'},
  {zip:'91101',city:'Pasadena',state:'CA'},
  {zip:'32801',city:'Orlando',state:'FL'},
  {zip:'27601',city:'Raleigh',state:'NC'},
  {zip:'94103',city:'San Francisco',state:'CA'},
  {zip:'80202',city:'Denver',state:'CO'}
];
const box=document.createElement('div');
box.style.cssText='position:fixed;top:16px;right:16px;background:#232f3e;color:#fff;padding:20px;border-radius:12px;z-index:2147483647;font-family:sans-serif;font-size:13px;width:320px;max-height:420px;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.4)';
document.body.appendChild(box);
const log=[];
function render(extra){box.innerHTML='<b style="font-size:15px">🏀 BallerCam Prime Checker</b><br><br>'+log.slice(-12).join('<br>')+(extra?'<br>'+extra:'');}
render('Starting…');
async function changeZip(zip){
  try{
    const r=await fetch('/gp/delivery/ajax/address-change.html',{
      method:'POST',credentials:'include',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams({locationType:'LOCATION_INPUT',zipCode:zip,storeContext:'generic',deviceType:'web',pageType:'Gateway',actionSource:'glow'}).toString()
    });
    return r.ok;
  }catch(e){return false;}
}
async function checkAsin(asin){
  try{
    const r=await fetch('/dp/'+asin,{credentials:'include'});
    const h=await r.text();
    return h.includes('Prime members')||h.includes('FREE delivery');
  }catch(e){return false;}
}
const results={};
for(const loc of LOCS){
  render('📍 '+loc.city+', '+loc.state+'…');
  await changeZip(loc.zip);
  await new Promise(r=>setTimeout(r,1500));
  const checks=await Promise.all(ASINS.map(async a=>{
    const p=await checkAsin(a.asin);
    if(!results[a.asin])results[a.asin]={};
    results[a.asin][loc.zip]=p;
    return p;
  }));
  const n=checks.filter(Boolean).length;
  log.push((n>0?'🟡':'🔴')+' '+loc.city+': '+n+'/'+ASINS.length+' Prime');
  render('');
}
const data={results,checkedAt:new Date().toISOString(),checkedAtMs:Date.now()};
const json=JSON.stringify(data);
await navigator.clipboard.writeText(json);
box.innerHTML='<b style="font-size:15px">🏀 BallerCam Prime Checker</b><br><br>'+log.join('<br>')+'<br><br><span style="color:#4ade80;font-weight:bold">✅ Done! Results copied to clipboard.</span><br><br>Now go to:<br><a href="https://ballercam-prime-report.vercel.app/run" style="color:#00a8e1" target="_blank">ballercam-prime-report.vercel.app/run</a><br>and paste the JSON to save the report.';
})();`;

export default function RunPage() {
  const [secret, setSecret] = useState("");
  const [json, setJson] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function saveResults() {
    setSaving(true);
    setResult(null);
    try {
      const parsed = JSON.parse(json);
      const res = await fetch("/api/save-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-save-secret": secret,
        },
        body: JSON.stringify(parsed),
      });
      if (res.ok) {
        setResult("success");
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Unknown error");
        setResult("error");
      }
    } catch (e) {
      setErrorMsg("Invalid JSON — make sure you pasted the full clipboard output.");
      setResult("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">
          🏀 BallerCam Prime — Run Report
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Run the checker on Amazon using the bookmarklet below, then paste the
          results here to save the public report.
        </p>

        {/* Step 1 */}
        <div className="bg-gray-800 rounded-xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              STEP 1
            </span>
            <span className="font-semibold">Add the bookmarklet to your browser</span>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Drag this button to your bookmarks bar:
          </p>
          <a
            href={BOOKMARKLET_CODE}
            className="inline-block bg-[#ff9900] hover:bg-[#ffb84d] text-black font-bold px-5 py-2.5 rounded-lg cursor-grab active:cursor-grabbing select-none"
            onClick={(e) => e.preventDefault()}
            draggable
          >
            🏀 Check BallerCam Prime
          </a>
          <p className="text-gray-500 text-xs mt-3">
            Tip: drag the orange button above directly onto your bookmarks bar.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-gray-800 rounded-xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              STEP 2
            </span>
            <span className="font-semibold">Run it on Amazon</span>
          </div>
          <ol className="text-gray-400 text-sm space-y-1 list-decimal list-inside">
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
              and make sure you&apos;re logged in
            </li>
            <li>Click the bookmarklet in your bookmarks bar</li>
            <li>
              A status panel appears — wait ~2–3 minutes for all 10 locations
            </li>
            <li>
              When done, results are{" "}
              <span className="text-green-400 font-semibold">
                automatically copied to your clipboard
              </span>
            </li>
          </ol>
        </div>

        {/* Step 3 */}
        <div className="bg-gray-800 rounded-xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              STEP 3
            </span>
            <span className="font-semibold">Paste results and save</span>
          </div>

          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder='Paste JSON here (Cmd+V)…'
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-xs font-mono h-28 outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
          />

          <label className="block text-sm font-medium text-gray-300 mb-1">
            Save Secret
          </label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Your SAVE_SECRET from Vercel"
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />

          <button
            onClick={saveResults}
            disabled={saving || !json || !secret}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
          >
            {saving ? "Saving…" : "💾 Save Report"}
          </button>

          {result === "success" && (
            <div className="mt-4 p-3 bg-green-900 border border-green-600 rounded-lg text-green-300 text-sm">
              ✅ Report saved! Vercel will auto-deploy in ~1 minute.{" "}
              <a href="/" className="underline font-semibold">
                View public report →
              </a>
            </div>
          )}
          {result === "error" && (
            <div className="mt-4 p-3 bg-red-900 border border-red-600 rounded-lg text-red-300 text-sm">
              ❌ {errorMsg}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
