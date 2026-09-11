import { NextRequest, NextResponse } from "next/server";

const FALLBACK_PATHS = [
  "/favicon.svg",
  "/favicon.ico",
  "/favicon.png",
  "/apple-touch-icon.png",
];

function isAllowedUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "magicyan418.com" || url.hostname.endsWith(".magicyan418.com"));
  } catch {
    return false;
  }
}

function getIconLinks(html: string, baseUrl: string) {
  const links = html.match(/<link\b[^>]*>/gi) ?? [];
  return links.flatMap((tag) => {
    const rel = tag.match(/\brel=["']([^"']+)["']/i)?.[1] ?? "";
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (!href || !rel.toLowerCase().includes("icon") || href.startsWith("data:")) return [];
    try {
      const iconUrl = new URL(href, baseUrl);
      return isAllowedUrl(iconUrl.href) ? [iconUrl.href] : [];
    } catch {
      return [];
    }
  });
}

async function fetchAsset(url: string) {
  const response = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; MagicyanPixel/1.0)" },
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) return null;
  const contentType = response.headers.get("content-type")?.split(";")[0] || "";
  const extension = url.match(/\.(svg|ico|png|jpe?g|webp)(?:\?|$)/i)?.[1]?.toLowerCase();
  if (!contentType.startsWith("image/") && !extension) return null;
  const inferredType = extension === "svg" ? "image/svg+xml" : extension === "ico" ? "image/x-icon" : `image/${extension}`;
  return { body: await response.arrayBuffer(), contentType: contentType.startsWith("image/") ? contentType : inferredType };
}

export async function GET(request: NextRequest) {
  const website = request.nextUrl.searchParams.get("url") ?? "";
  if (!isAllowedUrl(website)) return NextResponse.json({ error: "Unsupported website" }, { status: 400 });

  try {
    const page = await fetch(website, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; MagicyanPixel/1.0)" },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(5000),
    });
    const html = page.ok ? await page.text() : "";
    const candidates = [...getIconLinks(html, website), ...FALLBACK_PATHS.map((path) => new URL(path, website).href)];

    const assets = await Promise.all([...new Set(candidates)].map((candidate) => fetchAsset(candidate).catch(() => null)));
    const asset = assets.find(Boolean);
    if (asset) {
      return new NextResponse(asset.body, {
        headers: {
          "content-type": asset.contentType,
          "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }
  } catch {
    // The project tile renders a local fallback when a website is offline.
  }
  return new NextResponse(null, { status: 404 });
}
