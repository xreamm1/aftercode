# Contributing to Aftercode

Thanks for helping improve Aftercode. Use the GitHub repository for bug reports, feature requests, and pull requests.

## Report a problem

Open an [Aftercode issue](https://github.com/xreamm1/aftercode/issues) and include the app version, operating system, steps to reproduce, and relevant logs. Do not include API keys, access tokens, or private source code.

## Development setup

Aftercode uses Bun 1.4.4. Install dependencies from the repository root:

```bash
bun install --frozen-lockfile
```

Start the desktop app:

```bash
bun run dev:desktop
```

For platform-specific instructions, see [AFTERCODE.md](AFTERCODE.md).

To build the Android APK, install Android SDK Platform 36 and Build Tools 36, set `JAVA_HOME` to JDK 17, then run:

```powershell
bun run --cwd packages/android apk
```

## Changes and pull requests

- Keep each change focused and explain the user-facing problem it solves.
- Include screenshots or a short recording for visible interface changes.
- Add or update checks when behavior changes, and report the commands you ran.
- Do not commit API keys, credentials, generated installers, or local build output.
- Link related Aftercode issues when applicable.

Open pull requests against the `main` branch of [xreamm1/aftercode](https://github.com/xreamm1/aftercode).
