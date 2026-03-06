# World's Best Boss Tab

> *"Would I rather be feared or loved? Easy. Both. I want people to be afraid of how much they love me."*
> — Michael Scott

## What It Does

Replaces your browser's new tab page with a motivational **World's Best Boss** dashboard, exactly as Michael Scott would design it if given unsupervised access to a computer.

### Features

- **CSS coffee mug** — A hand-drawn (pure CSS, no images) World's Best Boss mug with animated steam wisps
- **25 Michael Scott quotes** — A random quote appears every time you open a new tab. Each one is a genuine gem from the Scranton branch's finest manager
- **"That's what she said!" button** — Appends the sacred phrase to whatever quote is showing, with a pop animation inline *and* a dramatic fullscreen flash overlay
- **New Quote button** — Can't wait for a new tab? Hit this to cycle to another quote immediately
- **Live clock & date** — Displays the current time and date under the label *"Time at the World's Best Branch:"* because every moment at Dunder Mifflin is precious

## Character Inspiration

Michael Scott is the Regional Manager of Dunder Mifflin's Scranton branch and the self-proclaimed World's Best Boss (he bought himself that mug). Michael's entire identity revolves around being liked, being the center of attention, and reminding everyone — constantly — how great he is. He would 100% customize his browser to greet him with affirmations each morning, show it to every client who sat at his desk, and interrupt important meetings to demonstrate the "That's what she said" button.

## Why Michael Would Use It

Michael doesn't just want to be a good boss. He wants everyone to *know* he's the best boss. This extension is the digital equivalent of the "World's Best Boss" mug — a daily reminder to himself and a trophy to show visitors. He would also use the "That's what she said" feature approximately 40 times per day, regardless of context.

*"An office is a place where dreams come true."* — Michael Scott

## Installation

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer Mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select this `michael_scott/` folder
5. Open a new tab — prepare to be managed

## File Structure

```
michael_scott/
├── manifest.json     # Manifest V3 config
├── newtab.html       # New tab page structure
├── newtab.css        # All styling (CSS mug, animations, layout)
├── newtab.js         # Clock, quotes, TWSS logic
├── icon16.png        # Extension icon (16x16)
├── icon48.png        # Extension icon (48x48)
└── icon128.png       # Extension icon (128x128)
```

## Technical Notes

- **Manifest V3** — uses `chrome_url_overrides` to replace the new tab page
- **Zero external dependencies** — all CSS, all JS, no CDN, no images (the mug is pure CSS)
- **No permissions required** — this extension needs nothing from Chrome's permission system
