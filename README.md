# Orbit Browser

**Download Orbit Browser for your device** — choose the matching platform below. Release downloads are intended to remain available until the release or its assets are manually removed.

## Downloads

| Device / operating system | Download |
|---|---|
| Android phone or tablet (ARM64/ARM) | [**Download Android APK**](https://github.com/mb2638512-a11y/Orbit_brower/releases/tag/orbit-browser-android-latest) |
| Windows 10/11 PC (64-bit Intel/AMD, x64) | [**Download Windows x64 installer (.exe)**](https://github.com/mb2638512-a11y/Orbit_brower/releases/tag/orbit-browser-windows-x64-latest) |
| Windows on ARM PC (ARM64) | [**Download Windows ARM64 installer (.exe)**](https://github.com/mb2638512-a11y/Orbit_brower/releases/tag/orbit-browser-windows-arm64-latest) |
| Linux PC (64-bit Intel/AMD, x64) | [**Download Linux x64 AppImage**](https://github.com/mb2638512-a11y/Orbit_brower/releases/tag/orbit-browser-linux-x64-latest) |
| Linux ARM64 device | [**Download Linux ARM64 AppImage**](https://github.com/mb2638512-a11y/Orbit_brower/releases/tag/orbit-browser-linux-arm64-latest) |
| Mac with Apple Silicon (M-series) | [**Download macOS ARM64 (.dmg)**](https://github.com/mb2638512-a11y/Orbit_brower/releases/tag/orbit-browser-macos-arm64-latest) |
| Mac with Intel processor | [**Download macOS Intel (.dmg)**](https://github.com/mb2638512-a11y/Orbit_brower/releases/tag/orbit-browser-macos-x64-latest) |
| iPhone/iPad | [**iOS Simulator build only**](https://github.com/mb2638512-a11y/Orbit_brower/releases/tag/orbit-browser-ios-simulator-latest) — not installable on a regular iPhone/iPad |

**Note:** A release page will show its file under **Assets** after the matching build and publishing workflow succeeds. If it says no assets are available yet, that platform's build has not finished publishing.

## Install notes

- **Android:** download the APK, open it, and allow installation from this source if Android asks. This is a standalone testing build; it bundles JavaScript and does not require Metro.
- **Windows:** download the EXE installer. It is currently unsigned, so Windows SmartScreen may show a warning.
- **Linux:** download the AppImage, make it executable if needed, then run it.
- **macOS:** download the DMG matching your processor. The app is currently unsigned, so macOS may warn before opening.
- **iOS:** the current workflow creates an iOS Simulator package only. A normal iPhone/iPad installation needs an Apple-signed IPA/TestFlight workflow.

## Build status and temporary artifacts

[**Open all build workflows**](https://github.com/mb2638512-a11y/Orbit_brower/actions)

GitHub Actions artifacts are temporary (configured for 90 days). The platform release pages above are the persistent download locations; releases/assets are not automatically removed after 90 days, but can be removed manually or under repository/account policies.

## Important limitations

This is an early browser-shell prototype, not a production-grade Chromium browser. Some websites block embedding. Full browser-engine capabilities, robust privacy/process isolation, production security review, complete tab/bookmark/extension support, and signed release builds still require further development.

The build workflows and documentation are now merged into `main`; `platform-builds` is also retained.
