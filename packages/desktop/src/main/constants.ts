import { app } from "electron"

type Channel = "local" | "dev" | "beta" | "prod"

const raw = import.meta.env.OPENCODE_CHANNEL

export const CHANNEL: Channel = raw === "local" || raw === "dev" || raw === "beta" || raw === "prod" ? raw : "dev"

export const VERSION = app.isPackaged ? app.getVersion() : (process.env.OPENCODE_VERSION ?? app.getVersion())

const appNames: Record<string, string> = {
  dev: "Aftercode",
  beta: "Aftercode Beta",
  prod: "Aftercode",
}

const appIDs: Record<string, string> = {
  dev: "com.aftercode.desktop.dev",
  beta: "com.aftercode.desktop.beta",
  prod: "com.aftercode.desktop",
}

// Local renderer/server mode keeps the dev application identity.
export const APP_NAME = appNames[CHANNEL]

export const APP_ID = app.isPackaged ? appIDs[CHANNEL] : "com.aftercode.desktop.dev"
