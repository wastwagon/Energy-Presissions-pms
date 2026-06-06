import React from 'react';
import HomeCredibility from './HomeCredibility';

/** @deprecated Use HomeCredibility — kept for About page import compatibility */
const TrustStrip: React.FC<{ variant?: 'light' | 'muted' }> = () => <HomeCredibility />;

export default TrustStrip;
