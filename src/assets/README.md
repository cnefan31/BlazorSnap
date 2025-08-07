# Extension Assets

This directory contains the icon files for the BlazorSnap browser extension.

## Icon Files

- **`icon16.png`** - 16x16 pixels - Used in the extension management page
- **`icon48.png`** - 48x48 pixels - Used in the extensions management page
- **`icon128.png`** - 128x128 pixels - Used during installation and in the Chrome Web Store

## Icon Guidelines

The icons should:
- Be clear and recognizable at small sizes
- Follow the Blazor/fire theme (🔥)
- Have proper transparency for overlay on different backgrounds
- Be optimized for web use (small file sizes)

## Updating Icons

If you need to update the icons:
1. Ensure all three sizes are available
2. Update the references in `manifest.json` if needed
3. Test the extension to ensure icons display correctly
