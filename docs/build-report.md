# Build Report
- **Command:** `npm run build`
- **Status:** Success
- **Notes:** npm displays the warning `Unknown env config "http-proxy"` when the environment variable `npm_config_http_proxy` is set. The warning does not fail the build. Clear it via `npm config delete http-proxy` or by unsetting the environment variable before running the build.
- **Artifacts:**
  - `dist/index.html` – 4.53 kB (gzip: 1.80 kB)
  - `dist/assets/index-d7825f6a.css` – 99.97 kB (gzip: 14.16 kB)
  - `dist/assets/index-abddcc6f.js` – 821.65 kB (gzip: 226.26 kB)
- **Timestamp:** 2025-12-17 14:59:19 UTC
