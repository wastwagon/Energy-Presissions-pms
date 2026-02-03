#!/usr/bin/env node
// Script to inject REACT_APP_API_URL into index.html at runtime

const fs = require('fs');
const path = '/usr/share/nginx/html/index.html';

// Log to stderr so it appears in Render logs
const log = (msg) => console.error(`[API-URL-Inject] ${msg}`);

const apiUrl = process.env.REACT_APP_API_URL;

log(`Starting injection script. REACT_APP_API_URL=${apiUrl || 'NOT SET'}`);

if (apiUrl) {
  try {
    log(`Reading index.html from ${path}`);
    let html = fs.readFileSync(path, 'utf8');
    
    log(`Original HTML contains: ${html.includes('localhost:8000') ? 'localhost:8000 (found)' : 'localhost:8000 (not found)'}`);
    
    // Replace the entire script tag line - try multiple patterns (including minified)
    const patterns = [
      // Minified format (no spaces)
      /window\.REACT_APP_API_URL=window\.REACT_APP_API_URL\|\|["']http:\/\/localhost:8000["']/g,
      // With spaces
      /window\.REACT_APP_API_URL = window\.REACT_APP_API_URL \|\| ['"]http:\/\/localhost:8000['"];/g,
      /window\.REACT_APP_API_URL = window\.REACT_APP_API_URL \|\| 'http:\/\/localhost:8000';/g,
      /window\.REACT_APP_API_URL = window\.REACT_APP_API_URL \|\| "http:\/\/localhost:8000";/g,
    ];
    
    let replaced = false;
    for (const pattern of patterns) {
      if (pattern.test(html)) {
        // Replace with minified format to match the HTML structure
        html = html.replace(pattern, `window.REACT_APP_API_URL="${apiUrl}"`);
        replaced = true;
        log(`Replaced using pattern: ${pattern}`);
        break;
      }
    }
    
    // Also replace any remaining localhost references (minified or not)
    html = html.replace(/http:\/\/localhost:8000/g, apiUrl);
    
    fs.writeFileSync(path, html, 'utf8');
    log(`Successfully injected API URL: ${apiUrl}`);
    log(`Final HTML contains: ${html.includes(apiUrl) ? `${apiUrl} (found)` : `${apiUrl} (not found)`}`);
  } catch (error) {
    log(`Error injecting API URL: ${error.message}`);
    log(`Stack: ${error.stack}`);
    process.exit(1);
  }
} else {
  log('REACT_APP_API_URL not set, skipping injection');
}

