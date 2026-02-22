import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

const Page = () => {
    return (
        <div>
            <Header />
            <Hero />
            <Features />
            <Pricing />
            <CTA />
            <Footer />
        </div>
    );
};

export default Page;