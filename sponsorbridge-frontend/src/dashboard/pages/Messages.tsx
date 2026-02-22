import React, { useState } from 'react';
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Circle,
} from 'lucide-react';

// �"��"��"� Mock data �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
const mockConversations = [
  {
    id: '1',
    name: 'Sarah Chen',
    company: 'TechCorp Inc.',
    avatar: 'SC',
    lastMessage: 'Sounds great! Let us finalize the sponsorship package for HackFest.',
    time: '2m ago',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    name: 'James Rodriguez',
    company: 'InnovateCo',
    avatar: 'JR',
    lastMessage: 'We are interested in the Gold tier. Can we discuss details?',
    time: '1h ago',
    unread: 0,
    online: true,
  },
  {
    id: '3',
    name: 'Emily Watson',
    company: 'BrandLabs',
    avatar: 'EW',
    lastMessage: 'Thanks for the proposal! Our team will review by Friday.',
    time: '3h ago',
    unread: 0,
    online: false,
  },
  {
    id: '4',
    name: 'Michael Park',
    company: 'GreenEnergy Co',
    avatar: 'MP',
    lastMessage: 'Looking forward to the sustainability panel discussion.',
    time: '1d ago',
    unread: 0,
    online: false,
  },
];

const mockMessages = [
  {
    id: '1',
    senderId: 'other',
    content: 'Hi there! We reviewed your event proposal for HackFest 2026. Very impressive!',
    time: '10:30 AM',
  },
  {
    id: '2',
    senderId: 'me',
    content: 'Thank you Sarah! We put a lot of effort into making this hackathon special. Would love to discuss sponsorship tiers.',
    time: '10:32 AM',
  },
  {
    id: '3',
    senderId: 'other',
    content: 'Absolutely. TechCorp is interested in the Platinum tier. We would like to provide both funding and developer tools for participants.',
    time: '10:35 AM',
  },
  {
    id: '4',
    senderId: 'me',
    content: 'That would be amazing! The Platinum tier includes main stage branding, a dedicated booth, and a sponsored challenge track.',
    time: '10:38 AM',
  },
  {
    id: '5',
    senderId: 'other',
    content: 'Sounds great! Let\'s finalize the sponsorship package for HackFest.',
    time: '10:40 AM',
  },
];

const Messages: React.FC = () => {
  const [selectedConvo, setSelectedConvo] = useState(mockConversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSend = () => {
    if (!newMessage.trim()) return;
    // In production, this calls messagesApi.send()
    setNewMessage('');
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      {/* Contacts sidebar */}
      <div className="w-80 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {mockConversations.map((convo) => (
            <button
              key={convo.id}
              onClick={() => setSelectedConvo(convo)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all ${
                selectedConvo.id === convo.id
                  ? 'bg-indigo-500/5 border-l-2 border-indigo-500'
                  : 'hover:bg-slate-800/30 border-l-2 border-transparent'
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {convo.avatar}
                </div>
                {convo.online && (
                  <Circle className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 fill-emerald-500 text-slate-950" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white truncate">{convo.name}</p>
                  <span className="text-xs text-slate-500 flex-shrink-0">{convo.time}</span>
                </div>
                <p className="text-xs text-slate-500">{convo.company}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{convo.lastMessage}</p>
              </div>
              {convo.unread > 0 && (
                <span className="bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-1">
                  {convo.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
              {selectedConvo.avatar}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{selectedConvo.name}</p>
              <p className="text-xs text-slate-500">
                {selectedConvo.company} * {selectedConvo.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
              <Video className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {mockMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                  msg.senderId === 'me'
                    ? 'bg-indigo-600 text-white rounded-br-md'
                    : 'bg-slate-800 text-slate-200 rounded-bl-md'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.senderId === 'me' ? 'text-indigo-200' : 'text-slate-500'
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
            <button
              onClick={handleSend}
              className="p-2.5 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
