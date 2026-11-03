# OpenCode product and API

## What is OpenCode Desktop’s actual client/server model?

### Takeaway
OpenCode Desktop is a desktop client around the OpenCode coding-agent runtime, not simply a repository manager/editor. The documented product can launch/use a local OpenCode server or connect to a configured server; the public server and generated TypeScript SDK are the supported integration seams for a compatible client. The repository identifies the official desktop package as Electron, so using Electron is the least-surprising parity choice.

### Cited Findings
- OpenCode describes itself as an open-source coding agent available as a terminal interface, desktop app, and IDE extension; its desktop download matrix includes macOS, Windows, and Linux package formats. [V2 Introduction](https://dev.opencode.ai/v2/docs) [V1 Introduction](https://opencode.ai/docs)
- OpenCode Desktop can start its own local server by default or connect to a configured server URL. [V2 Troubleshooting](https://dev.opencode.ai/v2/docs/troubleshooting/)
- The public server exposes an OpenAPI 3.1 document at `/doc`; the server docs say the TUI is a client of that server and the same API enables multiple clients and programmatic interaction. [V1 Server docs](https://dev.opencode.ai/docs/server/)
- The official source repository's desktop README says the app is built with Electron. The desktop package manifest lists Electron, electron-vite, electron-builder, SolidJS, and OpenCode client/schema/UI packages. [Desktop README](https://github.com/anomalyco/opencode/blob/dev/packages/desktop/README.md) [Desktop package manifest](https://github.com/anomalyco/opencode/blob/dev/packages/desktop/package.json)
- The V1 JavaScript SDK offers both `createOpencode()` (starts server and client) and `createOpencodeClient()` (connects to an existing server); it exposes the server API as typed client methods. [V1 SDK docs](https://docs.dev.opencode.ai/docs/sdk/)
- The V2 docs distinguish an embedded host SDK that runs the OpenCode server router in-process without opening an HTTP listener from the network client; this is a separate option and should not be conflated with the stable V1 server contract. [V2 embedded SDK](https://dev.opencode.ai/v2/docs/build/sdk/)
- Current docs explicitly warn that OpenCode 1 and 2 are distinct versions which share the `opencode` command and cannot be installed side-by-side under default command. Their server/API contracts and config names also differ. [V1 Introduction](https://opencode.ai/docs) [V2 Introduction](https://dev.opencode.ai/v2/docs)
- The current V1 server command defaults to loopback `127.0.0.1:4096`; it supports CORS configuration and optional HTTP Basic authentication via environment variables. [V1 Server docs](https://dev.opencode.ai/docs/server/)
- V2 API documentation exposes versioned HTTP operations, typed payloads, and a server event stream, including global health and project/location operations. [V2 API docs](https://dev.opencode.ai/v2/docs/api)

### Inferences
- For a third-party Aftercode client, run and own the local server process from Electron Main, bind it to loopback, discover its port, and keep the renderer as a typed API/SSE client. Offer remote-server connection as an explicit mode. This avoids reimplementing the agent runtime, provider adapters, file tools, permission checks, and session persistence.
- Pin an OpenCode runtime/API generation and derive types from its `/doc` OpenAPI spec or published SDK. Do not assume V1 route names, configuration keys, or schemas equal V2 equivalents.
- A fresh rebranded UI can be made compatible through the public API. A complete reproduction of undocumented internal behavior cannot be promised from public API docs alone.

### Gaps
- Public product docs do not establish that every desktop-only behavior is represented in the public server API or provide a formal compatibility/support policy for third-party clients.
- The GitHub desktop package source was discoverable in search results, but direct browsing was blocked by robots in this research tool; source-level details beyond the public README and package manifest remain unverified.

## Which coding workflows, sessions, tools, and integrations must the app represent?

### Takeaway
OpenCode centers on project/location-scoped sessions with streamed message, reasoning, tool, and permission events. It includes provider/model selection, configurable agents and tool permissions, shell and filesystem operations, MCP/plugin integrations, Git worktrees, and session history controls; a parity client must render these as first-class workflows rather than a generic chat window.

### Cited Findings
- V2 session APIs support listing, creating, reading, and filtering sessions by directory, project, parent session, archive status, and search. Session creation can select agent/model/location and permissions; session export/import supports transcript transfer, optionally sanitized. [V2 API docs](https://dev.opencode.ai/v2/docs/api)
- The V2 event union includes session create/rename/archive/fork/delete, execution lifecycle, streamed text and reasoning, tool input/call/progress/result, permission requests/replies, filesystem changes, project/worktree changes, MCP status, terminal/PTY and shell events. [V2 API docs](https://dev.opencode.ai/v2/docs/api)
- V1 public server operations include project/path/VCS info, config reads/updates, provider lists/auth methods/OAuth callbacks, session create/list/fork/abort/diff/todo, and server-sent events. [V1 Server API reference](https://docs.dev.opencode.ai/docs/server/)
- OpenCode V1 uses the AI SDK and Models.dev catalog for 75+ model providers and local models; users connect provider credentials then choose configured models. [V1 Providers docs](https://docs.opencode.ai/docs/providers/)
- V2 provider docs cover built-in/catalog and custom providers, API keys, OAuth, provider commands, environment credentials, and multiple saved accounts. V2 stores new credentials in its SQLite database; the old `auth.json` can be imported during database migration. [V2 Providers docs](https://dev.opencode.ai/v2/docs/providers/) [V2 Auth/storage docs](https://dev.opencode.ai/v2/docs/cli/providers/)
- Agents can be primary, subagent, or both; they can have model/provider-specific options and agent-scoped permissions. [V1 Agents docs](https://opencode.ai/docs/agents)
- Permission policy distinguishes allow, ask, and deny and can be configured globally, by tool/action, resource pattern, and agent. Sensitive file reads and shell/edit actions are surfaced for approval according to policy. [V1 Permissions docs](https://opencode.ai/docs/permissions/) [V2 Permissions docs](https://dev.opencode.ai/v2/docs/permissions/)
- V2 supports local and remote MCP servers, OAuth for remote servers, and management of connection/auth state. [V2 MCP docs](https://dev.opencode.ai/v2/docs/mcp-servers/)
- V2 configuration includes worktree location settings and defaults Git as the built-in worktree strategy; Git worktrees can be placed under a configured directory or server data directory. [V2 Config docs](https://dev.opencode.ai/v2/docs/config/)
- V2 session CLI allows deleting sessions, export/import, and sanitizing exported transcripts. [V2 CLI commands](https://opencode.ai/v2/docs/cli/commands)

### Inferences
- The app shell needs: project/workspace picker; session navigation with search/archive/child-session groupings; streamed transcript with markdown/code/diffs/images/reasoning/tool activity; composer with model/agent/location selectors; permissions approval inbox; Git/worktree and file-change views; terminal/PTY panel; provider/model/auth settings; MCP/plugin status/settings.
- Subscribe to the server event stream as the source of truth for live session state and reconcile with paged session/project API reads after reconnect. Persist only UI-specific preferences locally; let the server remain authoritative for session messages and runtime state.
- Do not build provider integrations, shell execution, filesystem mutations, or permission policy from scratch if the target is compatibility with OpenCode. Those belong to the runtime; Aftercode should expose and explain the runtime's decisions.
- Treat OAuth credentials, API keys, and approval rules as high-sensitivity state. Use runtime auth commands/API and OS secure storage for Aftercode-owned credentials; never store secrets in renderer localStorage or project config by default.

### Gaps
- API docs list route/event semantics but do not fully define a pixel-perfect mapping from every runtime event/tool result to the official Desktop's visual layout.
- The detailed UI treatment of Git diff navigation, conflict states, terminal tabs, and worktree affordances needs a version-specific desktop reference or direct hands-on product review.

## How are data, configuration, authentication, and extension points handled?

### Takeaway
OpenCode separates runtime data from desktop UI state. The runtime persists projects, sessions, messages, and (in V2) credentials in SQLite, while the Desktop stores its own server/recent-workspace UI preferences in platform app-data files. Aftercode should preserve that boundary and use documented runtime APIs/configuration rather than copying private database internals.

### Cited Findings
- V1 troubleshooting docs locate runtime data at `~/.local/share/opencode/` (Windows equivalent under the user profile) and list `auth.json`, logs, SQLite `opencode.db` for projects/sessions/messages, and snapshots for undo. [V1 Troubleshooting](https://docs.opencode.ai/docs/troubleshooting/)
- V2 docs state saved provider API keys/OAuth tokens are in runtime SQLite `opencode.db`; `XDG_DATA_HOME`, release channel, and `OPENCODE_DB` may change the path. [V2 Provider auth/storage](https://dev.opencode.ai/v2/docs/cli/providers/) [V2 Troubleshooting](https://dev.opencode.ai/v2/docs/troubleshooting/)
- OpenCode Desktop UI state is separate: settings, global UI state, and per-workspace UI state live in files under the platform-specific app data directory (`%APPDATA%\\ai.opencode.desktop` on Windows; analogous macOS/Linux paths). [V2 Troubleshooting](https://dev.opencode.ai/v2/docs/troubleshooting/)
- V2 configuration supports JSON/JSONC, project/global/system scopes, custom providers/models, plugins, permissions, worktrees, environment variable and file substitution. [V2 Config docs](https://dev.opencode.ai/v2/docs/config/) [V2 Providers docs](https://dev.opencode.ai/v2/docs/providers/)
- The V2 server exposes a generated OpenAPI spec at `/doc`; server docs recommend it for inspecting schemas and generating clients. The V1 SDK is generated and type-safe. [V1 Server docs](https://dev.opencode.ai/docs/server/) [V1 SDK docs](https://docs.dev.opencode.ai/docs/sdk/)
- The V2 plugin GUI context offers desktop hooks such as pick directory/file, reveal/launch paths, system save/openExternal, appearance and locale, and workspace-removal notifications. [V2 GUI plugin docs](https://dev.opencode.ai/v2/docs/build/plugins/gui)
- V2 offers plugin management for installing/checking/updating/removing plugins and MCP server CLI commands. [V2 CLI commands](https://dev.opencode.ai/v2/docs/cli/commands) [V2 MCP docs](https://dev.opencode.ai/v2/docs/mcp-servers/)

### Inferences
- Use SQLite for Aftercode-owned UI metadata only if needed, with migrations and backup/restore; do not write directly to OpenCode's DB. Call public endpoints/SDK and allow the runtime to manage its own migration/versioning.
- Define a narrow Electron preload bridge (directory picker, reveal path, external link, notifications, secure credential storage) and keep the OpenCode network client in renderer or a controlled service module; never expose arbitrary Node APIs to the renderer.
- For secrets, differentiate remote-server credentials (kept in OS keychain) from OpenCode provider credentials (managed by the OpenCode runtime). Desktop settings should store only endpoint, local UI prefs, and non-secret labels.
- Extension compatibility is promising via server event/API support and plugin GUI hooks, but exact GUI extension ABI stability should be confirmed against the specific pinned release before adoption.

### Gaps
- Official documentation describes file names and storage responsibilities but not a stable external schema for the SQLite database; direct DB compatibility is therefore unsupported by this evidence.
- The full public API varies significantly between V1 and V2. A finished spec must state which OpenCode generation it targets and generate types from that generation's current `/doc` spec.

