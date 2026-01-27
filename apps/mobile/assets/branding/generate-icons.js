#!/usr/bin/env node

/**
 * Generate PNG icons from SVG source files
 *
 * Usage:
 *   npm install sharp
 *   node generate-icons.js
 *
 * Or run directly:
 *   npx ts-node generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is installed
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Error: sharp is not installed.');
  console.error('Please install it first:');
  console.error('  npm install sharp');
  process.exit(1);
}

const ICONS = [
  { input: 'icon.svg', output: '../icon.png', width: 1024, height: 1024 },
  { input: 'adaptive-icon.svg', output: '../adaptive-icon.png', width: 1024, height: 1024 },
  { input: 'splash.svg', output: '../splash.png', width: 1284, height: 2778 },
  { input: 'favicon.svg', output: '../favicon.png', width: 32, height: 32 },
];

async function generateIcons() {
  console.log('Generating PNG icons from SVG sources...\n');

  for (const icon of ICONS) {
    const inputPath = path.join(__dirname, icon.input);
    const outputPath = path.join(__dirname, icon.output);

    if (!fs.existsSync(inputPath)) {
      console.error(`  ✗ ${icon.input} not found, skipping...`);
      continue;
    }

    try {
      await sharp(inputPath)
        .resize(icon.width, icon.height)
        .png()
        .toFile(outputPath);

      console.log(`  ✓ Generated ${icon.output} (${icon.width}x${icon.height})`);
    } catch (err) {
      console.error(`  ✗ Error generating ${icon.output}:`, err.message);
    }
  }

  console.log('\nDone! PNG icons have been generated in the assets folder.');
  console.log('Run "npx expo prebuild --clean" to rebuild the native project.');
}

generateIcons().catch(console.error);
