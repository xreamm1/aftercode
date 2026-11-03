# Aftercode Desktop

Aftercode Desktop is an open-source AI coding app for Windows, macOS, and Linux. This repository contains the desktop client, its app branding, and the coding-agent runtime. The source snapshot and required license notices are documented in [UPSTREAM_VERSION.md](UPSTREAM_VERSION.md) and [LICENSE](LICENSE).

## Development

Requirements: Bun 1.4.4 and the toolchain for the platform you are building on.

The current public desktop installer is for Windows x64: [download Aftercode Desktop](https://github.com/xreamm1/aftercode/releases/latest).

The Android app packages the shared mobile web interface with Capacitor. It connects to an Aftercode server running on a computer or other reachable host; the Android package does not run the agent backend locally.

```powershell
bun install --frozen-lockfile --filter @opencode/desktop
bun run dev:desktop
```

To create a packaged desktop build for the current platform:

```powershell
bun run --cwd packages/desktop build
bun run --cwd packages/desktop pack
```

## Android APK

Requirements: Android SDK Platform 36, Android Build Tools 36, and JDK 17.

```powershell
bun run --cwd packages/android apk
```

The installable debug APK is written to `dist/release/Aftercode-Android.apk`. On Android, connect to the server address shown by the host and pair the app. Use HTTPS outside a trusted local network.

On Windows, the unpacked app is copied to `dist/desktop/app/Aftercode.exe`. Release builds should set `OPENCODE_CHANNEL=prod` and provide `AFTERCODE_UPDATE_URL` for an Aftercode update feed. Without that variable, automatic updates stay disabled.

## Source and licensing

The upstream MIT license and copyright notices remain in [LICENSE](LICENSE). Preserve them in source distributions and installers. Aftercode uses its own app name, icons, and identifiers.

