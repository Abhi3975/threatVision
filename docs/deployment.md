# Deployment Guide

ThreatWatch-AI runs as three pieces: a Next.js frontend on Vercel, and the backend API
plus the Python AI service on Railway, backed by Railway PostgreSQL.

```
Vercel (frontend)  ──►  Railway (backend API + WebSocket)  ──►  Railway PostgreSQL
                                     ▲
                        Railway (AI detection service)
```

## 1. Database — Railway PostgreSQL

Create a Railway project and add a PostgreSQL database:

```bash
railway init --name threatvision
railway add --database postgres
```

Railway exposes the connection string as `DATABASE_URL` on the Postgres service.

## 2. Backend — Railway

Create the backend service and point it at the database. The backend creates its schema
and seeds sample data automatically on first boot.

```bash
railway add --service backend \
  --variables 'DATABASE_URL=${{Postgres.DATABASE_URL}}' \
  --variables 'DEMO_MODE=true' \
  --variables 'CLIENT_ORIGIN=*'

cd backend
railway up --service backend
railway domain --service backend   # generates a public URL
```

Environment variables:

| Variable        | Purpose                                             |
| --------------- | --------------------------------------------------- |
| `DATABASE_URL`  | PostgreSQL connection string                        |
| `DEMO_MODE`     | `true` runs the built-in detection simulator        |
| `CLIENT_ORIGIN` | Allowed CORS origin (`*` or the Vercel URL)         |
| `PORT`          | Injected by Railway                                 |

## 3. AI Service — Railway

The AI service ships with a Dockerfile (Python 3.11 + OpenCV + YOLOv8). Point it at the
backend so detections are reported back.

```bash
railway add --service ai \
  --variables 'BACKEND_URL=https://<your-backend>.up.railway.app'

cd ai-service
railway up --service ai
railway domain --service ai
```

The service is idle until a video or stream is submitted to `/process`; the dashboard
itself is driven by the backend simulator in demo mode.

## 4. Frontend — Vercel

Deploy the `frontend` directory and set the API URL to the backend's public URL.

```bash
cd frontend
vercel link --project threatvision
vercel env add NEXT_PUBLIC_API_URL production   # value: the backend URL
vercel deploy --prod
```

That's it — open the Vercel URL and the dashboard connects to the backend over REST and
WebSocket, with data served from PostgreSQL.

## Notes

- `NEXT_PUBLIC_API_URL` is read at build time, so redeploy the frontend if the backend
  URL changes.
- Evidence frames are written to the container filesystem, which is ephemeral on Railway.
  They are regenerated as new detections come in, which is fine for a demo.
- Set `DEMO_MODE=false` on the backend when feeding real footage through the AI service.
