# Prime Odontologia OS

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with your app variables:

```env
VITE_ID=your_app_id
VITE_BASE_URL=your_backend_url
```

3. Start dev server:

```bash
npm run dev
```

## Deploy from GitHub to `primeos.primeodontologia.com.br`

This repository is configured to deploy automatically to GitHub Pages using:

- `.github/workflows/deploy-primeos-pages.yml`
- `npm run build:pages` (builds for root and writes `dist/CNAME`)

### 1) Enable GitHub Pages

In GitHub:

- Go to `Settings` → `Pages`
- In **Build and deployment**, set **Source** to **GitHub Actions**

Every push to `main` will publish a new build.

### 2) Configure the custom domain in GitHub Pages

In the same Pages settings:

- Set **Custom domain** to `primeos.primeodontologia.com.br`
- Keep **Enforce HTTPS** enabled after DNS is valid

### 3) Create DNS records (at your DNS provider)

Create a `CNAME` record:

- **Host/Name:** `primeos`
- **Target/Value:** `omniosapp.github.io`

After DNS propagates, the app will open at:

- `https://primeos.primeodontologia.com.br`

## Build commands

- Standard build: `npm run build`
- Build for root/subdomain: `npm run build:primeos`
- Build for GitHub Pages (includes SPA fallback): `npm run build:pages`

- # Create applications with the Copilot CLI

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey OmniOsApp!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/PrimeOsApp/PrimeOsDev/issues/1)

---

&copy; 2025 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)
