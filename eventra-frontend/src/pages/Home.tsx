import React from 'react';
import MarketingNav from '../marketing/MarketingNav';
import CinematicHero from '../marketing/CinematicHero';
import WhatWeAre from '../marketing/WhatWeAre';
import TheProblem from '../marketing/TheProblem';
import ImpactMetrics from '../marketing/ImpactMetrics';
import VisualWorkflow from '../marketing/VisualWorkflow';
import FutureRoadmap from '../marketing/FutureRoadmap';
import Testimonials from '../marketing/Testimonials';
import CinematicCTA from '../marketing/CinematicCTA';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      <MarketingNav />
      <CinematicHero />
      <WhatWeAre />
      <TheProblem />
      <ImpactMetrics />
      <VisualWorkflow />
      <FutureRoadmap />
      <Testimonials />
      <CinematicCTA />
      <Footer />
    </div>
  );
};

export default Home;
