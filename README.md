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

The mobile UI now offers quick search shortcuts in Global AI, clearer panel labels, accessible address controls, and a 20-tab session limit. The desktop shell adds Google, Bing, DuckDuckGo and Wikipedia quick-search shortcuts, responsive navigation, and Ctrl/Cmd+L to focus the address bar. These are UI-level improvements and still require successful platform builds and manual device testing. Bookmarks/history remain in-memory and do not persist after restart.

## Global AI — initial prototype

The mobile and desktop interfaces now include a Global AI hub with three areas: multi-engine search, AI model routing, and browser automation tools. The current search button opens a Google search shortcut; the UI links to SearXNG, Models.dev, and Playwright as implementation references. **This is not yet a connected 80+ engine AI service:** SearXNG must be deployed/configured, model provider APIs and server-side secrets must be added, and browser tools must be implemented and security-tested. Engine counts vary by configuration and upstream availability. Never expose provider API keys in the app client.

## Updates and releases

The mobile UI checks the relevant GitHub release when it starts and provides an Updates link. The desktop shell has an Updates shortcut to release downloads. GitHub Actions rebuilds supported packages when relevant changes are pushed to `main`. This is **release discovery, not silent auto-installation**: desktop auto-install still needs a correctly configured updater feed, signed/versioned releases, and platform-specific testing; Android installation requires user/OS approval unless distributed through a managed store; iOS requires Apple signing and App Store/TestFlight distribution. iOS Simulator builds are not regular iPhone updates.

## Current UI features

The mobile UI includes tab switching/closing, address/search bar, back/forward/reload/home, in-memory bookmarks and history, dark/light theme, and a private-mode toggle that stops Orbit's own history list from recording new visits. These are prototype features; bookmarks/settings are not yet persisted across app restarts, and private mode does not prevent websites, the operating system, DNS providers, or network operators from logging activity.

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

## Known limitations

Orbit Browser is still an early browser-shell prototype, not a production-grade browser. The desktop renderer currently uses an iframe and some websites block embedding; a production desktop build needs a native browser surface, stronger navigation controls, download handling, permission controls, persisted data, security review, and signed release builds.

