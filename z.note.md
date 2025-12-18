These are the notes for the project.

## External install
1. Ghostscript: [text](https://www.ghostscript.com/releases/gsdnld.html)

## Deployment Checklist

### 1. Frontend (`frontend/`)
- **API URL in `next.config.ts`**:
    - Currently, `rewrites` points to `http://localhost:3001`. 
    - In production, update this to your live backend URL (e.g., `https://api.pdfwiser.com`).
- **Build Step**: Run `npm run build` followed by `npm start`.
- **Environment Variables**: Use `.env.production` to store `NEXT_PUBLIC_API_URL` if you stop using Next.js rewrites and call the API directly.

### 2. Backend (`backend/`)
- **CORS Configuration**:
    - Update the `cors()` middleware in `src/index.ts` to allow your production site domain (e.g., `https://pdfwiser.com`).
- **Environment Variables**:
    - `PORT`: Set via environment variable (default is 3001).
- **Puppeteer**:
    - On Linux servers (AWS, DigitalOcean, etc.), you must install Chrome dependencies or use a buildpack that includes them (like Railway's `nixpacks`).

### 3. Server Configuration (Nginx/Proxy)
- **Client Body Size**: 
    - If using Nginx, ensure `client_max_body_size 500M;` is set.
    - If using Next.js rewrites (Proxy), ensure `experimental.middlewareClientMaxBodySize` in `next.config.ts` matches your needs (currently 500mb).

### 4. Dependencies
- **Ghostscript**: Must be installed and available in the system `PATH` on the production server for the Compress PDF tool to work.
- **Node Version**: Use Node 18+ for both frontend and backend.