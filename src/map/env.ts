/**
 * Mapbox / site env vars — isolated so Jest can mock this module
 * instead of wrestling with import.meta at test-runtime.
 */
const _env = (import.meta.env as Record<string, string> | undefined) ?? {};

/** Mapbox public access token (required for MapWidget). */
export const MAPBOX_TOKEN: string = _env.VITE_MAPBOX_TOKEN ?? '';

/** Geo-centre longitude of the pilot site (degrees). */
export const PILOT_LNG: number = parseFloat(_env.VITE_SITE_CENTER_LNG ?? '-0.1');

/** Geo-centre latitude of the pilot site (degrees). */
export const PILOT_LAT: number = parseFloat(_env.VITE_SITE_CENTER_LAT ?? '51.5');
