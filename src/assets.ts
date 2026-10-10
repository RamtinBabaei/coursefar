/** Prefix only project-owned assets; uploads and external URLs stay intact. */
export function assetUrl(url: string | null | undefined, base = import.meta.env.BASE_URL) {
  if (!url?.startsWith('/assets/')) return url;
  return `${base.endsWith('/') ? base : `${base}/`}${url.slice(1)}`;
}

export function withAssetUrls<T>(value: T): T {
  if (Array.isArray(value)) return value.map(item => withAssetUrls(item)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      ['avatar', 'avatarUrl', 'cover'].includes(key) && typeof item === 'string'
        ? assetUrl(item)
        : withAssetUrls(item),
    ])) as T;
  }
  return value;
}
