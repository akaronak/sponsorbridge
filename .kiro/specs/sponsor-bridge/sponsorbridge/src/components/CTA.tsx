import React from 'react';

const CTA: React.FC = () => {
    return (
        <div className="cta-container">
            <h2 className="cta-title">Ready to take your sponsorship to the next level?</h2>
            <p className="cta-description">Join SponsorBridge today and connect with the right sponsors for your projects.</p>
            <a href="/signup" className="cta-button">Get Started</a>
        </div>
    );
};

export default CTA;