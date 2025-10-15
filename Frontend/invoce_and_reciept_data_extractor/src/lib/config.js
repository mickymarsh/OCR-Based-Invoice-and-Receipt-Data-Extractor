// Centralized frontend config for API base URL
// Reads from NEXT_PUBLIC_BACKEND_URL so it is exposed to the browser at build/runtime.
// Falls back to http://127.0.0.1:8000 if not set.
const raw = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
// Remove trailing slash to avoid double slashes when concatenating paths
export const API_BASE = raw.replace(/\/$/, '');
