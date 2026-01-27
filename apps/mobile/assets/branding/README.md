# PropertyCheck Branding Assets

This folder contains SVG source files for all app icons and branding.

## Files

- `icon.svg` - Main app icon (1024x1024) - Use for iOS and general app icon
- `adaptive-icon.svg` - Android adaptive icon foreground (1024x1024)
- `splash.svg` - Splash screen (1284x2778)
- `favicon.svg` - Favicon for web (32x32)

## How to Generate PNG Icons

### Option 1: Use an Online Converter
1. Go to https://cloudconvert.com/svg-to-png
2. Upload the SVG file
3. Set the desired dimensions
4. Download the PNG

### Option 2: Use Figma
1. Open Figma and create a new file
2. Import the SVG files
3. Export as PNG at the required sizes

### Option 3: Use Command Line (requires Inkscape)
```bash
# Install Inkscape (macOS)
brew install inkscape

# Generate icons
inkscape icon.svg -w 1024 -h 1024 -o ../icon.png
inkscape adaptive-icon.svg -w 1024 -h 1024 -o ../adaptive-icon.png
inkscape splash.svg -w 1284 -h 2778 -o ../splash.png
inkscape favicon.svg -w 32 -h 32 -o ../favicon.png
```

### Option 4: Use ImageMagick
```bash
# Install ImageMagick (macOS)
brew install imagemagick

# Generate icons
convert -background none icon.svg -resize 1024x1024 ../icon.png
convert -background none adaptive-icon.svg -resize 1024x1024 ../adaptive-icon.png
convert -background none splash.svg -resize 1284x2778 ../splash.png
convert -background none favicon.svg -resize 32x32 ../favicon.png
```

## Required Sizes

### iOS App Icon
- 1024x1024 (App Store)

### Android Adaptive Icon
- 1024x1024 foreground (will be masked)
- Background color: #2563eb (configured in app.config.ts)

### Splash Screen
- 1284x2778 (iPhone 14 Pro Max)
- Background color: #0f172a

### Favicon
- 32x32

## Brand Colors

```
Primary:   #2563eb (Royal Blue)
Secondary: #7c3aed (Purple)
Accent:    #06b6d4 (Cyan)
Success:   #10b981 (Emerald)
Dark:      #0f172a (Slate 900)
Light:     #f8fafc (Slate 50)
```
