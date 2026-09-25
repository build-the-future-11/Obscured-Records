export const dynamic = "force-dynamic";

const shaPattern = /^[0-9a-f]{40}$/i;

function deployedRevision() {
  const candidates = [
    ["VERCEL_GIT_COMMIT_SHA", process.env.VERCEL_GIT_COMMIT_SHA],
    ["CF_PAGES_COMMIT_SHA", process.env.CF_PAGES_COMMIT_SHA],
    ["GITHUB_SHA", process.env.GITHUB_SHA],
    ["COMMIT_SHA", process.env.COMMIT_SHA],
    ["SOURCE_SHA", process.env.SOURCE_SHA],
    ["NEXT_PUBLIC_GIT_SHA", process.env.NEXT_PUBLIC_GIT_SHA],
  ] as const;

  for (const [source, raw] of candidates) {
    const value = raw?.trim();
    if (value && shaPattern.test(value)) return { revision: value.toLowerCase(), source };
  }
  return { revision: null, source: null };
}

function responseBody() {
  const { revision, source } = deployedRevision();
  return {
    ok: Boolean(revision),
    revision,
    source,
  };
}

export async function GET() {
  const body = responseBody();
  return Response.json(body, {
    status: body.ok ? 200 : 503,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function HEAD() {
  const body = responseBody();
  return new Response(null, {
    status: body.ok ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Obscured-Revision": body.revision ?? "unavailable",
    },
  });
}
