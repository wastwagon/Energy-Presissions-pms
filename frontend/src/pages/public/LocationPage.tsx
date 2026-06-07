import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LocationLanding from '../../components/public/LocationLanding';
import { getLocationPage } from '../../data/locationPages';

const LocationPage: React.FC = () => {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\//, '');
  const page = getLocationPage(slug);
  if (!page) return <Navigate to="/contact" replace />;
  return <LocationLanding page={page} />;
};

export default LocationPage;
