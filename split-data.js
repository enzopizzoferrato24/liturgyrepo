#!/usr/bin/env node

/**
 * One-time script to split data.json into individual files for Netlify CMS
 * This only needs to be run once to migrate from single JSON to individual files
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'data.json');
const ENTRIES_DIR = path.join(__dirname, 'data', 'entries');
const ERAS_DIR = path.join(__dirname, 'data', 'eras');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function splitData() {
  console.log('Splitting data.json into individual files...');

  // Read the main data file
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

  // Create directories if they don't exist
  if (!fs.existsSync(ENTRIES_DIR)) {
    fs.mkdirSync(ENTRIES_DIR, { recursive: true });
  }
  if (!fs.existsSync(ERAS_DIR)) {
    fs.mkdirSync(ERAS_DIR, { recursive: true });
  }

  // Split entries
  console.log(`Splitting ${data.entries.length} entries...`);
  data.entries.forEach(entry => {
    const year = entry.year || 'unknown';
    const author = slugify(entry.author || 'anonymous');
    const filename = `${year}-${author}-${entry.id}.json`;
    const filepath = path.join(ENTRIES_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(entry, null, 2), 'utf8');
  });
  console.log(`✓ Created ${data.entries.length} entry files in ${ENTRIES_DIR}`);

  // Split eras
  console.log(`Splitting ${data.eras.length} eras...`);
  data.eras.forEach(era => {
    const filename = `${slugify(era.name)}.json`;
    const filepath = path.join(ERAS_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(era, null, 2), 'utf8');
  });
  console.log(`✓ Created ${data.eras.length} era files in ${ERAS_DIR}`);

  console.log('\n✓ Split complete! You can now use Netlify CMS to edit entries.');
  console.log('  Run "node build-data.js" to rebuild data.json from individual files.');
}

// Run the split
try {
  splitData();
} catch (error) {
  console.error('Error splitting data:', error);
  process.exit(1);
}
