import { resolveChannel } from "./utils"

const arg = process.argv[2]

const channel = arg === "dev" || arg === "beta" || arg === "prod" ? arg : resolveChannel()

const appId = channel === "prod" ? "com.aftercode.desktop" : `com.aftercode.desktop.${channel}`

const productName = channel === "beta" ? "Aftercode Beta" : "Aftercode"

const summary = `Open source AI coding agent${channel !== "prod" ? ` (${channel})` : ""}`

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<component type="desktop-application">
  <id>${appId}</id>

  <metadata_license>CC0-1.0</metadata_license>
  <project_license>MIT</project_license>

  <name>${productName}</name>
  <summary>${summary}</summary>

  <developer id="com.aftercode">
    <name>Aftercode contributors</name>
  </developer>

  <description>
    <p>
      Aftercode is an open source coding agent based on the OpenCode project.
    </p>
  </description>

  <launchable type="desktop-id">${appId}.desktop</launchable>

  <content_rating type="oars-1.1" />

  <url type="bugtracker">https://github.com/anomalyco/opencode/issues</url>
  <url type="vcs-browser">https://github.com/anomalyco/opencode</url>

</component>
`

await Bun.write(`resources/${appId}.metainfo.xml`, xml)

console.log(`Generated metainfo for ${channel} at resources/${appId}.metainfo.xml`)
