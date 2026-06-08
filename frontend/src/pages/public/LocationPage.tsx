import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LocationLanding from '../../components/public/LocationLanding';
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveLocationPage } from '../../data/locationCms';

const LocationPage: React.FC = () => {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\//, '');
  const { sections } = useCmsPage('locations');
  const page = resolveLocationPage(slug, sections.items);

  if (!page) return <Navigate to="/contact" replace />;
  return <LocationLanding page={page} />;
};

export default LocationPage;
