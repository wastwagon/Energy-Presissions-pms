import React from 'react';
import LegalDocument from '../../components/public/LegalDocument';

const Privacy: React.FC = () => (
  <LegalDocument
    badge="Legal"
    title="Privacy Policy"
    description="How Energy Precisions collects, uses, and protects your personal information when you use our website and services."
    path="/privacy"
    sections={[
      {
        title: 'Information we collect',
        body:
          'We may collect your name, email address, phone number, property or business location, energy usage details, and any information you submit through contact forms, quote requests, shop checkout, newsletter signup, or referral program enquiries.',
      },
      {
        title: 'How we use your information',
        body:
          'We use this information to respond to enquiries, prepare quotations, deliver solar design and installation services, process shop orders, send service updates you have requested, and improve our website and customer experience.',
      },
      {
        title: 'Sharing and storage',
        body:
          'We do not sell your personal data. We may share information with trusted service providers (such as payment processors or logistics partners) only where needed to fulfil your request. Data is stored on secure systems with access limited to authorised staff.',
      },
      {
        title: 'Your choices',
        body:
          'You may request access to, correction of, or deletion of your personal data by contacting us at info@energyprecisions.com. You can unsubscribe from marketing emails at any time using the link in our messages.',
      },
      {
        title: 'Contact',
        body:
          'Energy Precisions\nHaatso, Ecomog, Accra, Ghana\nPhone: (+233) 533 611 611\nEmail: info@energyprecisions.com',
      },
    ]}
  />
);

export default Privacy;
