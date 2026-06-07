import React from 'react';
import LegalDocument from '../../components/public/LegalDocument';

const Terms: React.FC = () => (
  <LegalDocument
    badge="Legal"
    title="Terms of Use"
    description="Terms governing use of the Energy Precisions website, tools, and online services."
    path="/terms"
    sections={[
      {
        title: 'Use of this website',
        body:
          'By accessing energyprecisions.com you agree to use this site for lawful purposes only. Content is provided for general information about our solar products and services in Ghana and does not constitute a binding offer until confirmed in writing.',
      },
      {
        title: 'Quotes, pricing, and projects',
        body:
          'Solar system sizing, pricing, and availability depend on site survey and engineering assessment. Published package prices, estimator outputs, and load calculator results are indicative only. Final quotations may differ after technical review.',
      },
      {
        title: 'Shop and payments',
        body:
          'Product orders are subject to stock availability and confirmed order acceptance. Payment terms for equipment and installation projects are set out in your quotation or invoice. Warranty coverage follows manufacturer and Energy Precisions workmanship terms supplied with your project.',
      },
      {
        title: 'Intellectual property',
        body:
          'All website content, branding, photography, and documentation remain the property of Energy Precisions or its licensors. You may not reproduce or redistribute materials without prior written permission.',
      },
      {
        title: 'Limitation of liability',
        body:
          'To the fullest extent permitted by law, Energy Precisions is not liable for indirect or consequential loss arising from use of this website or reliance on general information published here. Nothing in these terms limits rights you may have under applicable Ghanaian consumer law.',
      },
      {
        title: 'Contact',
        body:
          'Questions about these terms: info@energyprecisions.com or (+233) 533 611 611.',
      },
    ]}
  />
);

export default Terms;
