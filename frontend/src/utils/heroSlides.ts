import type { CmsHero, CmsHeroSlide } from '../types/cms';

export function heroSlideFromLegacy(hero: CmsHero): CmsHeroSlide {
  return {
    badge: hero.badge,
    headline: hero.headline,
    headline_highlight: hero.headline_highlight,
    description: hero.description,
    hero_image: hero.hero_image,
    image_overlay: hero.image_overlay,
    primary_cta_text: hero.primary_cta_text,
    primary_cta_link: hero.primary_cta_link,
    secondary_cta_text: hero.secondary_cta_text,
    secondary_cta_link: hero.secondary_cta_link,
  };
}

export function resolveHeroSlides(hero: CmsHero): CmsHeroSlide[] {
  if (hero.slides?.length) return hero.slides;
  return [heroSlideFromLegacy(hero)];
}

export function heroAutoplayMs(hero: CmsHero): number {
  const seconds = hero.slider?.autoplay_seconds ?? 7;
  if (seconds <= 0) return 0;
  return seconds * 1000;
}
