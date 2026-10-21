# Orbit Browser

Expo / React Native mobile prototype plus experimental Windows/Linux desktop shells.

## Build outputs
- Android APK: `Build Orbit Browser Android APK`
- iOS Simulator app: `Build Orbit Browser iOS Simulator` (not a signed iPhone IPA)
- Windows x64 installer: `Build Orbit Browser Windows and Linux`
- Linux x64 AppImage: `Build Orbit Browser Windows and Linux`

Use GitHub → Actions to inspect builds and download their artifacts. The `builds/android`, `builds/ios`, `builds/windows`, and `builds/linux` folders document platform outputs; generated binaries are stored as Actions artifacts, not committed into Git.

## Important limitations
The desktop version is an experimental Electron shell using an embedded web frame. It is not yet a production-grade Chromium browser. Some websites block embedding; a hardened production browser should use a maintained browser engine and stricter origin isolation. Signed iOS distribution requires Apple credentials.
