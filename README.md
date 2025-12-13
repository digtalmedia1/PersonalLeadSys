# PersonalLeadSys
מערכת ניהול אישית

## Deploying to Hostinger (SPA-compatible)

1. Run a production build locally:
   ```bash
   npm run build
   ```
2. Upload the contents of the generated `dist/` directory to your Hostinger site.
3. Include the provided `.htaccess` file (located in `public/.htaccess`) alongside the upload so all non-file, non-directory requests are rewritten to `index.html`. This keeps client-side routes working on deep links.
