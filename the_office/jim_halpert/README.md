# Prank Planner

> *"The Adventures of Jimmy Halpert — Volume 1."*
> — Jim Halpert, signing a card

## What It Does

Jim Halpert's personal prank idea notebook, disguised as a mundane productivity app called "Project Tracker" from the "Halpert Productivity Suite." It looks completely normal at first glance. It is not.

### Features

- **Prank notebook** — Add, track, and check off prank entries, each with:
  - **Target** — who's getting pranked (usually Dwight)
  - **Description** — the full plan
  - **Difficulty rating** — 1–5 Jell-O molds 🍮🍮🍮🍮🍮
  - **Status** — Planned / In Progress / Complete / Dwight Suspected
- **Pre-loaded with 5 classic pranks** from the show on first install:
  1. Stapler in Jell-O
  2. CIA recruitment prank
  3. Dress as Dwight day
  4. Desk moved to bathroom
  5. Fax from Future Dwight
- **Persistent storage** — all pranks saved to `chrome.storage.local` so they survive browser restarts
- **Check off completed pranks** — struck-through with a satisfying checkmark
- **Delete pranks** — when the evidence needs to disappear
- **"Look at camera" button** — a subtle 😏 emoji in the header corner that, when clicked, flashes a dramatic fullscreen Jim-face (😏) with dark overlay — his iconic camera glance, perfectly timed

## Character Inspiration

Jim Halpert is a salesman at Dunder Mifflin Scranton who channels his considerable intellect primarily into pranking Dwight Schrute. Over nine seasons, Jim executed dozens of increasingly elaborate pranks — from the simple (stapler in Jell-O) to the masterful (convincing Dwight he was being recruited by the CIA). Jim is smart enough to disguise his prank notebook as a productivity tool that would pass a casual desk inspection by Dwight.

## Why Jim Would Use It

Jim needs a discreet place to log prank ideas that won't arouse Dwight's suspicion. He can't keep notes in plain sight — Dwight regularly inspects desks as part of his "security protocol." A browser extension that looks like a generic task manager is perfect cover. The camera glance button is there because Jim can't help himself.

*"I stopped caring a long time ago. Jim Halpert's been pulling pranks since day one."* — Dwight (grudgingly)

## Installation

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer Mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select this `jim_halpert/` folder
5. Click the green clipboard icon in your toolbar
6. Begin planning. Dwight will never see it coming.

## File Structure

```
jim_halpert/
├── manifest.json   # Manifest V3 config
├── popup.html      # Popup UI (looks like a boring task app)
├── popup.css       # Styling (deliberately understated)
├── popup.js        # Prank CRUD logic, Jell-O rating, camera glance
├── icon16.png      # Extension icon (16x16)
├── icon48.png      # Extension icon (48x48)
└── icon128.png     # Extension icon (128x128)
```

## Technical Notes

- **Manifest V3** — uses `action.default_popup`
- **Permissions**: `storage` (prank persistence), `sidePanel` (reserved for future use)
- **No external dependencies** — 100% vanilla JS and CSS
- **`chrome.storage.local`** — pranks persist across sessions
- First run automatically seeds the 5 classic pranks so the notebook isn't empty on install
