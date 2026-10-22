# Run Orbit Global AI locally on Windows 10/11

This is a development/test setup, not a public deployment. The API binds to `127.0.0.1:8082` and is intended to be reachable only from this PC.

## Prerequisites
- Git for Windows
- Docker Desktop with the WSL 2 backend enabled
- An AI provider API key if you want AI chat/research; provider quota may cost money
- Search-only startup does not require an AI key, but it does require a reachable SearXNG service

## Start the services
1. Open PowerShell and clone the repository to a drive with enough space, e.g. `D:\Projects`:
```powershell
New-Item -ItemType Directory -Force D:\Projects
Set-Location D:\Projects
git clone https://github.com/mb2638512-a11y/Orbit_brower.git
Set-Location Orbit_brower\global-ai
```
2. Create a private `.env` from the example:
```powershell
Copy-Item .env.example .env
```
3. Open `.env` in Notepad and set `SEARXNG_URL=http://searxng:8080`, your provider's `AI_BASE_URL`, `AI_API_KEY`, and supported `AI_MODEL`. For local-only development set `CORS_ORIGINS=*`; do not expose this configuration publicly. Use explicit trusted origins in a real deployment.
4. Generate a unique SearXNG secret and replace the placeholder in `searxng-settings.yml`. Prefer a cryptographically secure generator such as `openssl rand -hex 32` when available. Never commit real secrets.
5. Start the stack:
```powershell
docker compose up -d --build
docker compose ps
```
6. Open `http://127.0.0.1:8082/health`. It should report `ok: true`. `ai_configured` is true only when all AI environment values are present.
7. In Orbit Browser's Global AI panel, enter `http://127.0.0.1:8082` as the backend URL and try Search, Ask AI, and Research + Sources.

## Common commands
- Logs: `docker compose logs -f global-ai searxng`
- Restart after `.env` changes: `docker compose up -d --build`
- Stop: `docker compose down`
- Provider configuration status (does not return the API key): `http://127.0.0.1:8082/api/providers`

## Safety notes
- Never commit `.env`, paste keys into chat, or put provider keys in the app UI.
- The API has IP-based rate limiting but no user authentication. Keep it loopback-only during local testing.
- Do not expose port 8082 to the internet. Remote use requires HTTPS, authentication, restrictive CORS, abuse protection, and monitoring.
- The number of working search engines depends on enabled SearXNG engines and availability; this setup does not guarantee 80+ engines.
- AI chat/research requires valid provider credentials. A consumer AI subscription does not necessarily include API credits.

## If Docker is not available
The API can be run directly with Python 3.12+:
```powershell
cd global-ai
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```
Set `SEARXNG_URL` and AI variables in the current PowerShell session, then run:
```powershell
uvicorn main:app --host 127.0.0.1 --port 8082
```
This Python option does not start SearXNG; configure a separate reachable SearXNG instance first.
