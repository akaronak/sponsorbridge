import React from 'react';

const featuresData = [
  {
    title: 'Feature One',
    description: 'Description of feature one, highlighting its benefits and importance.',
  },
  {
    title: 'Feature Two',
    description: 'Description of feature two, showcasing how it solves user problems.',
  },
  {
    title: 'Feature Three',
    description: 'Description of feature three, emphasizing its unique aspects.',
  },
];

const Features: React.FC = () => {
  return (
    <section className="features">
      <h2 className="text-2xl font-bold mb-4">Key Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featuresData.map((feature, index) => (
          <div key={index} className="feature-card p-4 border rounded-lg shadow">
            <h3 className="text-xl font-semibold">{feature.title}</h3>
            <p className="mt-2">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;