# Aftercode Desktop

Aftercode is a rebranded fork of OpenCode Desktop. It keeps the upstream Electron + SolidJS desktop client and OpenCode CLI runtime, while using Aftercode app identity, icons, wordmark and UI copy. The upstream source snapshot is pinned in [UPSTREAM_VERSION.md](UPSTREAM_VERSION.md).

## Development

Requirements: Bun 1.4.4 and the toolchain for the platform you are building on.

```powershell
bun install --frozen-lockfile --filter @opencode/desktop
bun run dev:desktop
```

To create a packaged desktop build for the current platform:

```powershell
bun run --cwd packages/desktop build
bun run --cwd packages/desktop pack
```

On Windows, the unpacked app is copied to `dist/desktop/app/Aftercode Dev.exe`. Release builds should set `OPENCODE_CHANNEL=prod` and provide an `AFTERCODE_UPDATE_URL` pointing to an Aftercode-owned generic update feed. Without that variable, updater checks safely return no update; Aftercode does not query or install OpenCode releases.

## Source and licensing

The original OpenCode MIT license and copyright notices remain in [LICENSE](LICENSE). Preserve them in source distributions and installers. OpenCode and OpenCode Console names remain only where they identify the upstream runtime, provider, source project or legal notices. Aftercode uses separate app identifiers and icons.

