# Threat Assessor

> *"Security is my middle name. Well, it's actually Danger, but my point stands."*
> — Dwight K. Schrute, Assistant (to the) Regional Manager

## What It Does

A browser action popup that lets Dwight K. Schrute assess any website as a potential threat to Dunder Mifflin and the greater Scranton area.

### Features

- **Domain detection** — Automatically identifies the current site under assessment
- **Animated threat scan** — Click "Run Threat Assessment" to trigger a full humorous security scan with:
  - A green-on-black terminal log scrolling through 15 procedural checks
  - A progress bar tracking assessment completion
  - Dwight-authentic scan steps (checking for zombies, bear threats, beet database cross-referencing, pinging Mose for perimeter confirmation)
- **Randomized verdict** — Each scan ends with either:
  - `✅ NO THREAT DETECTED — Website cleared by Assistant Regional Manager`
  - `🚨 THREAT DETECTED — website added to watch list`
- **Persistent watch list** — Flagged sites are stored in `chrome.storage.local` and viewable in the popup's watch list panel
- **Clear watch list** — Remove all threats when Dwight deems the situation resolved

### Sample Scan Log

```
> Initializing Schrute Farms Security Protocol v4.2...
> Checking for Lackawanna County vulnerabilities...
> Cross-referencing with Schrute Farms beet database...
> Scanning for zombie activity (Class 3 and above)...
> Assessing bear threat level: brown, black, and polar...
> Pinging Mose for perimeter confirmation...
> Assessment complete. Compiling results...
```

## Character Inspiration

Dwight K. Schrute is Assistant (to the) Regional Manager at Dunder Mifflin Scranton and self-appointed head of office security. Dwight takes every threat — real or imagined — with deadly seriousness. He maintains a beet farm, a volunteer constable badge, and an encyclopedic knowledge of survival techniques. He is also deeply suspicious of the internet.

## Why Dwight Would Use It

Dwight would never visit a website without first verifying it poses no threat to Dunder Mifflin's paper supply chain, employee safety, or the greater Lackawanna County region. He built his own security protocol specifically because the existing IT infrastructure (run by a "lazy temp") is inadequate. The watch list gives him documented evidence of digital threats for his incident reports.

*"Identity theft is not a joke, Jim!"* — Dwight K. Schrute

## Installation

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer Mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select this `dwight_schrute/` folder
5. Click the extension icon on any website to begin your threat assessment
6. Remain vigilant at all times

## File Structure

```
dwight_schrute/
├── manifest.json   # Manifest V3 config
├── popup.html      # Popup UI structure
├── popup.css       # Styling (military/government aesthetic)
├── popup.js        # Scan logic, storage, watch list management
├── icon16.png      # Extension icon (16x16)
├── icon48.png      # Extension icon (48x48)
└── icon128.png     # Extension icon (128x128)
```

## Technical Notes

- **Manifest V3** — uses `action.default_popup` for the browser action
- **Permissions**: `activeTab` (read current URL), `storage` (persist watch list), `tabs` (get tab URL)
- **No external dependencies** — all logic is self-contained vanilla JS
- **`chrome.storage.local`** — watch list persists across browser sessions
