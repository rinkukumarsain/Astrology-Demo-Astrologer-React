const DEFAULT_IMAGE_CDN_URL = "https://nashatra-s3.s3.ap-south-1.amazonaws.com";

/**
 * Resolves a path from the backend (often relative, e.g. astrologerimages/...) to a full URL.
 * Absolute http(s) URLs are returned unchanged.
 */
export function getBackendImageUrl(path) {
  if (path == null || path === "") return "";
  const raw = String(path).trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = (process.env.NEXT_PUBLIC_IMAGE_CDN_URL || DEFAULT_IMAGE_CDN_URL).replace(/\/$/, "");
  return `${base}/${raw.replace(/^\//, "")}`;
}
