#!/bin/bash
# Quick wrapper script to create Kofi Oppong quote

# Default values
API_URL="${API_BASE_URL:-http://localhost:8000/api}"
EMAIL="${ADMIN_EMAIL:-admin@energyprecisions.com}"
PASSWORD="${ADMIN_PASSWORD:-admin123}"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --api-url)
            API_URL="$2"
            shift 2
            ;;
        --email)
            EMAIL="$2"
            shift 2
            ;;
        --password)
            PASSWORD="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --api-url URL     API base URL (default: http://localhost:8000/api)"
            echo "  --email EMAIL     Admin email (default: admin@energyprecisions.com)"
            echo "  --password PASS   Admin password (default: admin123)"
            echo ""
            echo "Environment variables:"
            echo "  API_BASE_URL      API base URL"
            echo "  ADMIN_EMAIL       Admin email"
            echo "  ADMIN_PASSWORD    Admin password"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 not found. Please install Python 3.7+"
    exit 1
fi

# Check if requests library is installed
if ! python3 -c "import requests" 2>/dev/null; then
    echo "Error: requests library not found"
    echo "Install it with: pip install requests"
    exit 1
fi

# Run the script
echo "Creating quote for Kofi Oppong..."
echo "API URL: $API_URL"
echo ""

python3 backend/app/scripts/create_kofi_oppong_quote.py \
    --api-url "$API_URL" \
    --email "$EMAIL" \
    --password "$PASSWORD"







