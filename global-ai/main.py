import os, time
from collections import defaultdict, deque
from typing import Optional
import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Orbit Global AI API", version="0.1.0")
origins = [x.strip() for x in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",") if x.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=False, allow_methods=["GET","POST","OPTIONS"], allow_headers=["Content-Type","Authorization"])
buckets = defaultdict(deque)
def rate_limit(request: Request):
    key = request.client.host if request.client else "unknown"
    now = time.time(); q = buckets[key]
    while q and q[0] < now - 60: q.popleft()
    if len(q) >= int(os.getenv("RATE_LIMIT_PER_MINUTE", "30")):
        raise HTTPException(status_code=429, detail="Rate limit reached; wait one minute.")
    q.append(now)

class ChatRequest(BaseModel):
    messages: list[dict] = Field(min_length=1, max_length=30)
    model: Optional[str] = None

@app.get("/health")
async def health():
    return {"ok": True, "service": "orbit-global-ai", "search_configured": bool(os.getenv("SEARXNG_URL")), "ai_configured": bool(os.getenv("AI_BASE_URL") and os.getenv("AI_API_KEY") and os.getenv("AI_MODEL"))}

@app.get("/api/search")
async def search(request: Request, q: str = Field(min_length=1, max_length=300)):
    rate_limit(request)
    base = os.getenv("SEARXNG_URL", "").rstrip("/")
    if not base: raise HTTPException(status_code=503, detail="Search backend is not configured. Set SEARXNG_URL.")
    try:
        async with httpx.AsyncClient(timeout=12, follow_redirects=False) as client:
            response = await client.get(base + "/search", params={"q": q, "format": "json", "language": "all"})
            response.raise_for_status()
            payload = response.json()
    except (httpx.HTTPError, ValueError):
        raise HTTPException(status_code=502, detail="Search provider is temporarily unavailable.")
    results = []
    for item in payload.get("results", [])[:20]:
        url = item.get("url", "")
        if not url.startswith(("https://", "http://")): continue
        results.append({"title": str(item.get("title") or url)[:300], "url": url, "content": str(item.get("content") or "")[:800], "engine": str(item.get("engine") or "unknown")[:80]})
    return {"query": q, "count": len(results), "results": results}

@app.post("/api/ai/chat")
async def chat(body: ChatRequest, request: Request):
    rate_limit(request)
    base = os.getenv("AI_BASE_URL", "").rstrip("/")
    key = os.getenv("AI_API_KEY", "")
    model = body.model or os.getenv("AI_MODEL", "")
    if not base or not key or not model:
        raise HTTPException(status_code=503, detail="AI is not configured. Set AI_BASE_URL, AI_API_KEY and AI_MODEL on the server.")
    safe_messages = []
    for m in body.messages:
        role = m.get("role")
        content = m.get("content")
        if role not in ("system", "user", "assistant") or not isinstance(content, str):
            raise HTTPException(status_code=422, detail="Messages must have a valid role and text content.")
        safe_messages.append({"role": role, "content": content[:12000]})
    try:
        async with httpx.AsyncClient(timeout=45, follow_redirects=False) as client:
            response = await client.post(base + "/chat/completions", headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"}, json={"model": model, "messages": safe_messages, "temperature": 0.3})
            response.raise_for_status()
            data = response.json()
        answer = data.get("choices", [{}])[0].get("message", {}).get("content")
        if not isinstance(answer, str): raise ValueError("No assistant text")
        return {"model": model, "answer": answer[:20000]}
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=502, detail=f"AI provider returned HTTP {exc.response.status_code}.")
    except (httpx.HTTPError, ValueError, KeyError, IndexError):
        raise HTTPException(status_code=502, detail="AI provider is temporarily unavailable.")

@app.get("/api/providers")
async def providers():
    return {"search": {"type":"SearXNG", "configured": bool(os.getenv("SEARXNG_URL"))}, "ai": {"type":"OpenAI-compatible API", "configured": bool(os.getenv("AI_BASE_URL") and os.getenv("AI_API_KEY") and os.getenv("AI_MODEL"))}, "note":"Available upstream engines/models depend on your configured services and credentials."}
