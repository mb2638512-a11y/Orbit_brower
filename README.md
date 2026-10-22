# Orbit Browser

**Download Orbit Browser for your device** — choose the matching platform below. Release downloads are intended to remain available until the release or its assets are manually removed.

## Downloads

| Device / operating system | Download |
|---|---|
| Android phone or tablet | [**Download Android APK**](https://github.com/mb2638512-a11y/Orbit_brower/releases/tag/orbit-browser-android-latest) |
| Windows 10/11 PC (x64) | [**Download Windows x64 installer (.exe)**](https://github.com/mb2638512-a11y/Orbit_brower/releases/tag/orbit-browser-windows-x64-latest) |
| Windows on ARM PC (ARM64) | [**Download Windows ARM64 installer (.exe)**](https://github.com/mb2638512-a11y/Orbit_brower/releases/tag/orbit-browser-windows-arm64-latest) |
| Linux PC (x64) | [**Download Linux x64 AppImage**](https://github.com/mb2638512-a11y/Orbit_brower/releases/tag/orbit-browser-linux-x64-latest) |
| Linux ARM64 device | [**Download Linux ARM64 AppImage**](https://github.com/mb2638512-a11y/Orbit_brower/releases/tag/orbit-browser-linux-arm64-latest) |
| Mac with Apple Silicon | [**Download macOS ARM64 (.dmg)**](https://github.com/mb2638512-a11y/Orbit_brower/releases/tag/orbit-browser-macos-arm64-latest) |
| Mac with Intel processor | [**Download macOS Intel (.dmg)**](https://github.com/mb2638512-a11y/Orbit_brower/releases/tag/orbit-browser-macos-x64-latest) |
| iPhone/iPad | [**iOS Simulator build only**](https://github.com/mb2638512-a11y/Orbit_brower/releases/tag/orbit-browser-ios-simulator-latest) — not installable on a regular iPhone/iPad |

A release page will show its file under **Assets** after its build and publishing workflow succeeds.

## Usability improvements

The mobile UI now offers quick search shortcuts in Global AI, a selectable default search provider, clearer panel labels, accessible address controls, a 20-tab session limit, and persistent bookmarks/history/search preference via local storage. The desktop shell adds Google, Bing, DuckDuckGo and Wikipedia quick-search shortcuts, responsive navigation, Ctrl/Cmd+L to focus the address bar, persistent bookmarks/history, and a clear-data action. The mobile WebView forwards supported download links to the device handler. These changes require successful platform builds and manual device testing; the download path is not a built-in download manager.

## Global AI — initial prototype

The mobile and desktop interfaces now include a Global AI hub with three areas: multi-engine search, AI model routing, and browser automation tools. The current search button opens a Google search shortcut; the UI links to SearXNG, Models.dev, and Playwright as implementation references. **This is not yet a connected 80+ engine AI service:** SearXNG must be deployed/configured, model provider APIs and server-side secrets must be added, and browser tools must be implemented and security-tested. Engine counts vary by configuration and upstream availability. Never expose provider API keys in the app client.

## Updates and releases

The mobile UI checks the relevant GitHub release when it starts and provides an Updates link. The desktop shell has an Updates shortcut to release downloads. GitHub Actions rebuilds supported packages when relevant changes are pushed to `main`. This is **release discovery, not silent auto-installation**: desktop auto-install still needs a correctly configured updater feed, signed/versioned releases, and platform-specific testing; Android installation requires user/OS approval unless distributed through a managed store; iOS requires Apple signing and App Store/TestFlight distribution. iOS Simulator builds are not regular iPhone updates.

## Current UI features

The mobile UI includes tab switching/closing, address/search bar, back/forward/reload/home, locally persisted bookmarks/history/search preference, dark/light theme, and a private-mode toggle that stops Orbit's own history list from recording new visits. Clear browsing data clears saved Orbit records and WebView cache where supported. This is not full private browsing: websites, the operating system, DNS providers, and network operators may still log activity. Desktop bookmarks/history persist locally and a clear-data control removes Orbit local records, but does not remove server logs or downloaded files.

## Engine support — read before relying on it

- **Android:** Android System WebView, based on the installed system provider.
- **iOS:** Apple's WebKit engine, as required by the platform.
- **Windows/macOS/Linux desktop:** Electron's bundled Chromium engine.
- **Firefox Gecko:** not integrated yet. It cannot be selected or used in this build.

The engine panel reports platform engine availability; it does not download or switch rendering engines. Multi-engine desktop support requires separate native engine integration and security/compatibility testing.

## Install notes

- **Android:** download the APK and allow installation from this source if Android asks. This standalone test build bundles its JavaScript.
- **Windows:** download the EXE installer. It is currently unsigned, so SmartScreen may warn.
- **Linux:** download the AppImage, make it executable if needed, then run it.
- **macOS:** download the DMG matching your processor. The app is currently unsigned, so macOS may warn before opening.
- **iOS:** the current workflow creates a Simulator package only. Regular iPhone/iPad installation requires an Apple-signed IPA/TestFlight workflow and Apple developer signing setup.

## Build status

[**Open all GitHub Actions workflows**](https://github.com/mb2638512-a11y/Orbit_brower/actions)

GitHub Actions artifacts are temporary (configured for 90 days). Release assets are the persistent download locations.

## Global AI backend (new)

A self-hosted API and SearXNG compose stack are in `global-ai/`. The API exposes `/health`, `/api/providers`, `/api/search?q=...`, and `/api/ai/chat`. Search aggregates whichever upstream engines are enabled and working in the configured SearXNG instance; it does not guarantee 80+ live engines. Chat uses an OpenAI-compatible provider configured on the server. API keys must remain server-side and must never be added to the mobile app, desktop renderer, or repository.

### Deploy (self-hosted server required)

1. Install Docker Engine and Docker Compose on a Linux server.
2. In `global-ai/`, copy `.env.example` to `.env` and configure `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`, `CORS_ORIGINS`, and `SEARXNG_URL=http://searxng:8080`.
3. Generate a SearXNG secret with `openssl rand -hex 32` and replace the placeholder in `searxng-settings.yml` before first launch. Keep `.env` private; never commit real credentials.
4. Run `docker compose up -d --build` from `global-ai/`. The API is bound to `127.0.0.1:8082`; put it behind HTTPS with a reverse proxy before connecting phones or remote devices. Do not expose it directly to the public internet without TLS, authentication, abuse protection, and monitoring.
5. Open `/health` and `/api/providers` on the configured API URL. Enter that URL in Orbit Global AI settings. AI chat needs a paid/free compatible provider endpoint and valid server-side credentials; search needs reachable configured SearXNG engines.
6. CI tests validate configuration/error paths. Real upstream search, model responses, mobile networking, and production security still need deployment/device testing.

SearXNG's JSON API requires `json` to be enabled in `search.formats`; this repository's settings file enables it. See the [official SearXNG Search API docs](https://docs.searxng.org/dev/search_api.html).

### Local Windows setup

For a no-cost first test on your Windows PC, follow [`global-ai/LOCAL-WINDOWS-SETUP.md`](global-ai/LOCAL-WINDOWS-SETUP.md). Keep the API bound to `127.0.0.1` and do not expose it publicly until authentication, HTTPS, restrictive CORS, and abuse protection are configured.

## Known limitations

Orbit Browser is still an early browser-shell prototype, not a production-grade browser. The desktop renderer currently uses an iframe and some websites block embedding; a production desktop build needs a native browser surface, stronger navigation controls, download handling, permission controls, persisted data, security review, and signed release builds.

