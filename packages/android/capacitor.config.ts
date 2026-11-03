import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.aftercode.mobile",
  appName: "Aftercode",
  webDir: "../app/dist",
  server: {
    androidScheme: "http",
    cleartext: true,
  },
}

export default config
