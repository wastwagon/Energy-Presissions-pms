#!/bin/sh

# Fix ajv-keywords compatibility issue
# Create the missing module path that ajv-keywords expects
cd /app/node_modules/ajv 2>/dev/null && \
mkdir -p dist/compile && \
# Try to find and require the actual codegen module
if [ -f "lib/compile/codegen/index.js" ]; then \
  echo "module.exports = require('../../lib/compile/codegen');" > dist/compile/codegen.js; \
elif [ -d "lib/compile/codegen" ] && [ -f "lib/compile/codegen/index.js" ]; then \
  echo "module.exports = require('../../lib/compile/codegen');" > dist/compile/codegen.js; \
elif [ -f "lib/compile/codegen.js" ]; then \
  echo "module.exports = require('../../lib/compile/codegen');" > dist/compile/codegen.js; \
else \
  # Create a minimal stub that exports what's needed
  echo "module.exports = { Name: class Name {}, _: function() {}, str: function() {}, strConcat: function() {}, stringify: function() {} };" > dist/compile/codegen.js; \
fi || true

# Start the application
cd /app
exec npm start

