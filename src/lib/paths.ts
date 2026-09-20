// Used only while rendering static pages; the same prefix is supplied to Astro.
const base = process.env.BASE_PATH || '/';
export const url = (path = '') => `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
