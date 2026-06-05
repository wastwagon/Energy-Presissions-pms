import { useEffect, useState } from 'react';
import api from '../services/api';
import { getCmsDefaults, mergeCmsSections } from '../data/cmsDefaults';
import type {
  AboutPageSections,
  CmsPageSlug,
  ContactPageSections,
  FinancingPageSections,
  GlobalPageSections,
  HomePageSections,
  PackagesPageSections,
  ServicesPageSections,
  ShopPageSections,
} from '../types/cms';

type PageSectionsMap = {
  home: HomePageSections;
  about: AboutPageSections;
  services: ServicesPageSections;
  shop: ShopPageSections;
  contact: ContactPageSections;
  global: GlobalPageSections;
  packages: PackagesPageSections;
  financing: FinancingPageSections;
};

export function useCmsPage<P extends CmsPageSlug>(page: P) {
  const defaults = getCmsDefaults(page);
  const [sections, setSections] = useState<PageSectionsMap[P]>(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get<{ page: string; sections: Partial<PageSectionsMap[P]> }>(`/content/pages/${page}`)
      .then((res) => {
        if (!cancelled) {
          setSections(mergeCmsSections(page, res.data?.sections));
        }
      })
      .catch(() => {
        if (!cancelled) setSections(defaults);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  return { sections, loading };
}
