"""
SendGrid Email Service
Handles transactional emails for orders and notifications
"""
import os
from typing import Dict, Optional, List

# Lazy import SendGrid - only import when actually needed
try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail, TemplateId, Email, To, Content
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False
    print("⚠️  SendGrid not installed. Email service will not work. Install with: pip install sendgrid")

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")
SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL", "noreply@energyprecisions.com")
SENDGRID_FROM_NAME = os.getenv("SENDGRID_FROM_NAME", "Energy Precisions")


class EmailService:
    def __init__(self):
        if not SENDGRID_AVAILABLE:
            print("⚠️  SendGrid not available. Email service will not work.")
            self.sg = None
        elif not SENDGRID_API_KEY:
            print("⚠️  SENDGRID_API_KEY not set. Email service will not work.")
            self.sg = None
        else:
            self.sg = SendGridAPIClient(SENDGRID_API_KEY)
        self.from_email = SENDGRID_FROM_EMAIL
        self.from_name = SENDGRID_FROM_NAME

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send a basic email"""
        if not self.sg:
            print(f"⚠️  Email service not configured. Would send to {to_email}: {subject}")
            return False

        try:
            message = Mail(
                from_email=Email(self.from_email, self.from_name),
                to_emails=To(to_email),
                subject=subject,
                html_content=Content("text/html", html_content)
            )
            if text_content:
                message.add_content(Content("text/plain", text_content))

            response = self.sg.send(message)
            return response.status_code == 202
        except Exception as e:
            print(f"❌ Error sending email: {e}")
            return False

    def send_order_confirmation(self, order: Dict, customer_email: str) -> bool:
        """Send order confirmation email"""
        subject = f"Order Confirmation - {order.get('order_number', 'N/A')}"
        
        items_html = ""
        for item in order.get('items', []):
            items_html += f"""
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    {item.get('product_name', 'Product')}
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
                    {item.get('quantity', 0)}
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                    GHS {item.get('unit_price', 0):,.2f}
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                    GHS {item.get('total_price', 0):,.2f}
                </td>
            </tr>
            """

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #1a4d7a; color: white; padding: 20px; text-align: center; }}
                .content {{ background: #f9f9f9; padding: 20px; }}
                .order-details {{ background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }}
                table {{ width: 100%; border-collapse: collapse; }}
                th {{ background: #00E676; color: white; padding: 10px; text-align: left; }}
                .total {{ font-size: 18px; font-weight: bold; color: #1a4d7a; }}
                .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Thank You for Your Order!</h1>
                </div>
                <div class="content">
                    <p>Hi {order.get('customer_name', 'Customer')},</p>
                    <p>Your order <strong>{order.get('order_number', 'N/A')}</strong> has been confirmed.</p>
                    
                    <div class="order-details">
                        <h2>Order Details</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th style="text-align: center;">Qty</th>
                                    <th style="text-align: right;">Price</th>
                                    <th style="text-align: right;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items_html}
                            </tbody>
                        </table>
                        <div style="margin-top: 20px; text-align: right;">
                            <p><strong>Subtotal:</strong> GHS {order.get('subtotal', 0):,.2f}</p>
                            <p><strong>Shipping:</strong> GHS {order.get('shipping_cost', 0):,.2f}</p>
                            <p class="total">Total: GHS {order.get('total_amount', 0):,.2f}</p>
                        </div>
                    </div>
                    
                    <p>We'll send you updates about your order status. If you have any questions, please contact us.</p>
                </div>
                <div class="footer">
                    <p>Energy Precisions</p>
                    <p>Haatso, Ecomog | +233 533 611 611 | info@energyprecisions.com</p>
                </div>
            </div>
        </body>
        </html>
        """

        return self.send_email(customer_email, subject, html_content)

    def send_order_shipped(self, order: Dict, customer_email: str, tracking_number: str) -> bool:
        """Send shipping notification email"""
        subject = f"Your Order #{order.get('order_number', 'N/A')} Has Shipped"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #1a4d7a; color: white; padding: 20px; text-align: center; }}
                .content {{ background: #f9f9f9; padding: 20px; }}
                .tracking {{ background: #00E676; color: white; padding: 15px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Your Order Has Shipped!</h1>
                </div>
                <div class="content">
                    <p>Hi {order.get('customer_name', 'Customer')},</p>
                    <p>Great news! Your order <strong>{order.get('order_number', 'N/A')}</strong> has been shipped.</p>
                    
                    <div class="tracking">
                        Tracking Number: {tracking_number}
                    </div>
                    
                    <p>You can track your order using the tracking number above. Your order should arrive within 3-5 business days.</p>
                </div>
            </div>
        </body>
        </html>
        """

        return self.send_email(customer_email, subject, html_content)

    def send_admin_notification(self, order: Dict, admin_email: str) -> bool:
        """Send new order notification to admin"""
        subject = f"New Order Received - {order.get('order_number', 'N/A')}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #1a4d7a; color: white; padding: 20px; }}
                .content {{ background: #f9f9f9; padding: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>New Order Received</h1>
                </div>
                <div class="content">
                    <p><strong>Order Number:</strong> {order.get('order_number', 'N/A')}</p>
                    <p><strong>Customer:</strong> {order.get('customer_name', 'N/A')}</p>
                    <p><strong>Email:</strong> {order.get('customer_email', 'N/A')}</p>
                    <p><strong>Total Amount:</strong> GHS {order.get('total_amount', 0):,.2f}</p>
                    <p>Please process this order in the admin panel.</p>
                </div>
            </div>
        </body>
        </html>
        """

        return self.send_email(admin_email, subject, html_content)


# Singleton instance
email_service = EmailService()


def send_quotation_email(quote, customer, pdf_bytes, recipient_email: Optional[str] = None) -> bool:
    """
    Send quotation PDF via email
    Args:
        quote: Quote model instance
        customer: Customer model instance
        pdf_bytes: BytesIO or bytes containing PDF
        recipient_email: Optional email address (defaults to customer email)
    Returns:
        bool: True if sent successfully, False otherwise
    """
    if not SENDGRID_AVAILABLE or not email_service.sg:
        print(f"⚠️  Email service not available. Would send quote #{quote.id} to {recipient_email or customer.email}")
        return False
    
    recipient = recipient_email or customer.email
    if not recipient:
        print("❌ No recipient email address provided")
        return False
    
    subject = f"Quotation #{quote.quote_number or quote.id} - {customer.name}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #1a4d7a; color: white; padding: 20px; text-align: center; }}
            .content {{ background: #f9f9f9; padding: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Quotation #{quote.quote_number or quote.id}</h1>
            </div>
            <div class="content">
                <p>Dear {customer.name},</p>
                <p>Please find attached the quotation for your project.</p>
                <p>If you have any questions, please don't hesitate to contact us.</p>
                <p>Best regards,<br>Energy Precisions</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        import base64
        
        message = Mail(
            from_email=Email(email_service.from_email, email_service.from_name),
            to_emails=To(recipient),
            subject=subject,
            html_content=Content("text/html", html_content)
        )
        
        # Attach PDF
        if hasattr(pdf_bytes, 'read'):
            pdf_bytes.seek(0)
            pdf_data = pdf_bytes.read()
        else:
            pdf_data = pdf_bytes
        
        # Encode PDF to base64
        encoded_pdf = base64.b64encode(pdf_data).decode('utf-8')
        
        # Add attachment using SendGrid's Attachment class
        from sendgrid.helpers.mail import Attachment
        attachment = Attachment()
        attachment.file_content = encoded_pdf
        attachment.file_type = "application/pdf"
        attachment.file_name = f"quotation_{quote.quote_number or quote.id}.pdf"
        attachment.disposition = "attachment"
        
        message.add_attachment(attachment)
        
        response = email_service.sg.send(message)
        return response.status_code == 202
    except Exception as e:
        print(f"❌ Error sending quotation email: {e}")
        return False
