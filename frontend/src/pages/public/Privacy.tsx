import React from 'react';
import LegalDocument from '../../components/public/LegalDocument';
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';

const Privacy: React.FC = () => {
  const { sections } = useCmsPage('privacy');
  const seo = resolveCmsSeo(sections, {
    title: 'Privacy Policy | Energy Precisions',
    description:
      'How Energy Precisions collects, uses, and protects your personal information when you use our website and services.',
  });

  return (
    <LegalDocument
      seoTitle={seo.title}
      seoDescription={seo.description}
      badge={sections.hero.badge}
      title={sections.hero.headline}
      description={sections.hero.description}
      path="/privacy"
      sections={sections.content_sections}
    />
  );
};

export default Privacy;
