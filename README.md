# Orbit Browser

Experimental Orbit Browser prototype with mobile and desktop build workflows. Use the `platform-builds` branch; `main` remains separate.

## Download options by device
- **Android phones/tablets:** `builds/android` — debug APK for testing.
- **Windows 10/11 x64 laptops/PCs:** `builds/windows` — EXE installer.
- **Linux x86_64:** `builds/linux` — AppImage.
- **Mac Apple Silicon:** `builds/macos` — arm64 DMG.
- **Mac Intel:** `builds/macos` — x64 DMG.
- **iPhone/iPad:** `builds/ios` — current artifact is simulator-only; real device install requires signed IPA/TestFlight.
- **Android ARM / Windows ARM / Linux ARM:** not currently built.

## How to download
Open GitHub → Actions → select a successful platform workflow run → download its matching artifact at the bottom of the run page. Artifacts are temporary and retained for 14 days. Do not use a build until its workflow is green.

## Limitations
This is an early browser-shell prototype, not a production-grade Chromium browser. Website embedding restrictions, browser security, privacy isolation, tabs, bookmarks, extensions, and release signing still need further work. Windows/macOS installers are unsigned; Android APK is debug-signed.
