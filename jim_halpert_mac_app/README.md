# Prank Planner — Mac App

Jim Halpert's prank tracker, ported from a Chrome extension to a native Mac app using Electron.

## Run

```bash
npm install
npm start
```

## Build (distributable .dmg)

```bash
npm run build
```

The `.dmg` will appear in the `dist/` folder.

## What changed from the Chrome extension

- `chrome.storage.local` → JSON file in macOS user data directory (via Electron IPC)
- Fixed-width popup → resizable window with `titleBarStyle: hiddenInset`
- Form layout adjusted for a wider desktop window (inputs side-by-side)
- Added native macOS menu bar
