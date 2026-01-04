import { createRoot, Root } from "react-dom/client";
import App from "./App";
import "./index.css";

const container = document.getElementById("root")!;
// Keep a global reference to the root to avoid creating multiple roots
// during HMR reloads which can cause DOM insertion errors.
declare global {
	interface Window {
		__GAIA_ROOT__?: Root;
	}
}

if (!window.__GAIA_ROOT__) {
	window.__GAIA_ROOT__ = createRoot(container);
}

window.__GAIA_ROOT__.render(<App />);

// Accept HMR updates and re-render (Vite will handle module replacement)
if (import.meta.hot) {
	import.meta.hot.accept();
}
