/**
 * Visitor-selectable site themes. Colours live in src/styles/themes.css (one block per id);
 * `swatches` are only for the picker preview. `meta` is the browser address-bar colour.
 */
export const themes = [
  { id: 'classic', swatches: ['#D2161E', '#F0A830', '#FFFCF7'], meta: '#D2161E' },
  { id: 'noir', swatches: ['#111111', '#E3A008', '#FFFFFF'], meta: '#111111' },
  { id: 'fresh', swatches: ['#1E7B4A', '#F2A93B', '#FAFCF8'], meta: '#1E7B4A' },
];
export const DEFAULT_THEME = 'classic';
