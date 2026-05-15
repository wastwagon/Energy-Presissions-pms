FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (lockfile keeps ajv / react-scripts compatible)
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy application code
COPY . .

# Copy and make startup script executable
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose port
EXPOSE 3000

# Start development server with fix
CMD ["sh", "/app/start.sh"]

