import React from 'react';
import LegalDocument from '../../components/public/LegalDocument';
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';

const Warranty: React.FC = () => {
  const { sections } = useCmsPage('warranty');
  const seo = resolveCmsSeo(sections, {
    title: 'Warranty & Coverage | Energy Precisions',
    description:
      'How Energy Precisions protects your solar investment — workmanship, equipment, and what to expect after installation.',
  });

  return (
    <LegalDocument
      seoTitle={seo.title}
      seoDescription={seo.description}
      badge={sections.hero.badge}
      title={sections.hero.headline}
      description={sections.hero.description}
      path="/warranty"
      sections={sections.content_sections}
    />
  );
};

export default Warranty;
