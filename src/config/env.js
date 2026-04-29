// Centralised env config for the FE.
// Single source of truth — every service / component imports from here so we
// never end up with localhost fallbacks scattered across the codebase.
//
// Default `/api/v1` is a RELATIVE path: the browser resolves it against the
// current origin, which works in production (https://stydu4.online) and in dev
// when paired with a Vite proxy (see vite.config.js).
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
