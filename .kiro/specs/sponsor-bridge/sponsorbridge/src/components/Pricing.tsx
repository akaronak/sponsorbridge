import React from 'react';

const Pricing: React.FC = () => {
    return (
        <section className="pricing">
            <h2 className="text-2xl font-bold text-center">Pricing Plans</h2>
            <div className="flex justify-center space-x-4 mt-6">
                <div className="border p-4 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold">Basic Plan</h3>
                    <p className="text-lg">$10/month</p>
                    <ul className="mt-4">
                        <li>Feature 1</li>
                        <li>Feature 2</li>
                        <li>Feature 3</li>
                    </ul>
                    <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">Choose Plan</button>
                </div>
                <div className="border p-4 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold">Pro Plan</h3>
                    <p className="text-lg">$20/month</p>
                    <ul className="mt-4">
                        <li>Feature 1</li>
                        <li>Feature 2</li>
                        <li>Feature 3</li>
                        <li>Feature 4</li>
                    </ul>
                    <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">Choose Plan</button>
                </div>
                <div className="border p-4 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold">Enterprise Plan</h3>
                    <p className="text-lg">Contact Us</p>
                    <ul className="mt-4">
                        <li>Feature 1</li>
                        <li>Feature 2</li>
                        <li>Feature 3</li>
                        <li>Feature 4</li>
                        <li>Feature 5</li>
                    </ul>
                    <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">Contact Us</button>
                </div>
            </div>
        </section>
    );
};

export default Pricing;