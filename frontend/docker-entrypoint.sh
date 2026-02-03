#!/bin/sh
# Entrypoint script to inject REACT_APP_API_URL at runtime

# Run Node.js script to inject API URL
node /inject-api-url.js

# Start nginx
exec nginx -g "daemon off;"

