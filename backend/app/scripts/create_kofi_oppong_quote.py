#!/usr/bin/env python3
"""
Script to create complete quote for Kofi Oppong via command line
This script creates customer, project, appliances, sizing, and quote
"""

import sys
import os
import requests
import json
from typing import Optional

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Configuration - UPDATE THESE FOR YOUR ENVIRONMENT
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000/api")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@energyprecisions.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

class QuoteCreator:
    def __init__(self, base_url: str, email: str, password: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.token = None
        self.email = email
        self.password = password
    
    def login(self) -> bool:
        """Login and get JWT token"""
        try:
            response = self.session.post(
                f"{self.base_url}/auth/login",
                data={
                    "username": self.email,
                    "password": self.password
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            response.raise_for_status()
            data = response.json()
            self.token = data.get("access_token")
            self.session.headers.update({
                "Authorization": f"Bearer {self.token}"
            })
            print("✓ Login successful")
            return True
        except Exception as e:
            print(f"✗ Login failed: {e}")
            return False
    
    def create_customer(self) -> Optional[int]:
        """Create Kofi Oppong customer"""
        customer_data = {
            "name": "Kofi Oppong",
            "phone": "+447404919168",
            "email": "kofi.oppong@example.com",  # Valid email required
            "address": "Agbogba",
            "city": "Accra",
            "country": "Ghana"
        }
        try:
            response = self.session.post(
                f"{self.base_url}/customers/",
                json=customer_data
            )
            response.raise_for_status()
            customer = response.json()
            print(f"✓ Customer created: {customer['name']} (ID: {customer['id']})")
            return customer['id']
        except Exception as e:
            print(f"✗ Failed to create customer: {e}")
            if hasattr(e, 'response'):
                print(f"  Response: {e.response.text}")
            return None
    
    def create_project(self, customer_id: int) -> Optional[int]:
        """Create project for Kofi Oppong"""
        project_data = {
            "customer_id": customer_id,
            "name": "Solaris Power System - Standard Load",
            "reference_code": "KOFI-OPPONG-001",
            "system_type": "hybrid"
        }
        try:
            response = self.session.post(
                f"{self.base_url}/projects/",
                json=project_data
            )
            response.raise_for_status()
            project = response.json()
            print(f"✓ Project created: {project['name']} (ID: {project['id']})")
            return project['id']
        except Exception as e:
            print(f"✗ Failed to create project: {e}")
            if hasattr(e, 'response'):
                print(f"  Response: {e.response.text}")
            return None
    
    def create_appliance(self, project_id: int, appliance_data: dict) -> Optional[int]:
        """Create an appliance"""
        appliance_data['project_id'] = project_id
        try:
            response = self.session.post(
                f"{self.base_url}/appliances/",
                json=appliance_data
            )
            response.raise_for_status()
            appliance = response.json()
            print(f"  ✓ {appliance['description']} ({appliance['power_value']}{appliance['power_unit']} × {appliance['quantity']})")
            return appliance['id']
        except Exception as e:
            print(f"  ✗ Failed to create appliance {appliance_data.get('description')}: {e}")
            if hasattr(e, 'response'):
                print(f"    Response: {e.response.text}")
            return None
    
    def add_all_appliances(self, project_id: int):
        """Add all appliances from competitor invoice"""
        appliances = [
            {
                "category": "lighting",
                "appliance_type": "led_bulb",
                "description": "Lighting (Outside Lights)",
                "power_value": 15,
                "power_unit": "W",
                "quantity": 15,
                "hours_per_day": 12,
                "is_essential": True
            },
            {
                "category": "lighting",
                "appliance_type": "led_bulb",
                "description": "Lighting (Interior Lights)",
                "power_value": 15,
                "power_unit": "W",
                "quantity": 20,
                "hours_per_day": 5,
                "is_essential": False
            },
            {
                "category": "cooling",
                "appliance_type": "ceiling_fan",
                "description": "Fans",
                "power_value": 70,
                "power_unit": "W",
                "quantity": 5,
                "hours_per_day": 10,
                "is_essential": False
            },
            {
                "category": "entertainment",
                "appliance_type": "tv",
                "description": "TV",
                "power_value": 100,
                "power_unit": "W",
                "quantity": 1,
                "hours_per_day": 5,
                "is_essential": False
            },
            {
                "category": "refrigeration",
                "appliance_type": "refrigerator",
                "description": "Fridge",
                "power_value": 120,
                "power_unit": "W",
                "quantity": 2,
                "hours_per_day": 10,
                "is_essential": True
            },
            {
                "category": "other",
                "appliance_type": "other",
                "description": "Other Loads",
                "power_value": 1500,
                "power_unit": "W",
                "quantity": 1,
                "hours_per_day": 4,
                "is_essential": False
            }
        ]
        
        print(f"\nAdding {len(appliances)} appliances...")
        appliance_ids = []
        for app in appliances:
            app_id = self.create_appliance(project_id, app)
            if app_id:
                appliance_ids.append(app_id)
        
        print(f"✓ Added {len(appliance_ids)}/{len(appliances)} appliances")
        return appliance_ids
    
    def calculate_sizing(self, project_id: int) -> bool:
        """Calculate system sizing from appliances"""
        try:
            response = self.session.post(
                f"{self.base_url}/sizing/from-appliances/{project_id}",
                json={
                    "location": "Agbogba",
                    "panel_brand": "Jinko",
                    "backup_hours": 10,
                    "essential_load_percent": 50
                }
            )
            response.raise_for_status()
            sizing = response.json()
            print(f"\n✓ Sizing calculated:")
            print(f"  - System Size: {sizing.get('system_size_kw')} kW")
            print(f"  - Panels: {sizing.get('number_of_panels')} × {sizing.get('panel_wattage')}W")
            print(f"  - Inverter: {sizing.get('inverter_size_kw')} kW")
            if sizing.get('battery_capacity_kwh'):
                print(f"  - Battery: {sizing.get('battery_capacity_kwh')} kWh")
            return True
        except Exception as e:
            print(f"✗ Failed to calculate sizing: {e}")
            if hasattr(e, 'response'):
                print(f"  Response: {e.response.text}")
            return False
    
    def create_quote(self, project_id: int) -> Optional[int]:
        """Create quote with auto-generated items"""
        quote_data = {
            "project_id": project_id,
            "validity_days": 30,
            "payment_terms": """PAYMENT TERMS:
- 30% deposit upon acceptance of quote
- 40% upon delivery of equipment
- 30% upon completion and testing

INSTALLATION:
- Installation timeline: 2-3 weeks from deposit
- Includes: Site survey, installation, testing, and customer training
- Warranty: 5 years on system, 25 years on panels""",
            "notes": """COMPETITIVE ADVANTAGES:

1. ENGINEERING ACCURACY
   - System designed using industry-standard engineering factors
   - Location-specific solar data for Agbogba/Accra
   - Optimized DC/AC ratio prevents inverter clipping
   - Accounts for real-world losses (inverter, wiring, temperature, soiling)

2. MODERN COMPONENTS
   - Premium panel brands (Jinko/Longi/JA) with 25-year warranty
   - High-efficiency inverters with advanced monitoring
   - Lithium batteries (LiFePO4) vs traditional lead-acid:
     * 3x longer lifespan (10+ years vs 3-5 years)
     * 85% depth of discharge vs 50%
     * No maintenance required
     * Faster charging

3. TRANSPARENT CALCULATIONS
   - All sizing calculations shown and explained in System Specifications
   - No hidden assumptions
   - Verifiable engineering methodology

4. WARRANTY & SUPPORT
   - 5 years comprehensive warranty on system
   - 25-year performance warranty on panels
   - Post-installation support and monitoring
   - Training on system operation"""
        }
        try:
            response = self.session.post(
                f"{self.base_url}/quotes/",
                params={"auto_generate_items": "true"},
                json=quote_data
            )
            response.raise_for_status()
            quote = response.json()
            print(f"\n✓ Quote created: {quote['quote_number']} (ID: {quote['id']})")
            print(f"  - Total: GH₵ {quote.get('grand_total', 0):,.2f}")
            print(f"  - Items: {len(quote.get('items', []))}")
            return quote['id']
        except Exception as e:
            print(f"✗ Failed to create quote: {e}")
            if hasattr(e, 'response'):
                print(f"  Response: {e.response.text}")
            return None
    
    def get_pdf_url(self, quote_id: int) -> Optional[str]:
        """Get PDF download URL"""
        return f"{self.base_url}/quotes/{quote_id}/pdf"
    
    def run(self):
        """Run the complete process"""
        print("=" * 60)
        print("Creating Complete Quote for Kofi Oppong")
        print("=" * 60)
        
        # Login
        if not self.login():
            return False
        
        # Create customer
        print("\n1. Creating customer...")
        customer_id = self.create_customer()
        if not customer_id:
            return False
        
        # Create project
        print("\n2. Creating project...")
        project_id = self.create_project(customer_id)
        if not project_id:
            return False
        
        # Add appliances
        print("\n3. Adding appliances...")
        self.add_all_appliances(project_id)
        
        # Calculate sizing
        print("\n4. Calculating system sizing...")
        if not self.calculate_sizing(project_id):
            print("  Warning: Sizing calculation failed, but continuing...")
        
        # Create quote
        print("\n5. Creating quote...")
        quote_id = self.create_quote(project_id)
        if not quote_id:
            return False
        
        # Success
        print("\n" + "=" * 60)
        print("✓ SUCCESS! Quote created successfully")
        print("=" * 60)
        print(f"\nQuote ID: {quote_id}")
        print(f"PDF URL: {self.get_pdf_url(quote_id)}")
        print(f"\nTo download PDF, visit:")
        print(f"  {self.base_url.replace('/api', '')}/quotes/{quote_id}")
        print("\nOr use curl:")
        print(f"  curl -H 'Authorization: Bearer {self.token}' {self.get_pdf_url(quote_id)} -o quote.pdf")
        
        return True


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Create quote for Kofi Oppong")
    parser.add_argument(
        "--api-url",
        default=API_BASE_URL,
        help=f"API base URL (default: {API_BASE_URL})"
    )
    parser.add_argument(
        "--email",
        default=ADMIN_EMAIL,
        help=f"Admin email (default: {ADMIN_EMAIL})"
    )
    parser.add_argument(
        "--password",
        default=ADMIN_PASSWORD,
        help=f"Admin password (default: {ADMIN_PASSWORD})"
    )
    
    args = parser.parse_args()
    
    creator = QuoteCreator(args.api_url, args.email, args.password)
    success = creator.run()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()

