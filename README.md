# Aftercode Desktop

<p align="center">
  <img src="Aftercode-wordmark.png" alt="Aftercode" width="420">
</p>

<p align="center">An open source AI coding assistant for your desktop.</p>

<p align="center">
  <a href="https://github.com/xreamm1/aftercode/releases"><img alt="Releases" src="https://img.shields.io/github/v/release/xreamm1/aftercode?style=flat-square"></a>
  <a href="https://github.com/xreamm1/aftercode/releases"><img alt="Downloads" src="https://img.shields.io/github/downloads/xreamm1/aftercode/total?style=flat-square"></a>
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/github/license/xreamm1/aftercode?style=flat-square"></a>
</p>

Aftercode brings AI-assisted coding into a desktop app. Open a project, choose a model provider, and work with your code in a local session.

## Download

| Platform | Download | How it works |
| --- | --- | --- |
| Windows x64 | [Aftercode Desktop installer](https://github.com/xreamm1/aftercode/releases/latest/download/Aftercode-Desktop-Setup-Windows-x64.exe) | Runs the coding agent on your PC. |
| Android | [Aftercode APK](https://github.com/xreamm1/aftercode/releases/latest/download/Aftercode-Android.apk) | Connects to an Aftercode server running on your PC or another host. |

The Windows installer creates an Aftercode Desktop shortcut for the current user. The Android app uses the same Aftercode interface and connects to a running server; it does not run the coding agent or access PC project files by itself.

## Getting started

1. Install and open Aftercode Desktop.
2. Choose a model provider in **Settings → Providers** and add your API key.
3. Open a project folder and start a coding session.

## Project links

- [Releases](https://github.com/xreamm1/aftercode/releases)
- [Documentation and build instructions](AFTERCODE.md)
- [Report a problem or request a feature](https://github.com/xreamm1/aftercode/issues)

## Development

Aftercode Desktop is built with Bun, Electron, SolidJS, and TypeScript. See [AFTERCODE.md](AFTERCODE.md) for setup and build commands.

## License

Aftercode includes code distributed under the MIT License. See [LICENSE](LICENSE) and [UPSTREAM_VERSION.md](UPSTREAM_VERSION.md) for license and source details.
