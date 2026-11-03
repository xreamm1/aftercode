# Aftercode Desktop

Aftercode Desktop is an open-source AI coding app for Windows, macOS, and Linux. This repository contains the desktop client, its app branding, and the coding-agent runtime. The source snapshot and required license notices are documented in [UPSTREAM_VERSION.md](UPSTREAM_VERSION.md) and [LICENSE](LICENSE).

## Development

Requirements: Bun 1.4.4 and the toolchain for the platform you are building on.

The current public desktop installer is for Windows x64: [download Aftercode Desktop](https://github.com/xreamm1/aftercode/releases/latest).

```powershell
bun install --frozen-lockfile --filter @opencode/desktop
bun run dev:desktop
```

To create a packaged desktop build for the current platform:

```powershell
bun run --cwd packages/desktop build
bun run --cwd packages/desktop pack
```

On Windows, the unpacked app is copied to `dist/desktop/app/Aftercode Dev.exe`. Release builds should set `OPENCODE_CHANNEL=prod` and provide `AFTERCODE_UPDATE_URL` for an Aftercode update feed. Without that variable, automatic updates stay disabled.

## Source and licensing

The upstream MIT license and copyright notices remain in [LICENSE](LICENSE). Preserve them in source distributions and installers. Aftercode uses its own app name, icons, and identifiers.

