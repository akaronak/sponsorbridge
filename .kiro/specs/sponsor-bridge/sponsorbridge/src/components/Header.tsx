import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-bold">Eventra</h1>
                        </div>
                        <nav className="hidden md:flex space-x-10 ml-10">
                            <a href="#features" className="text-gray-500 hover:text-gray-900">Features</a>
                            <a href="#pricing" className="text-gray-500 hover:text-gray-900">Pricing</a>
                            <a href="#cta" className="text-gray-500 hover:text-gray-900">Get Started</a>
                        </nav>
                    </div>
                    <div className="hidden md:flex items-center">
                        <a href="#signup" className="text-gray-500 hover:text-gray-900">Sign Up</a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;