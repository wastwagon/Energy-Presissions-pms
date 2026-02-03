#!/bin/sh
# Test script to run in Render shell

echo "=== Testing API URL Injection ==="
echo ""

# Check if environment variable is set
echo "1. Checking REACT_APP_API_URL environment variable:"
echo "   REACT_APP_API_URL=$REACT_APP_API_URL"
echo ""

# Check if index.html exists
echo "2. Checking if index.html exists:"
if [ -f "/usr/share/nginx/html/index.html" ]; then
    echo "   ✓ index.html found"
    echo "   File size: $(wc -c < /usr/share/nginx/html/index.html) bytes"
else
    echo "   ✗ index.html NOT found"
    exit 1
fi
echo ""

# Show the current content
echo "3. Current content of the script tag:"
grep -A 2 "REACT_APP_API_URL" /usr/share/nginx/html/index.html || echo "   Pattern not found"
echo ""

# Run the injection script
echo "4. Running injection script:"
node /inject-api-url.js
echo ""

# Show the updated content
echo "5. Updated content of the script tag:"
grep -A 2 "REACT_APP_API_URL" /usr/share/nginx/html/index.html || echo "   Pattern not found"
echo ""

# Verify the change
echo "6. Verification:"
if grep -q "localhost:8000" /usr/share/nginx/html/index.html; then
    echo "   ✗ Still contains localhost:8000"
else
    echo "   ✓ localhost:8000 removed"
fi

if grep -q "$REACT_APP_API_URL" /usr/share/nginx/html/index.html; then
    echo "   ✓ Contains $REACT_APP_API_URL"
else
    echo "   ✗ Does NOT contain $REACT_APP_API_URL"
fi

echo ""
echo "=== Test Complete ==="








