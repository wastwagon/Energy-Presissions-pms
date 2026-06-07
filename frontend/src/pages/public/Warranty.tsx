import React from 'react';
import LegalDocument from '../../components/public/LegalDocument';

const Warranty: React.FC = () => (
  <LegalDocument
    badge="Support"
    title="Warranty & coverage"
    description="How Energy Precisions protects your solar investment — workmanship, equipment, and what to expect after installation."
    path="/warranty"
    sections={[
      {
        title: 'Installation workmanship',
        body:
          'Energy Precisions provides a workmanship warranty on professional installation — covering mounting, wiring, commissioning, and labelled distribution. Terms and duration are confirmed in your project quotation and handover documents.',
      },
      {
        title: 'Solar panels',
        body:
          'Tier-1 modules supplied through Energy Precisions carry manufacturer product and performance warranties, typically 10–12 years product and 25–30 years linear performance (exact terms vary by brand and batch).',
      },
      {
        title: 'Inverters & batteries',
        body:
          'Inverter and lithium battery warranties follow the manufacturer — commonly 5–10 years depending on model. Hybrid packages on our website note battery warranty on each tier card; final coverage is listed on your invoice.',
      },
      {
        title: 'Shop equipment-only orders',
        body:
          'Products purchased from our online shop without installation carry manufacturer warranty only. Installation, commissioning, and extended workmanship coverage require a separate site survey and project agreement.',
      },
      {
        title: 'Maintenance & monitoring',
        body:
          'Optional maintenance plans and remote monitoring help protect uptime and validate warranty claims. Contact us after handover to schedule annual checks or to report a fault.',
      },
      {
        title: 'Making a claim',
        body:
          'Email info@energyprecisions.com or call (+233) 533 611 611 with your order or project reference, photos of the issue, and inverter/battery serial numbers where applicable. We will route you to the correct manufacturer or dispatch a technician.',
      },
    ]}
  />
);

export default Warranty;
