export function getRedirectUrl() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL;
  if (baseUrl === undefined) {
    throw new Error(
      "Missing baseUrl. Did you forget to set NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_VERCEL_URL?",
    );
  }
  let url = baseUrl.includes("http") ? baseUrl : `https://${baseUrl}`;
  return url.charAt(url.length - 1) === "/" ? url : `${url}/`;
}
