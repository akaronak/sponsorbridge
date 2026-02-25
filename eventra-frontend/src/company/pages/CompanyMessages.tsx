import React from 'react';
import MessagingPage from '../../messaging/MessagingPage';

/**
 * Company Messages page — wraps the shared MessagingPage
 * with the company's emerald accent color.
 */
const CompanyMessages: React.FC = () => {
  return <MessagingPage accentColor="emerald" />;
};

export default CompanyMessages;
