# netflix-skip-intro - Chrome Extension

A Chrome extension that **automatically clicks** on specific text like "Skip", "Skip Ad", and "Skip Intro" when they appear on screen. Perfect for skipping YouTube ads, video intros, and more.

## Features

### 🚀 Auto-Click (Runs Automatically)
- Monitors pages for target text in real-time
- Automatically clicks "Skip", "Skip Ad", "Skip Ads", "Skip Intro" when they appear
- Works on YouTube, streaming sites, and any webpage
- Uses MutationObserver to detect dynamically loaded content
- Configurable - add your own target texts

### 🎯 Manual Click
- Enter any text and click matching elements on demand
- Highlight-only mode to preview matches
- Case sensitive and exact match options

## Default Target Texts

The extension automatically clicks on:
- `Skip`
- `Skip Ad`
- `Skip Ads`
- `Skip Intro`
- `Skip intro`

You can add or remove targets through the extension popup.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top right corner)
3. Click **Load unpacked**
4. Select the `chrome-text-clicker` folder (`/Users/skumar149/chrome-text-clicker`)
5. The extension icon will appear in your Chrome toolbar

## Usage

### Auto-Click Mode (Default)
1. Install the extension - it works automatically!
2. Visit YouTube or any site with skip buttons
3. The extension will click "Skip" buttons as soon as they appear

### Configure Targets
1. Click the extension icon
2. Toggle auto-click on/off with the switch
3. Add new target texts using the input field
4. Remove targets by clicking the × button

### Manual Mode
1. Click the extension icon
2. Scroll to "Manual Click" section
3. Enter text you want to click
4. Choose options (case sensitive, exact match)
5. Click "Click" or "Find" button

## How It Works

1. **Content Script**: Runs on every page, monitoring for target elements
2. **MutationObserver**: Detects when new elements appear (like YouTube ad skip buttons)
3. **Smart Detection**: Checks buttons, links, and elements with skip-related classes
4. **Click Simulation**: Performs native click and dispatches mouse events for maximum compatibility

## Permissions

- `activeTab`: Access to the currently active tab
- `scripting`: Inject scripts to find and click elements
- `storage`: Save your target text preferences

## Notes

- The extension runs on all websites by default
- Cannot run on Chrome internal pages (`chrome://`)
- Respects a 500ms cooldown between clicks to avoid duplicate actions
- Console logs clicks for debugging (`[Text Clicker] Clicked: "..."`)

## Troubleshooting

If skip buttons aren't being clicked:
1. Check that auto-click is enabled (green toggle)
2. Verify the exact text matches your targets
3. Open DevTools Console to see click logs
4. Try adding the exact button text as a new target
