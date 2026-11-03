# Создайте Aftercode на проверенном OpenCode ядре

Полный Aftercode Desktop наиболее надёжно получить как **ответвление открытого исходного кода OpenCode Desktop**: это сразу сохраняет модель работы агента, интеграции, поведение сессий и desktop-функции, которые сложно точно восстановить только по внешней документации. OpenCode распространяется под лицензией MIT, разрешающей повторное использование и изменение кода при сохранении требуемых уведомлений об авторских правах и лицензии; название, логотип и другие фирменные материалы следует заменить на Aftercode и отдельно проверить права на товарные знаки. ([лицензия OpenCode](https://github.com/anomalyco/opencode/blob/dev/LICENSE)) Текущий Desktop в официальном репозитории построен на **Electron и SolidJS**, поэтому для форка лучше оставить исходную связку, а не переписывать интерфейс на React: это снижает риск функциональных расхождений. ([README Desktop](https://github.com/anomalyco/opencode/blob/dev/packages/desktop/README.md), [манифест пакета](https://github.com/anomalyco/opencode/blob/dev/packages/desktop/package.json)) Для автономных компонентов или будущего независимого клиента подойдёт React + TypeScript, подключённый к версионируемому OpenCode API. В обоих случаях нужно закрепить конкретный выпуск OpenCode 2 и согласованную с ним схему API: OpenCode 1 и 2 — разные поколения с несовместимыми контрактами и конфигурацией. ([документация OpenCode 1](https://opencode.ai/docs), [документация OpenCode 2](https://dev.opencode.ai/v2/docs)) Ниже приведены архитектура форка, безопасная граница Electron, интерфейсы ключевых модулей и этапы доведения до сборок для Windows, macOS и Linux.

## Форк сохраняет паритет, API-клиент упрощает независимую разработку

OpenCode — coding-agent, а не только менеджер репозиториев или редактор. Desktop выступает клиентом к runtime OpenCode: локальный сервер запускается по умолчанию, а пользователь может указать и удалённый сервер. Публичный сервер предоставляет OpenAPI-документ и поток событий; официальная документация описывает его как интерфейс, на котором работают и другие клиенты. ([сервер OpenCode](https://dev.opencode.ai/docs/server/), [устранение проблем Desktop](https://dev.opencode.ai/v2/docs/troubleshooting/)) Это даёт два пути.

| Путь | Когда выбирать | Цена решения |
|---|---|---|
| **Форк официального Desktop (рекомендуется для полного клона)** | Требуется повторить все существующие экраны, поведение и интеграции | Нужно регулярно подтягивать изменения upstream и переименовать идентификаторы приложения, ресурсы, сборку и ссылки. Сохраняйте MIT notice для используемых частей. |
| **Отдельный клиент поверх OpenCode API** | Нужны собственный UX, отдельный релизный цикл или более простая база кода | Нельзя считать все внутренние desktop-возможности публичными API. Сначала сверяйте операции с OpenAPI/SDK выбранного выпуска; недостающие возможности придётся реализовать отдельно либо дождаться их экспонирования. ([API OpenCode 2](https://dev.opencode.ai/v2/docs/api)) |

Для заявленной цели выбирайте первый путь: **форк фиксированного официального релиза** и собственное оформление Aftercode. Не переносите вслепую базу данных OpenCode или приватные внутренние модули между версиями. Если впоследствии появится отдельный клиент, подключайте его через официально описанные API и генерируйте типы из `/doc`, а не поддерживайте неофициальную копию серверной схемы. Официальный JavaScript SDK OpenCode 1, например, различает запуск сервера вместе с клиентом (`createOpencode`) и подключение к уже запущенному серверу (`createOpencodeClient`); для OpenCode 2 нужно использовать соответствующие именно этой версии контракты. ([SDK OpenCode 1](https://docs.dev.opencode.ai/docs/sdk/), [API OpenCode 2](https://dev.opencode.ai/v2/docs/api))

При форке закрепите upstream commit/tag в `UPSTREAM_VERSION.md`, ведите небольшие изолированные брендовые изменения и документируйте каждое локальное отличие. **Паритет с upstream тогда становится проверяемой целью**: сравниваются diff, сценарии и тесты на одном и том же исходном выпуске. Публичные документы не обещают стабильность внутренних IPC или покомпонентную совместимость Desktop; для форка опорой является выбранный исходный код, а для отдельного клиента — документированный API.

## Архитектура разделяет desktop shell, runtime и интерфейс

В варианте форка сохраняйте Electron Main, preload и renderer-пакеты upstream. Логически проект разбивается на desktop shell (окна, меню, системные диалоги), UI (проекты, сессии, таймлайн, composer, настройки), клиентское состояние и OpenCode runtime (сервер, агенты, модели, инструменты, разрешения и данные сессий). Если делается отдельная React-реализация, Main-процесс управляет жизненным циклом локального сервера, renderer использует узкий IPC bridge и API-клиент, а сервер остаётся источником истины для истории и событий.

```text
┌────────────────────── Electron Main ───────────────────────┐
│ окно/меню • диалоги • запуск и остановка opencode serve    │
│ keychain/системные интеграции • проверка IPC sender         │
└──────────────────────────┬─────────────────────────────────┘
                           │ preload: разрешённые методы
┌──────────────────────────▼─────────────────────────────────┐
│ Renderer: Aftercode UI                                      │
│ навигация проектов • список сессий • timeline • composer   │
│ diff/files/terminal • настройки • UI state                  │
└──────────────────────────┬─────────────────────────────────┘
                           │ HTTP API + SSE (локально или remote)
┌──────────────────────────▼─────────────────────────────────┐
│ OpenCode runtime                                            │
│ provider/model • agents/tools • permissions • MCP/plugins   │
│ sessions/messages • filesystem/Git/worktrees • persistence  │
└─────────────────────────────────────────────────────────────┘
```

Сервер должен быть привязан к loopback-адресу для локальной работы; серверная документация указывает `127.0.0.1:4096` как стандартный адрес/порт и описывает HTTP Basic Auth через `OPENCODE_SERVER_PASSWORD`. Удалённое подключение оформляйте отдельным режимом с явным адресом и учётными данными, не открывая локальную службу на `0.0.0.0` автоматически. ([документация сервера](https://dev.opencode.ai/docs/server/)) Для runtime-функций используйте события сервера и API: сессии, частичный текст и reasoning, вызовы и результаты инструментов, запросы разрешений, изменения файлов, состояние MCP и терминала представлены в текущей схеме API OpenCode 2. ([события и API](https://dev.opencode.ai/v2/docs/api)) После переподключения восстановите состояние чтением проекта и сессии через API, затем возобновите подписку на события; не полагайтесь на память renderer как единственную копию истории.

Ориентировочное дерево для **самостоятельного клиента** (в форке имена следует сопоставить с реально существующими пакетами upstream, сохраняя их модульную структуру):

```text
aftercode/
├─ apps/desktop/
│  ├─ src/main/                 # BrowserWindow, lifecycle, server process
│  ├─ src/preload/              # узкий contextBridge
│  ├─ src/renderer/
│  │  ├─ app/                   # маршрутизация и shell
│  │  ├─ components/            # sidebar, timeline, composer, diff panels
│  │  ├─ features/              # projects, sessions, providers, settings
│  │  ├─ hooks/                 # подписки и команды UI
│  │  ├─ state/                 # server cache + ui-only preferences
│  │  └─ styles/                # темы и дизайн-токены Aftercode
│  └─ assets/                   # новые иконки и ресурсы Aftercode
├─ packages/
│  ├─ opencode-client/          # типизированный API/SSE adapter
│  ├─ shared/                   # схемы и типы renderer/main
│  ├─ ui/                       # общие компоненты
│  └─ config/                   # eslint, tsconfig, tailwind
├─ build/                       # ресурсы и конфигурация упаковки
├─ tests/                       # unit, integration, e2e
├─ UPSTREAM_VERSION.md          # версия/commit OpenCode, если это форк
└─ THIRD_PARTY_NOTICES.md       # MIT и прочие лицензии
```

Здесь `packages/opencode-client` показан для явной границы зависимости. При прямом форке используйте уже имеющиеся пакеты клиента, схем и UI вместо создания второго конкурирующего набора. Официальный Desktop-пакет использует Electron, SolidJS и пакеты OpenCode app/client/schema/ui; именно эта upstream-структура должна определять конкретную раскладку форка. ([манифест пакета](https://github.com/anomalyco/opencode/blob/dev/packages/desktop/package.json))

## IPC и безопасность требуют узкого доверенного моста

Renderer следует считать менее доверенной частью приложения: не предоставляйте ему Node.js, произвольный запуск команд, универсальный доступ к файловой системе или токены в `localStorage`. Electron рекомендует `contextIsolation`, sandbox для renderer, CSP, проверку отправителя каждого IPC-вызова, запрет неожиданной навигации и окон, а также передачу только узких методов через `contextBridge`. ([модель процессов Electron](https://www.electronjs.org/docs/latest/tutorial/process-model), [список мер безопасности](https://www.electronjs.org/docs/latest/tutorial/security/)) Для независимого клиента сокращённый пример main/preload выглядит так; для форка адаптируйте патч к фактическим IPC-контрактам upstream, не заменяя их вторым публичным API:

```ts
// main/index.ts — упрощённый эскиз независимого клиента
import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "node:path";

let mainWindow: BrowserWindow | undefined;

function trustedSender(event: Electron.IpcMainInvokeEvent) {
  return mainWindow && event.senderFrame === mainWindow.webContents.mainFrame;
}

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
});

ipcMain.handle("project:pick", async (event) => {
  if (!trustedSender(event)) throw new Error("Untrusted IPC sender");
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  return result.canceled ? null : result.filePaths[0];
});
```

```ts
// preload/index.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("aftercode", {
  pickProject: () => ipcRenderer.invoke("project:pick") as Promise<string | null>,
});
```

В полном приложении методы моста именуйте по действию: `server.start(projectPath)`, `server.stop()`, `dialog.pickProject()`, `shell.revealPath(path)` и `credentials.store(serverId, secret)`. Проверяйте допустимость каждого пути и схемы URL на стороне Main. Для исполнения shell-команд используйте механизмы runtime OpenCode и его запросы на разрешение, а не собственный `exec` из renderer; разрешения в OpenCode различают `allow`, `ask` и `deny`. ([разрешения OpenCode](https://dev.opencode.ai/v2/docs/permissions/))

## Runtime-клиент, состояние и данные должны иметь одного владельца

Для независимого клиента держите транспорт за интерфейсом, чтобы генерация схем OpenAPI, SSE reconnect и совместимость с закреплённой версией не проникали во все React-компоненты. Ниже намеренно типизированный эскиз: имена `client.session.create` и `client.event.subscribe` условны и должны быть сгенерированы или проверены по `/doc` конкретного OpenCode 2 выпуска. Не копируйте их в production до сверки с фактической схемой.

```ts
// packages/opencode-client/src/client.ts
export interface OpenCodeTransport {
  request<T>(path: string, init?: RequestInit): Promise<T>;
  events(signal: AbortSignal): AsyncIterable<ServerEvent>;
}

export type ServerEvent =
  | { type: "session.updated"; sessionId: string }
  | { type: "message.part.updated"; sessionId: string; part: unknown }
  | { type: "permission.asked"; requestId: string; permission: unknown }
  | { type: "file.edited"; path: string };

export function createOpenCodeClient(baseUrl: string, auth?: string) {
  const headers: HeadersInit = auth ? { Authorization: `Basic ${auth}` } : {};
  return {
    async listSessions(directory: string) {
      const url = new URL("/session", baseUrl);
      url.searchParams.set("directory", directory);
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`OpenCode API: ${response.status}`);
      return response.json() as Promise<Session[]>; // Session генерируется из схемы
    },
    // создать сессию, отправить prompt, ответить на permission и читать события
    // подключайте здесь методами/путями, подтверждёнными OpenAPI выбранной версии
  };
}
```

Официальный API описывает сессии и поток событий, но не обещает в исследованных материалах полное соответствие каждой desktop-возможности; поэтому вводите capability map: при запуске определяйте поддерживаемые операции сервера и скрывайте или отключайте несовместимые пункты UI с объяснением версии. ([API OpenCode 2](https://dev.opencode.ai/v2/docs/api)) Для экранов основной сценарий такой: выбор проекта/worktree → список сессий с поиском и архивом → сессия и timeline → composer с моделью, агентом и командой → поток действий и подтверждений → дифф/файлы/терминал. Настройки включают сервер, проекты, уведомления и интеграции. Это сводная карта интерфейса по официальным руководствам и release notes, а не гарантия неизменной пиксельной схемы. ([release notes OpenCode](https://github.com/anomalyco/opencode/releases), [GUI plugin API](https://dev.opencode.ai/v2/docs/build/plugins/gui))

Для React-клиента UI может выглядеть так (в исходном форке эквивалентная часть уже написана на SolidJS):

```tsx
function AppShell() {
  const sessions = useSessionsStore((s) => s.visibleSessions);
  const active = useSessionsStore((s) => s.activeSessionId);

  return (
    <div className="app-shell">
      <ProjectSidebar />
      <SessionList sessions={sessions} />
      <main className="session-view">
        {active ? <SessionTimeline id={active} /> : <HomeView />}
        <Composer />
      </main>
      <ContextPanel /> {/* diff, changed files, terminal, browser */}
      <PermissionInbox />
    </div>
  );
}
```

Храните в клиенте UI-only состояние: выбранную панель, ширину боковой панели, последние локальные проекты и тему. Сервер OpenCode должен оставаться владельцем сессий, сообщений, provider credentials и runtime-данных; не редактируйте его SQLite напрямую. Документация OpenCode 2 указывает, что данные runtime и сохранённые ключи поставщиков находятся в `opencode.db`, а Desktop UI state хранится отдельно в platform app data. ([хранение и troubleshooting](https://dev.opencode.ai/v2/docs/troubleshooting/), [credentials](https://dev.opencode.ai/v2/docs/cli/providers/)) Для Aftercode используйте отдельное пространство `app.getPath("userData")` и, если настройки разрастутся, SQLite с миграциями:

```ts
// renderer не хранит секреты; это только UI preferences
type UiPreferences = {
  theme: "dark" | "light" | "system";
  sidebarWidth: number;
  selectedServerId: string;
  recentProjects: string[];
};

const defaults: UiPreferences = {
  theme: "system", sidebarWidth: 280,
  selectedServerId: "local", recentProjects: [],
};

// settings repository в Main читает/пишет валидированный JSON
// в отдельном каталоге Aftercode; обновления атомарны через temp + rename.
```

Секреты удалённого подключения должны храниться через системное хранилище ключей, а ключи AI-провайдеров — управляться runtime OpenCode. В OpenCode 2 сохранённые учетные данные поставщиков живут в runtime SQLite; это ещё одна причина не дублировать и не менять их из Aftercode. ([документация поставщиков](https://dev.opencode.ai/v2/docs/providers/), [авторизация и хранилище](https://dev.opencode.ai/v2/docs/cli/providers/))

## Реализация проходит четыре этапа от форка до подписанных сборок

**Этап 1 — закрепить upstream и окружение.** Выберите конкретный stable release/commit, проверьте лицензии пакетов и системных ресурсов, зафиксируйте OpenCode API generation и поддерживаемые версии CLI. Переименуйте `name`, `appId`, bundle identifier, имена исполняемых файлов, установщиков, каталоги настроек, ссылки, support URL и update channel. Сохраните MIT notices и ведите `THIRD_PARTY_NOTICES.md`. Не делайте массовый механический rename до запуска исходной сборки: сначала создайте базовую контрольную точку.

**Этап 2 — адаптировать брендинг и интерфейс.** Составьте каталог экранов и проверьте их на закреплённой upstream сборке: Home/server picker, проект/worktree, история сессий, timeline, composer, prompt/permission cards, diff и файлы, terminal/browser panels, интеграции и настройки. Замените logo/icon/theme tokens, app name и тексты; не удаляйте функции ради простоты, если требуется паритет. Выполните сравнение скриншотов и сценариев до и после ребрендинга. Сами release notes и документы меняются со временем, так что этот инвентарь должен быть привязан к коммиту. ([release notes](https://github.com/anomalyco/opencode/releases))

**Этап 3 — сохранить и закрыть функциональные потоки.** Проверьте локальный сервер, удалённый сервер, reconnect событий, создание/архивацию/поиск/ветвление сессий, поток текста и tool outputs, permission ask/allow/deny, смену агента и модели, provider auth, MCP/plugin status, работу с файлами, Git/worktrees, terminal и уведомления. Для любой самостоятельной реализации генерируйте клиент из `/doc`, держите UI-кэш как проекцию событий сервера и после разрыва соединения синхронизируйте список/сессию через API. OpenCode позволяет подключать локальные/удалённые MCP-серверы, настраивать агентов и Git worktrees; эти сценарии принадлежат runtime и должны идти через штатные контракты. ([MCP](https://dev.opencode.ai/v2/docs/mcp-servers/), [agents](https://opencode.ai/docs/agents), [worktrees/config](https://dev.opencode.ai/v2/docs/config/))

**Этап 4 — проверять и выпускать по ОС.** Используйте матрицу CI на Windows, macOS и Linux с native runners, подписывайте установщики и проверяйте чистую установку, обновление, удаление, восстановление окна, запуск/остановку server process и пользовательские каталоги на каждой ОС. Официальная сборка OpenCode 2 публикует macOS Intel/Apple Silicon, Windows x64/ARM64, Linux x64/ARM64 пакеты DEB/RPM/AppImage; это ориентир матрицы, но не автоматически обязательство Aftercode поддерживать все варианты в первой версии. ([платформы OpenCode](https://dev.opencode.ai/v2/docs)) Электроновский автоапдейтер поддерживает macOS и Windows, Linux обновляется обычно через пакетный менеджер; выпуск должен включать подпись, changelog, проверку целостности и понятный rollback/manual update путь. ([Electron distribution](https://www.electronjs.org/docs/latest/tutorial/distribution-overview), [Electron updater](https://www.electronjs.org/docs/latest/api/auto-updater/)) На Windows и Linux отдельно проверьте работу путей, terminal и системных окон; документация OpenCode упоминает специфические Windows/WSL и Wayland/X11 оговорки. ([устранение проблем Desktop](https://dev.opencode.ai/v2/docs/troubleshooting/))

## Заключение

Открытый исходный код превращает «клон» из попытки угадать поведение в выполнимую задачу форка: **сохраняйте upstream runtime и desktop-логику, меняйте идентичность, а обновления ведите малыми, обозримыми патчами**. Это наиболее прямой способ обеспечить полноту функций; независимый API-клиент лучше подходит для собственного интерфейса, но требует версионного контроля возможностей и не гарантирует доступ ко всем desktop-only деталям. Критические решения до начала реализации — выбрать и закрепить релиз OpenCode 2, определить границы ребрендинга и лицензий зависимостей, затем описать критерии паритета по сценариям. В таком порядке команда сможет отдельно измерять функциональную совместимость, пользовательский облик Aftercode и качество сборок на каждой целевой ОС.
