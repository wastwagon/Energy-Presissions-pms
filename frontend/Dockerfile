FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Fix ajv-keywords compatibility issue by creating the missing path
RUN cd node_modules/ajv && \
    mkdir -p dist/compile && \
    if [ -f "lib/compile/codegen/index.js" ]; then \
      echo "module.exports = require('../../lib/compile/codegen');" > dist/compile/codegen.js; \
    elif [ -f "lib/compile/codegen.js" ]; then \
      echo "module.exports = require('../../lib/compile/codegen');" > dist/compile/codegen.js; \
    else \
      echo "module.exports = {};" > dist/compile/codegen.js; \
    fi || true

# Copy application code
COPY . .

# Copy and make startup script executable
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose port
EXPOSE 3000

# Start development server with fix
CMD ["sh", "/app/start.sh"]

