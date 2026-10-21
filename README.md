# Orbit Browser

Expo / React Native browser prototype.

## Platform builds
- Android: GitHub Actions builds an installable debug APK. Download the `Orbit-Browser-Android-APK` artifact from the completed Android workflow.
- iOS: GitHub Actions builds a simulator app archive. An installable iPhone IPA requires Apple signing credentials and provisioning profiles.

Build workflow files are under `.github/workflows/`. The `builds/android/` and `builds/ios/` folders document where the platform build artifacts belong; compiled binaries are published as workflow artifacts rather than committed to Git.
