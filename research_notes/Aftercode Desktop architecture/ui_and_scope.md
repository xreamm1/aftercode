# OpenCode Desktop UI and scope

## Desktop UI, navigation, and platform support

### Takeaway
The current OpenCode 2 desktop is an Electron client attached to a local background OpenCode service by default, with support for a configured server URL. A practical Aftercode shell can reproduce the visible project/session workflow while using the public OpenCode service/API for agent execution; the official docs and release notes reveal a broad, fast-changing UI surface.

### Cited Findings
- OpenCode 2 describes separate CLI, Desktop, and Web clients; its desktop builds are offered for macOS Apple Silicon/Intel, Windows x64/ARM64, and Linux deb/rpm/AppImage x64/ARM64. — [OpenCode 2 intro](https://dev.opencode.ai/v2/docs)
- The official troubleshooting guide says Desktop normally starts its own local server, but can instead connect to a configured server URL; Home has a server picker opened from the server name/status dot. — [Desktop troubleshooting](https://dev.opencode.ai/v2/docs/troubleshooting/)
- Desktop app storage paths and settings files are platform-specific: macOS Application Support, Linux XDG config, Windows `%APPDATA%`; saved state includes desktop settings and global/workspace UI state. — [Desktop troubleshooting](https://dev.opencode.ai/v2/docs/troubleshooting/)
- Current release notes name project/worktree selection, recent sessions, a searchable model picker with Favorites and Recent, integrations dialog, session location actions (project/worktree/open-in-app/terminal), activity pill with live shell output and Stop action, composer goal pill, timeline question cards, terminal/browser side tabs, notifications, and Settings pages including General, Notifications, About, Server, Projects, and Extensions. — [OpenCode releases](https://github.com/anomalyco/opencode/releases)
- The official repository's desktop package declares Electron, electron-builder, SolidJS, `@opencode/app`, shared UI/client/schema packages, and native PTY dependencies. This is evidence the published app is Electron + SolidJS rather than the user's suggested React/Vue stack. — [Desktop package manifest](https://github.com/anomalyco/opencode/blob/dev/packages/desktop/package.json)
- OpenCode calls out Windows performance/file/terminal issues and recommends WSL for best compatibility; Linux has reported Wayland/X11 caveats. These should inform Aftercode's platform acceptance criteria. — [Desktop troubleshooting](https://dev.opencode.ai/v2/docs/troubleshooting/)

### Inferences
- A parity-oriented screen map should include: Home/server picker; project/worktree chooser; session list/sidebar; session timeline; composer with model/agent/command/attachment controls; activity and permission/question controls; right-side file/diff/terminal/browser panels; and searchable settings. This is a synthesis of documented controls and release notes rather than an official single screen specification.
- Define an adapter over OpenCode's client/server protocol so Aftercode can point at local or remote servers. Use Electron if matching OpenCode's native behavior and UI technology reduces porting effort; choose React only if the team values ecosystem familiarity over reusing Solid-based components.

### Gaps
- Official docs do not provide a stable, exhaustive written specification for every Desktop screen or its pixel measurements. Full visual parity requires inspecting a chosen stable build and validating interactions, not relying on documentation alone.
- Platform notes describe the OpenCode build's available architectures and caveats, but do not establish Aftercode support commitments or minimum OS versions.

## Functional areas and integration boundary

### Takeaway
Most coding-agent behavior belongs to OpenCode's backend, not a desktop-only clone. Aftercode can implement the client experience on top of OpenCode's documented server/API/SDK, but should verify API coverage for each operation and provide native UI features itself where no API exists.

### Cited Findings
- OpenCode explicitly documents a client-server architecture: the background server owns sessions, plugins, permissions, and other shared application state. — [Desktop troubleshooting](https://dev.opencode.ai/v2/docs/troubleshooting/)
- The documented GUI extension host exposes APIs for current sessions, session routing, project opening, dialogs, settings, system clipboard/save/open-external, desktop file picking/reveal/launch, and client state. — [GUI plugin API](https://dev.opencode.ai/v2/docs/build/plugins/gui)
- Official release notes document desktop model/provider integration management, MCP/plugin controls, local and remote server selection, project/worktree actions, terminal actions, and notification configuration; exact UI behavior can change between releases. — [OpenCode releases](https://github.com/anomalyco/opencode/releases)
- OpenCode Desktop can load plugin-contributed GUI panels, settings pages, and commands from plugins configured in `opencode.json(c)`. The plugin GUI comes from the selected server's loaded plugins. — [Plugins docs](https://dev.opencode.ai/v2/docs/plugins/); [GUI plugin docs](https://dev.opencode.ai/v2/docs/build/plugins/gui)
- The plugin API documents session calls including create/get/context/list/prompt/command/rename/interrupt/wait/compact and model/agent switching. — [Server plugin API](https://dev.opencode.ai/v2/docs/build/plugins/server)
- Command templates support positional arguments and shell-output interpolation; official docs warn these shell blocks execute outside the agent tool permission flow and untrusted input must not be placed inside them. — [Commands docs](https://dev.opencode.ai/v2/docs/commands/)

### Inferences
- For a first release, build Aftercode as a client that owns project navigation, history rendering, diff/file/terminal presentation, settings views, and local preferences; delegate sessions, tools, model routing, provider credentials, plugins, permissions, and context to the OpenCode server through the documented API.
- Implement a capability map against the OpenAPI schema/SDK and gracefully hide controls if a remote server version lacks an operation. The public plugin API is not automatically the same thing as the full app-facing API, so verify endpoints directly rather than treating plugin examples as a compatibility guarantee.
- Preserve the security model for command execution and permission prompts. Do not silently grant broad filesystem/shell access in the name of parity.

### Gaps
- The available docs do not claim that the plugin GUI API is a complete replacement for the Desktop app's private IPC or every internal operation. Exact feature parity may require additional documented server API calls or upstream source reuse.
- The API's versioning/compatibility guarantees and minimum server version for each desktop function should be checked against the exact OpenCode release selected for implementation.

## Rebranding, licensing, and duplication scope

### Takeaway
The official OpenCode repository is MIT-licensed, which is permissive for source-code reuse subject to preserving required copyright and license notices. A rebranded fork still needs independent branding assets and a trademark review; the repository license alone does not document permission to use OpenCode marks or present the product as official.

### Cited Findings
- The repository's root license is MIT and requires the copyright and permission notice to be included in copies or substantial portions of the software. — [OpenCode LICENSE](https://github.com/anomalyco/opencode/blob/dev/LICENSE)
- The desktop package manifest also marks the package MIT, but the package is part of the same open-source repository. — [Desktop package manifest](https://github.com/anomalyco/opencode/blob/dev/packages/desktop/package.json)
- The official repository distinguishes the OpenCode source project and its desktop builds; the desktop page and binary packaging carry the OpenCode name and app identifiers. — [OpenCode repository](https://github.com/anomalyco/opencode); [Desktop troubleshooting/storage identifiers](https://dev.opencode.ai/v2/docs/troubleshooting/)

### Inferences
- Two implementation paths are possible: (1) fork upstream Desktop and rename product identifiers/assets while keeping all applicable MIT notices; or (2) create an independently branded client using public APIs and reproduce interaction patterns without copying logos, artwork, or proprietary service assets. The second path minimizes coupling to upstream internals.
- Use a distinct Aftercode logo, icon, color tokens, app identifier, installer metadata, website copy, and support links. Keep an “about”/licenses view identifying MIT-derived components and include upstream notices where source is reused.
- Treat “pixel-perfect clone” as a product goal that needs legal and product review. The available sources establish MIT code terms but do not establish trademark clearance for OpenCode names/logos or assess trade-dress risk.

### Gaps
- I found no official trademark policy or mark-licensing grant in the reviewed sources. This should be checked with counsel before publishing a product marketed as a direct clone or distributing copied visual assets.
- The license obligations of every bundled dependency, font, icon set, theme, and upstream binary must be inventoried separately; the root MIT license does not supersede third-party terms.
