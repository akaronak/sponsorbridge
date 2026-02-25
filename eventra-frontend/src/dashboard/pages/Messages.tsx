import React from 'react';
import MessagingPage from '../../messaging/MessagingPage';

/**
 * Organizer Messages page — wraps the shared MessagingPage
 * with the organizer's indigo accent color.
 */
const Messages: React.FC = () => {
  return <MessagingPage accentColor="indigo" />;
};

export default Messages;
