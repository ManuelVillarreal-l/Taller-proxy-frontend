# AI Consumption Platform - Frontend

React 18 + Vite + Recharts client for the AI gateway backend.

## Run locally

```bash
cp .env.example .env   # set VITE_API_URL to your backend URL
npm install
npm run dev
```

## Build

```bash
npm install && npm run build
```

## Deploy on Vercel

Import the repository, keep the Vite defaults and add the environment variable
`VITE_API_URL` pointing to the Railway backend URL (without trailing slash).
