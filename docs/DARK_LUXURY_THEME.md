Dark Luxury theme

Purpose
- Add a new dark 'Dark Luxury' theme with gold accents and glassmorphism feel.

How it works
- CSS variables and overrides are defined under `.luxury` in `client/src/index.css`.
- Theme selection is available in `Settings` -> `Aparência` and persists to `localStorage`.

Files changed
- `client/src/index.css` — added `.luxury` variables and small card tweaks.
- `client/src/contexts/ThemeContext.tsx` — added `luxury` theme, `setTheme` API, and improved class handling.
- `client/src/pages/Settings.tsx` — added theme selector UI (Light / Dark / Dark Luxury).

Notes
- Make sure `ThemeProvider` is used with `switchable` enabled to persist selection (already set in `client/src/App.tsx`).
- If you want to further polish visuals, tweak `.luxury` variables and `.gaia-card` overrides.
