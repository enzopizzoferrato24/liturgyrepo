#!/usr/bin/env node

/**
 * Build script to compile individual entry/era files into data.json
 * Run this after Netlify CMS makes changes to rebuild the main data file
 */

const fs = require('fs');
const path = require('path');

const ENTRIES_DIR = path.join(__dirname, 'data', 'entries');
const ERAS_DIR = path.join(__dirname, 'data', 'eras');
const OUTPUT_FILE = path.join(__dirname, 'data', 'data.json');

function readJsonFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory ${dir} does not exist, creating...`);
    fs.mkdirSync(dir, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  return files.map(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    return JSON.parse(content);
  });
}

function buildData() {
  console.log('Building data.json from individual files...');

  // Read all entries
  const entries = readJsonFiles(ENTRIES_DIR);
  console.log(`Found ${entries.length} entries`);

  // Read all eras
  const eras = readJsonFiles(ERAS_DIR);
  console.log(`Found ${eras.length} eras`);

  // Sort entries by ID
  entries.sort((a, b) => (a.id || 0) - (b.id || 0));

  // Build final data structure
  const data = {
    entries,
    eras
  };

  // Write to data.json
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✓ Successfully built ${OUTPUT_FILE}`);
  console.log(`  - ${entries.length} entries`);
  console.log(`  - ${eras.length} eras`);
}

// Run the build
try {
  buildData();
} catch (error) {
  console.error('Error building data:', error);
  process.exit(1);
}
