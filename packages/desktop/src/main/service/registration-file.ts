import { app } from "electron"
import path from "node:path"
import { CHANNEL } from "../constants"

export function registrationFile() {
  const channel = process.env.OPENCODE_DESKTOP_SERVER_CHANNEL === "local" ? "local" : CHANNEL
  if (channel !== "prod" && channel !== "local") return undefined

  const state = process.env.XDG_STATE_HOME ?? path.join(app.getPath("home"), ".local", "state")
  return path.join(state, "opencode", `service-${channel}.json`)
}
