import { cp, mkdir, readFile, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"
import { $ } from "bun"

const root = resolve(import.meta.dir, "../..")
const android = join(import.meta.dir, "android")
const resources = join(android, "app/src/main/res")

const googleMirror = "maven { url 'https://maven.aliyun.com/repository/google' }"
const gradleFiles = [
  join(android, "build.gradle"),
  join(android, "app/build.gradle"),
  join(android, "capacitor-cordova-android-plugins/build.gradle"),
  join(import.meta.dir, "node_modules/@capacitor/android/capacitor/build.gradle"),
]
for (const file of gradleFiles) {
  let content = await readFile(file, "utf8")
  content = content.replace(/repositories\s*\{\s*google\(\)/g, (block) => block.replace("google()", `${googleMirror}\n        google()`))
  if (file === join(android, "app/build.gradle") && !content.includes("buildToolsVersion")) {
    content = content.replace('namespace = "com.aftercode.mobile"', 'namespace = "com.aftercode.mobile"\n    buildToolsVersion "36.0.0"')
  } else if (file === join(android, "capacitor-cordova-android-plugins/build.gradle") && !content.includes("buildToolsVersion")) {
    content = content.replace('namespace = "capacitor.cordova.android.plugins"', 'namespace = "capacitor.cordova.android.plugins"\n    buildToolsVersion "36.0.0"')
  } else if (file === join(import.meta.dir, "node_modules/@capacitor/android/capacitor/build.gradle") && !content.includes("buildToolsVersion")) {
    content = content.replace('namespace = "com.getcapacitor.android"', 'namespace = "com.getcapacitor.android"\n    buildToolsVersion "36.0.0"')
  }
  await writeFile(file, content)
}

await cp(join(root, "packages/desktop/icons/prod/android"), resources, { recursive: true })
const command =
  process.platform === "win32"
    ? ["cmd.exe", "/d", "/s", "/c", "gradlew.bat --no-daemon assembleDebug"]
    : ["./gradlew", "--no-daemon", "assembleDebug"]
const proxyUrl = process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY
const proxy = proxyUrl ? new URL(proxyUrl) : undefined
const proxyOptions = proxy
  ? `-Dhttps.proxyHost=${proxy.hostname} -Dhttps.proxyPort=${proxy.port} -Dhttp.proxyHost=${proxy.hostname} -Dhttp.proxyPort=${proxy.port}`
  : undefined
const env = {
  ...process.env,
  ...(proxyOptions
    ? { JAVA_TOOL_OPTIONS: [process.env.JAVA_TOOL_OPTIONS, proxyOptions].filter(Boolean).join(" ") }
    : {}),
}
const build = Bun.spawn(command, { cwd: android, env, stdout: "inherit", stderr: "inherit" })
if ((await build.exited) !== 0) throw new Error("Android APK build failed")

const apk = join(android, "app/build/outputs/apk/debug/app-debug.apk")
const output = join(root, "dist/release/Aftercode-Android.apk")
await mkdir(join(root, "dist/release"), { recursive: true })
await cp(apk, output)
console.log(`APK: ${output}`)
