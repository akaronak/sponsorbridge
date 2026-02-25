import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-800 text-white py-6">
            <div className="container mx-auto text-center">
                <p>&copy; {new Date().getFullYear()} Eventra. All rights reserved.</p>
                <div className="flex justify-center space-x-4 mt-4">
                    <a href="#" className="hover:underline">Privacy Policy</a>
                    <a href="#" className="hover:underline">Terms of Service</a>
                    <a href="#" className="hover:underline">Contact Us</a>
                </div>
                <div className="mt-4">
                    <a href="#" className="mx-2">Facebook</a>
                    <a href="#" className="mx-2">Twitter</a>
                    <a href="#" className="mx-2">LinkedIn</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;