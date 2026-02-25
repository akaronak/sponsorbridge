import React, { useState } from 'react';
import {
  Bot,
  MessageSquare,
  Lightbulb,
} from 'lucide-react';
import ChatInterface from './ChatInterface';
import RecommendationCard from './RecommendationCard';

type AITab = 'chat' | 'recommendations';

const AIAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AITab>('chat');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bot className="w-7 h-7 text-indigo-400" />
            AI Assistant
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Smart sponsor matching, event optimization, and market insights
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'chat'
              ? 'bg-indigo-500/10 text-indigo-400'
              : 'text-slate-500 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Chat
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'recommendations'
              ? 'bg-indigo-500/10 text-indigo-400'
              : 'text-slate-500 hover:text-white'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          Recommendations
        </button>
      </div>

      {/* Content */}
      {activeTab === 'chat' ? <ChatInterface /> : <RecommendationCard />}
    </div>
  );
};

export default AIAssistant;
