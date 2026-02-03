# Create Quote Script - Command Line Guide

This script creates a complete quote for Kofi Oppong via command line, including customer, project, appliances, sizing calculation, and quote generation.

## Prerequisites

1. **Python 3.7+** installed
2. **requests** library installed: `pip install requests`
3. **Backend API running** (local or production)
4. **Admin credentials** (email and password)

## Quick Start

### For Local Development

```bash
cd backend
python app/scripts/create_kofi_oppong_quote.py
```

### For Production (Render)

```bash
# Set environment variables
export API_BASE_URL="https://your-backend-url.onrender.com/api"
export ADMIN_EMAIL="admin@energyprecisions.com"
export ADMIN_PASSWORD="your-password"

# Run script
python backend/app/scripts/create_kofi_oppong_quote.py \
  --api-url "$API_BASE_URL" \
  --email "$ADMIN_EMAIL" \
  --password "$ADMIN_PASSWORD"
```

## Command Line Options

```bash
python create_kofi_oppong_quote.py [OPTIONS]

Options:
  --api-url URL     API base URL (default: http://localhost:8000/api)
  --email EMAIL     Admin email (default: admin@energyprecisions.com)
  --password PASS   Admin password (default: admin123)
  -h, --help        Show help message
```

## What the Script Does

1. **Logs in** as admin user
2. **Creates Customer**: Kofi Oppong (Agbogba, Ghana)
3. **Creates Project**: "Solaris Power System - Standard Load"
4. **Adds 6 Appliances**:
   - Lighting (Outside): 15W × 15 units × 12 hrs/day
   - Lighting (Interior): 15W × 20 units × 5 hrs/day
   - Fans: 70W × 5 units × 10 hrs/day
   - TV: 100W × 1 unit × 5 hrs/day
   - Fridge: 120W × 2 units × 10 hrs/day
   - Other Loads: 1500W × 1 unit × 4 hrs/day
5. **Calculates Sizing**: Based on appliances and location (Agbogba)
6. **Creates Quote**: With auto-generated line items and competitive notes
7. **Outputs PDF URL**: Ready to download

## Example Output

```
============================================================
Creating Complete Quote for Kofi Oppong
============================================================
✓ Login successful

1. Creating customer...
✓ Customer created: Kofi Oppong (ID: 1)

2. Creating project...
✓ Project created: Solaris Power System - Standard Load (ID: 1)

3. Adding appliances...
  ✓ Lighting (Outside Lights) (15W × 15)
  ✓ Lighting (Interior Lights) (15W × 20)
  ✓ Fans (70W × 5)
  ✓ TV (100W × 1)
  ✓ Fridge (120W × 2)
  ✓ Other Loads (1500W × 1)
✓ Added 6/6 appliances

4. Calculating system sizing...
✓ Sizing calculated:
  - System Size: 12.5 kW
  - Panels: 22 × 580W
  - Inverter: 10.0 kW
  - Battery: 25.0 kWh

5. Creating quote...
✓ Quote created: QT-A1B2C3D4 (ID: 1)
  - Total: GH₵ 114,094.74
  - Items: 7

============================================================
✓ SUCCESS! Quote created successfully
============================================================

Quote ID: 1
PDF URL: https://your-backend-url.onrender.com/api/quotes/1/pdf

To download PDF, visit:
  https://your-backend-url.onrender.com/quotes/1

Or use curl:
  curl -H 'Authorization: Bearer TOKEN' https://your-backend-url.onrender.com/api/quotes/1/pdf -o quote.pdf
```

## Downloading the PDF

### Option 1: Via Web Interface
1. Log into your admin panel
2. Navigate to Quotes
3. Click on the quote
4. Click "Download PDF"

### Option 2: Via API (curl)

```bash
# First, get your token (from script output or login)
TOKEN="your-jwt-token-here"

# Download PDF
curl -H "Authorization: Bearer $TOKEN" \
  https://your-backend-url.onrender.com/api/quotes/1/pdf \
  -o kofi_oppong_quote.pdf
```

### Option 3: Via Python

```python
import requests

token = "your-jwt-token"
quote_id = 1
api_url = "https://your-backend-url.onrender.com/api"

response = requests.get(
    f"{api_url}/quotes/{quote_id}/pdf",
    headers={"Authorization": f"Bearer {token}"},
    stream=True
)

with open("quote.pdf", "wb") as f:
    f.write(response.content)
```

## Troubleshooting

### Error: "Login failed"
- Check your admin email and password
- Verify the API URL is correct
- Ensure the backend is running

### Error: "Failed to create customer"
- Customer might already exist
- Check API logs for details

### Error: "Failed to calculate sizing"
- Ensure appliances were created successfully
- Check that location "Agbogba" has peak sun hours data
- Verify system settings are configured

### Error: "Failed to create quote"
- Ensure sizing calculation completed
- Check that products are configured in catalog
- Verify project exists

## Customization

To customize the quote data, edit the script:

```python
# In create_kofi_oppong_quote.py, modify:

# Customer data
customer_data = {
    "name": "Your Customer Name",
    # ...
}

# Appliance data
appliances = [
    {
        "description": "Your Appliance",
        "power_value": 100,
        # ...
    }
]

# Quote notes
quote_data = {
    "notes": "Your custom notes...",
    # ...
}
```

## Pushing to Production

After testing locally:

1. **Commit changes**:
   ```bash
   git add backend/app/scripts/create_kofi_oppong_quote.py
   git add backend/app/services/pdf_generator.py
   git add backend/app/services/appliance_catalog.py
   git commit -m "Add command-line quote creation script and enhanced PDF"
   ```

2. **Push to repository**:
   ```bash
   git push origin main
   ```

3. **Rebuild Docker images** (if needed):
   ```bash
   ./build-and-push.sh
   ```

4. **Run script on production**:
   ```bash
   # Set production API URL
   export API_BASE_URL="https://your-production-url.onrender.com/api"
   
   # Run script
   python backend/app/scripts/create_kofi_oppong_quote.py \
     --api-url "$API_BASE_URL" \
     --email "admin@energyprecisions.com" \
     --password "your-production-password"
   ```

## Notes

- The script is idempotent - running it multiple times will create duplicate entries
- To avoid duplicates, check if customer/project already exists before running
- The PDF includes the new "System Specifications" section with all technical details
- All changes are ready to be pushed to production







