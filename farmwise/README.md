# 🌾 FarmWise — Smart GPS Farming Intelligence

A real-time farming intelligence app built with React + Vite. Deployable to Vercel in one click.

## Features

- **📍 GPS Land Measurement** — Walk your farm boundary, drop GPS points at each corner, auto-calculates area (m², acres) and perimeter
- **🗺 Multiple Plots** — Add and manage multiple named land plots
- **🪱 Soil Analysis** — Auto-detected soil type + pH from GPS coordinates
- **🌱 Crop Recommendations** — Search 33+ crops (coconut, rose, wheat, cotton, turmeric…) with seed quantity calculator and NPK fertilizer guide per acre
- **🤖 AI Farm Advisor** — Claude AI answers farm-specific questions with context from your GPS, soil, and land area
- **🌧 Rainfall Data** — Real ERA5 historical data (2020–2025) + live YTD via Open-Meteo, year-on-year charts, monthly averages, climate anomaly log
- **💧 Groundwater** — Depth estimation, 5-year trend, Jun–Nov monsoon forecast, irrigation efficiency guide
- **📅 7-Day Forecast** — Live weather from Open-Meteo

## Data Sources

| Data | Source |
|------|--------|
| Historical rainfall 2020–2025 | Open-Meteo ERA5 Archive API |
| Current year YTD rainfall | Open-Meteo Forecast API (past_days) |
| 7-day weather forecast | Open-Meteo Forecast API |
| Groundwater | Estimated from ERA5 rainfall + soil recharge model |
| Land area | Device GPS (Shoelace/Gauss formula) |
| AI advice | Anthropic Claude API |

## Deploy to Vercel

### Option 1 — Vercel CLI
```bash
npm install
vercel
```

### Option 2 — GitHub Import
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Framework: **Vite** (auto-detected)
4. Build command: `npm run build`
5. Output directory: `dist`
6. Click **Deploy**

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Environment

No `.env` needed — all APIs are public (Open-Meteo is free, no key required). The Anthropic API key is handled by the Claude.ai artifact proxy when running inside Claude. For standalone deployment you'll need to add your own key — see note below.

### Adding your Anthropic API Key for standalone deploy

In `src/App.jsx`, find the `askAI` function and add your key to the fetch headers:

```js
headers: {
  "Content-Type": "application/json",
  "x-api-key": "YOUR_ANTHROPIC_API_KEY",
  "anthropic-version": "2023-06-01",
}
```

Or set `VITE_ANTHROPIC_KEY` in your Vercel environment variables and reference it as `import.meta.env.VITE_ANTHROPIC_KEY`.

> ⚠️ Never commit API keys to Git. Use Vercel environment variables.

## Tech Stack

- React 18
- Vite 5
- Open-Meteo API (free, no key)
- Anthropic Claude API
- Device GPS (Web Geolocation API)
- Canvas 2D for map rendering
- Pure inline CSS (no external UI library)
