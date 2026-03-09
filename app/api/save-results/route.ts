import { NextRequest, NextResponse } from "next/server";

const GITHUB_OWNER = "marc526";
const GITHUB_REPO = "ballercam-prime-report";
const FILE_PATH = "public/report-data.json";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-save-secret");
  if (secret !== process.env.SAVE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GITHUB_TOKEN not set" }, { status: 500 });
  }

  const apiBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`;

  // Get current file SHA (needed for updates)
  let sha: string | undefined;
  const getRes = await fetch(apiBase, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (getRes.ok) {
    const existing = await getRes.json();
    sha = existing.sha;
  }

  const content = Buffer.from(JSON.stringify(body, null, 2)).toString("base64");
  const checkedAt = new Date(body.checkedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const putRes = await fetch(apiBase, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Update Prime report — ${checkedAt}`,
      content,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!putRes.ok) {
    const err = await putRes.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
