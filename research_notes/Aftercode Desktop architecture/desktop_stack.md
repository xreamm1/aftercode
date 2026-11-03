# Desktop stack and architecture

## Which framework best fits Aftercode Desktop?

### Takeaway
For a high-fidelity desktop companion to OpenCode that must manage the local OpenCode process, render a long-running streaming coding UI, and ship the same UI across Windows/macOS/Linux, Electron + React + TypeScript is the lower-risk MVP choice. Tauri 2 is a credible smaller-footprint alternative, but it exchanges a bundled Chromium runtime for OS-specific WebViews and a Rust command/permission bridge; choose it only if app footprint and Rust ownership outweigh renderer consistency and the extra sidecar/process integration work.

### Cited Findings
- Electron uses Chromium's multi-process model, with a Node.js main process managing windows and web-standard renderer processes; preload scripts can bridge carefully scoped APIs with `contextBridge`. [Electron process model](https://www.electronjs.org/docs/latest/tutorial/process-model)
- Tauri combines Rust with HTML rendered in an OS WebView; JS-to-Rust system calls travel over message passing. Tauri says its binaries can be small because it uses the system webview rather than shipping a browser runtime. [Tauri architecture](https://v2.tauri.app/concept/architecture/), [Tauri app size](https://v2.tauri.app/concept/size/)
- Tauri renderer behavior depends on a platform webview: WebView2 on Windows, WKWebView on macOS, and WebKitGTK on Linux. [Tauri WebView versions](https://v2.tauri.app/reference/webview-versions/)
- Tauri's documentation lists desktop bundling for macOS, Windows, and Linux; Linux formats include DEB, Snap, AppImage, Flatpak, RPM, and AUR, while macOS supports App Bundle/DMG and Windows supports MSI/NSIS. [Tauri distribution overview](https://v2.tauri.app/distribute/)
- OpenCode publishes desktop downloads for macOS Apple Silicon/Intel, Windows x64/ARM64, and Linux DEB/RPM/AppImage x64/ARM64. [OpenCode downloads](https://dev.opencode.ai/v2/docs/)

### Inferences
- For visual fidelity and reliable markdown/diff rendering, Electron's fixed bundled browser engine is useful: it reduces differences in fonts, CSS, and browser APIs between OS releases. This is a practical inference from Electron's Chromium runtime vs Tauri's system-webview model, not an OpenCode requirement.
- If Aftercode delegates coding, sessions, providers, tools, and filesystem operations to `opencode serve`, Electron should keep the local process lifecycle and OS integrations in its main process, and React should remain a renderer client. That gives one application process boundary without reimplementing the agent runtime.
- Tauri is still reasonable for a lean app, but embedding and supervising the OpenCode CLI as a sidecar needs explicit Rust/plugin process management, and UI behavior should be checked on all three WebView implementations.

### Gaps
- No official source compared Electron and Tauri performance for an OpenCode-like workload; choose by measuring a working prototype on target hardware.
- Confirm the exact minimum OS versions and required Linux system libraries before setting release targets; those vary by chosen binaries and packaging format.

## What security boundaries and local-server handling are needed?

### Takeaway
Treat the OpenCode server as an execution-capable local service and the renderer as untrusted presentation code. Keep process spawning, credentials, and filesystem dialogs behind a narrow main/Rust API; bind local services to loopback by default, and require explicit authentication before accepting a remote server.

### Cited Findings
- Electron recommends secure content only, `contextIsolation`, renderer sandboxing, restrictive CSP, sender validation for IPC, limiting navigation/window creation, and not exposing Electron APIs to untrusted content. [Electron security checklist](https://www.electronjs.org/docs/latest/tutorial/security/)
- Electron's process model puts Node.js APIs in the main process, while renderer code follows web standards; a preload bridge exposes narrowly defined methods across isolated contexts. [Electron process model](https://www.electronjs.org/docs/latest/tutorial/process-model)
- Tauri's runtime authority checks whether an origin/capability is allowed to call a command and can apply command scopes; rejected calls never reach the Rust handler. [Tauri runtime authority](https://v2.tauri.app/security/runtime-authority/)
- Tauri's security model separates app-owned Rust code from frontend code and uses capabilities and command-level checks to constrain access. [Tauri security](https://v2.tauri.app/security/)
- OpenCode `serve` exposes an OpenAPI HTTP interface, defaults to hostname `127.0.0.1` and port `4096`, and supports HTTP Basic authentication through `OPENCODE_SERVER_PASSWORD`; users can override host/port and add CORS origins. [OpenCode server docs](https://dev.opencode.ai/docs/server/)
- OpenCode docs warn that exposing a server on `0.0.0.0` should be protected with `OPENCODE_SERVER_PASSWORD`; the Windows/WSL guide demonstrates connecting the Desktop app to a server in WSL. [OpenCode Windows/WSL](https://opencode.ai/docs/windows-wsl)

### Inferences
- Keep renderer APIs semantic and allowlisted, e.g. `server.start(projectPath)`, `server.stop()`, `dialog.pickProject()`, and `credentials.store(serverId, secret)`. Do not give the renderer generic shell execution or arbitrary path access.
- For a managed local backend, choose a free loopback port (or honor an explicit configured port), spawn the OpenCode executable with the project as cwd, wait for `/doc` or a lightweight health endpoint before marking connected, stream `/event` Server-Sent Events, and terminate the child cleanly on shutdown. OpenCode documents the server and event endpoint; the lifecycle implementation is an Aftercode design recommendation.
- For remote server mode, require HTTPS when host is not loopback, allowlist origins, and store credentials in OS secure storage. Never launch a server bound to `0.0.0.0` by default.

### Gaps
- The OpenCode server docs specify HTTP Basic authentication, but this research did not establish whether every endpoint has a documented authorization policy beyond that mechanism; verify against the exact release's OpenAPI spec before shipping.
- The server CLI may change its startup flags and health endpoint across releases; pin a supported CLI range and discover `/doc` at runtime rather than assuming undocumented routes.

## How should packaging and updates work?

### Takeaway
Both frameworks can package and update a desktop app on all three target OS families. Electron's built-in updater is officially supported on macOS and Windows, but Linux updating is normally delegated to package managers; Tauri's updater plugin lists Windows, Linux, and macOS and requires signed update artifacts. Use a signed, channel-aware release pipeline whichever stack is chosen.

### Cited Findings
- Electron supports packaging through Electron Forge or custom tooling and recommends code signing to avoid OS security warnings. [Electron distribution overview](https://www.electronjs.org/docs/latest/tutorial/distribution-overview)
- Electron's built-in `autoUpdater` supports macOS and Windows, not Linux; its docs recommend Linux distribution/package-manager updates. macOS auto-updates require signing. [Electron autoUpdater API](https://www.electronjs.org/docs/latest/api/auto-updater/)
- Electron Forge can publish static update metadata for macOS ZIP and Windows Squirrel packages; Electron's update service is for public GitHub releases and signed macOS builds. [Electron updating applications](https://www.electronjs.org/docs/latest/tutorial/updates)
- Tauri's updater plugin supports Windows, Linux, and macOS; update artifacts must be signed and verified with a configured public key, and production endpoints require TLS. [Tauri updater](https://v2.tauri.app/plugin/updater/)
- Tauri's distribution docs say code signing is required on most platforms and macOS direct downloads require code signing and notarization. [Tauri distribution overview](https://v2.tauri.app/distribute/)
- Tauri Windows development requires Microsoft C++ Build Tools and Edge WebView2; MSI builds also have a VBScript prerequisite in the documented setup. [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

### Inferences
- Use GitHub Actions matrix builds on native OS runners (or carefully configured cross-builders), produce signed installers, attach SBOM/release notes, and publish separate stable/beta channels. The specific pipeline is a recommendation, not an OpenCode requirement.
- If Electron is selected, ship stable Linux formats through distro/package-manager channels and offer a clear manual update path for standalone downloads. If Tauri is selected, keep the updater signing key in protected release secrets and test signature validation and rollback behavior in CI.
- A separate OpenCode CLI update lifecycle is needed if Aftercode manages that binary: pin or constrain the CLI version, verify checksums/signatures, and never silently overwrite a user's separately installed CLI.

### Gaps
- No Aftercode distribution channel, signing identity, or CLI-bundling decision has been specified. These are release-planning inputs, not blockers for the architecture.
- The OpenCode docs expose official downloads but this research did not confirm a stable machine-readable CLI release manifest or binary-signature scheme suitable for an embedded sidecar; investigate before bundling its CLI.
