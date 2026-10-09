/** Resolve authored artwork paths without changing content when origins change. */
export function resolveAssetUrl(
  path: string,
  assetBaseUrl: string | undefined,
  appBaseUrl: string,
): string {
  if (/^https?:\/\//i.test(path)) return path
  const base = (assetBaseUrl?.trim() || appBaseUrl).replace(/\/+$/, '')
  return `${base}/${path.replace(/^\/+/, '')}`
}
