# Doodle Tab

> *"I'm not going to be your receptionist forever."*
> — Pam Beesly (who is secretly an artist)

## What It Does

Injects a floating, toggleable drawing canvas overlay into any webpage, so Pam can doodle on top of the internet the way she doodles on paper at her reception desk.

### Features

- **Floating canvas widget** — A small 🖌️ paintbrush button docks at the bottom-left corner of every webpage. Click it to expand a full drawing canvas overlay
- **Drawing tools:**
  - **10-color muted artistic palette** — charcoal, mauve rose, sage green, dusty pink, muted blue, warm gold, earthy brown, soft purple, terracotta, and white
  - **Adjustable brush size** — slider from 1px to 30px
  - **Eraser tool** — erase specific marks without clearing everything
  - **Clear button** — wipe the canvas and delete the saved doodle for that site
- **Persistent doodles** — saved per-domain in `chrome.storage.local`. Pam's art survives page refreshes and comes back when she returns to the same site
- **Art Show** — the popup includes a gallery grid of all saved doodles as thumbnails, one per domain. Each thumbnail shows the site it was drawn on and a delete button
- **Visibility persistence** — if Pam had the canvas open when she left a site, it reopens automatically when she returns

### How to Use

1. Click the 🖌️ icon in the Chrome toolbar to open the popup
2. Click **"Show Drawing Canvas"** to inject the canvas on the current page
3. Click the floating 🖌️ button at the bottom-left of any page to expand/collapse the drawing panel
4. Draw with your mouse or trackpad
5. Your doodle saves automatically after each stroke
6. Open the popup anytime to see your **Art Show** gallery

## Character Inspiration

Pam Beesly is the receptionist at Dunder Mifflin Scranton — for now. She's a talented artist who keeps her passion simmering beneath the surface of a mundane desk job. She draws on paper at work, daydreams about art school, and eventually follows that dream. Pam would doodle on everything if she could — and with this extension, she can doodle on every webpage she visits.

## Why Pam Would Use It

Pam spends her days looking at the same boring websites — the Dunder Mifflin supplier portal, regional paper distributor order forms, Scranton Business Park calendars. She'd sneak in little sketches on top of these pages the way she fills the margins of call logs with drawings. The Art Show gives her a tiny, private gallery of her work — which is more than the office ever gave her before her mural.

*"I just think it's better to do something than to not do something."* — Pam Beesly

## Installation

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer Mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select this `pam_beesly/` folder
5. Navigate to any webpage
6. Click the 🖌️ icon in your Chrome toolbar
7. Click **"Show Drawing Canvas"** — then click the floating 🖌️ button to start drawing

## File Structure

```
pam_beesly/
├── manifest.json   # Manifest V3 config
├── popup.html      # Popup: toggle + Art Show gallery
├── popup.css       # Popup styling (warm, artistic palette)
├── popup.js        # Popup logic: toggle, gallery, storage
├── content.js      # Content script: builds & injects canvas widget
├── content.css     # Minimal CSS reset for canvas isolation
├── icon16.png      # Extension icon (16x16)
├── icon48.png      # Extension icon (48x48)
└── icon128.png     # Extension icon (128x128)
```

## Technical Notes

- **Manifest V3** — uses `content_scripts` (auto-injected) + `action.default_popup`
- **Permissions**: `storage` (save doodles), `activeTab` + `scripting` (toggle canvas via popup)
- **Canvas rendering** — uses the HTML5 Canvas 2D API with `pointer` events for smooth drawing
- **Doodles stored as PNG data URLs** in `chrome.storage.local` keyed by domain
- **Isolation** — inline styles prevent host-page CSS from breaking the canvas widget
- **No external dependencies** — 100% vanilla JS, no libraries
- **Debounced saving** — waits 800ms after last stroke to save, avoiding excessive storage writes

## Known Limitations

- Cannot inject into `chrome://` pages or the Chrome Web Store (browser restriction)
- Very large doodles on high-resolution canvases may hit Chrome's storage limits — the canvas is kept at 320×200px for efficiency
- Eraser uses `destination-out` compositing, which requires the canvas background to remain transparent (the white appearance comes from CSS, not the canvas fill)
