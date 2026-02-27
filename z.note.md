These are the notes for the project.

## External Dependencies Installation (Linux Server)

### 1. Ghostscript (Required for: Compress PDF)
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y ghostscript

# Verify installation
gs --version
```

### 2. LibreOffice (Required for: Doc to PDF, PPT to PDF, Excel to PDF)
```bash
# Ubuntu/Debian
sudo apt-get install -y libreoffice

# Verify installation
libreoffice --version
```
### 3. Install python
install python programming language as well as modules and packages from the website. 
### 4. Chromium Dependencies (Required for: Markdown to PDF)
Puppeteer auto-downloads Chromium on `npm install`, but Linux servers need these system dependencies:
```bash
# Ubuntu/Debian
sudo apt-get install -y \
  ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 \
  libatk1.0-0 libcups2 libdbus-1-3 libdrm2 libgbm1 libgtk-3-0 \
  libnspr4 libnss3 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
  libxss1 libxtst6 xdg-utils fonts-ipafont-gothic fonts-wqy-zenhei \
  fonts-thai-tlwg fonts-kacst fonts-freefont-ttf
```

### Quick Install All Dependencies (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install -y ghostscript libreoffice \
  ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 \
  libatk1.0-0 libcups2 libdbus-1-3 libdrm2 libgbm1 libgtk-3-0 \
  libnspr4 libnss3 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
  libxss1 libxtst6 xdg-utils fonts-ipafont-gothic fonts-wqy-zenhei \
  fonts-thai-tlwg fonts-kacst fonts-freefont-ttf
```

---

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
### 5. Server installation:
 for doc, ppt, excel file converting need to install libraoffice on the server.