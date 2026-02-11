const STORAGE_KEY = 'visitor_fingerprint';

export function getFingerprint(): string {
  if (typeof window === 'undefined') return '';

  let fingerprint = localStorage.getItem(STORAGE_KEY);
  if (!fingerprint) {
    fingerprint = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, fingerprint);
  }
  return fingerprint;
}
