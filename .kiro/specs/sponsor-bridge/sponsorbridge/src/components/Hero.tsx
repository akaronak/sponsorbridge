import React from 'react';

const Hero: React.FC = () => {
    return (
        <section className="hero bg-blue-500 text-white text-center py-20">
            <div className="container mx-auto">
                <h1 className="text-4xl font-bold mb-4">Welcome to Eventra</h1>
                <p className="text-lg mb-8">Your ultimate solution for connecting sponsors with opportunities.</p>
                <a href="#cta" className="bg-white text-blue-500 px-6 py-3 rounded-full font-semibold">
                    Get Started
                </a>
            </div>
        </section>
    );
};

export default Hero;