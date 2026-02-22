export type Feature = {
  title: string;
  description: string;
  icon?: string; // Optional icon for the feature
};

export type PricingPlan = {
  name: string;
  price: string;
  features: string[];
};

export type CallToAction = {
  text: string;
  link: string;
};