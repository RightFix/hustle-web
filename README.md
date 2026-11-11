# Hustle — Web Frontend

React + TypeScript + Vite. This is the **source of truth** for the product UI;
the Android app is a Capacitor wrapper around it.

## Development

```bash
npm install
npm run dev        # Vite dev server on :5173, proxies /api, /media, /docs to :8000
```

The backend must be running locally on `:8000` (`cd backend && cargo run`).

## Checks

```bash
npx tsc --noEmit   # type-check
npm run lint       # oxlint
npm run build      # tsc -b && vite build -> dist/
```

## Capacitor (Android wrapper)

By default the native app serves the bundled `dist/` (`webDir`). To load a
deployed web app from a single origin (so the backend's HttpOnly auth cookie
works unchanged inside the WebView), set `server.url` in
`capacitor.config.ts`. In that mode the bundled `dist/` is not served, but keep
`webDir: dist` — `cap sync` still requires a built `dist/`.

One-time setup (already done in this repo):

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init Hustle com.hustle.app --web-dir dist
npx cap add android
```

### Pointing the app at a server (origin mode)

For production, load the deployed HTTPS site by setting `server.url` in
`capacitor.config.ts`:

```ts
server: {
  url: 'https://your-hustle-host',   // web app + API origin
  cleartext: false,
}
```

The cookie rides that origin.

- **LAN/dev testing (plain HTTP):** set `server.url` to your dev machine, e.g.
  `http://192.168.1.20:8000` (same Wi-Fi as the phone), set `cleartext: true`,
  and temporarily set `android:usesCleartextTraffic="true"` in
  `android/app/src/main/AndroidManifest.xml`. Revert to HTTPS-only settings
  (`cleartext: false` / `usesCleartextTraffic="false"`, or remove `server`)
  before a production/release build.

### Building an APK

Requires the Android SDK (installed to `~/android-sdk`, wired up in
`local.properties`) and **JDK 21** — Capacitor's Android code targets
Java 21, so JDK 17 fails with `invalid source release: 21`, and
Gradle 8.14 doesn't support newer JDKs like 25:

```bash
sudo apt install -y openjdk-21-jdk
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64   # add to ~/.bashrc
```

Then:

```bash
npm run build      # refresh dist/ (required by cap sync)
npx cap sync       # copy web assets + plugins into android/
cd android
./gradlew assembleDebug          # APK -> android/app/build/outputs/apk/debug/
./gradlew assembleRelease        # needs a signing config for the Play Store
```

Install a debug build on a connected device with
`adb install app/build/outputs/apk/debug/app-debug.apk`.

### Refreshing after UI changes

```bash
npm run build && npx cap sync && cd android && ./gradlew assembleDebug
```
