const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 128 128"><rect x="16" y="16" width="96" height="96" rx="12" fill="#FFFFFF" stroke="#111827" stroke-width="8"/><path d="M36 42h48M36 62h56M36 82h36" stroke="#5B6472" stroke-width="7" stroke-linecap="round"/><path d="M32 30v68" stroke="#DDE2E8" stroke-width="5" stroke-linecap="round"/><rect x="76" y="76" width="34" height="34" rx="8" fill="#0F766E"/><path d="M84 94l7 7 13-17" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export function GET() {
  return new Response(faviconSvg, {
    headers: {
      "content-type": "image/svg+xml",
      "cache-control": "public, max-age=31536000, immutable"
    }
  });
}
