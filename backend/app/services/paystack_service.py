"""
Paystack Payment Service
Handles Paystack payment integration for Ghana
"""
import requests
from typing import Dict, Optional
from app.config import settings
import os

PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY", "")
PAYSTACK_PUBLIC_KEY = os.getenv("PAYSTACK_PUBLIC_KEY", "")
PAYSTACK_BASE_URL = "https://api.paystack.co"


class PaystackService:
    def __init__(self):
        self.secret_key = PAYSTACK_SECRET_KEY
        self.public_key = PAYSTACK_PUBLIC_KEY
        self.base_url = PAYSTACK_BASE_URL
        self.headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }

    def initialize_transaction(
        self,
        email: str,
        amount: int,  # Amount in kobo (smallest currency unit)
        reference: str,
        callback_url: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Initialize a Paystack transaction
        
        Args:
            email: Customer email
            amount: Amount in kobo (GHS * 100)
            reference: Unique transaction reference
            callback_url: URL to redirect after payment
            metadata: Additional data to pass along
        
        Returns:
            Dict with authorization_url and access_code
        """
        url = f"{self.base_url}/transaction/initialize"
        
        payload = {
            "email": email,
            "amount": amount,
            "reference": reference,
            "callback_url": callback_url,
            "metadata": metadata or {}
        }
        
        try:
            response = requests.post(url, json=payload, headers=self.headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Paystack API error: {str(e)}")

    def verify_transaction(self, reference: str) -> Dict:
        """
        Verify a Paystack transaction
        
        Args:
            reference: Transaction reference
        
        Returns:
            Transaction details
        """
        url = f"{self.base_url}/transaction/verify/{reference}"
        
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Paystack API error: {str(e)}")

    def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        """
        Verify Paystack webhook signature
        
        Args:
            payload: Raw request body
            signature: X-Paystack-Signature header value
        
        Returns:
            True if signature is valid
        """
        import hmac
        import hashlib
        
        secret = self.secret_key.encode('utf-8')
        computed_signature = hmac.new(
            secret,
            payload,
            hashlib.sha512
        ).hexdigest()
        
        return hmac.compare_digest(computed_signature, signature)

    def create_customer(
        self,
        email: str,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        phone: Optional[str] = None
    ) -> Dict:
        """Create a Paystack customer"""
        url = f"{self.base_url}/customer"
        
        payload = {
            "email": email,
            "first_name": first_name or "",
            "last_name": last_name or "",
            "phone": phone or ""
        }
        
        try:
            response = requests.post(url, json=payload, headers=self.headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Paystack API error: {str(e)}")


# Singleton instance
paystack_service = PaystackService()



