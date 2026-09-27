export function classifySourceResponse(url, finalUrl, status) {
  if ([404, 410].includes(status)) return 'missing';
  if (status !== 200) return 'access-unverified';
  const original = new URL(url);
  const final = new URL(finalUrl);
  const normalize = (value) => decodeURIComponent(value).replace(/\/+$/, '').toLowerCase();
  if (normalize(original.pathname) !== normalize(final.pathname) || original.search !== final.search) return 'redirect-review';
  if (original.hostname.replace(/^www\./, '') !== final.hostname.replace(/^www\./, '')) return 'redirect-review';
  return 'reachable-not-fact-checked';
}
