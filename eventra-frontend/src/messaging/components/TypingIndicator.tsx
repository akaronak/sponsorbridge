import React from 'react';

interface TypingIndicatorProps {
  userName?: string;
  accentColor?: 'indigo' | 'emerald';
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ userName, accentColor = 'indigo' }) => {
  const dotColor = accentColor === 'emerald' ? 'bg-emerald-400' : 'bg-indigo-400';

  return (
    <div className="flex items-center gap-2 px-1 mb-2">
      <div className="bg-slate-800 rounded-2xl rounded-bl-md px-4 py-2.5 flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-bounce`} style={{ animationDelay: '0ms' }} />
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-bounce`} style={{ animationDelay: '150ms' }} />
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-bounce`} style={{ animationDelay: '300ms' }} />
      </div>
      {userName && (
        <span className="text-xs text-slate-500">{userName} is typing…</span>
      )}
    </div>
  );
};

export default TypingIndicator;
