import React from 'react';
import LegalDocument from '../../components/public/LegalDocument';
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';

const Terms: React.FC = () => {
  const { sections } = useCmsPage('terms');
  const seo = resolveCmsSeo(sections, {
    title: 'Terms of Use | Energy Precisions',
    description: 'Terms governing use of the Energy Precisions website, tools, and online services.',
  });

  return (
    <LegalDocument
      seoTitle={seo.title}
      seoDescription={seo.description}
      badge={sections.hero.badge}
      title={sections.hero.headline}
      description={sections.hero.description}
      path="/terms"
      sections={sections.content_sections}
    />
  );
};

export default Terms;
