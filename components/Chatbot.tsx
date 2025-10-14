import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage, User } from '../types';
import { ChatbotIcon, XIcon, SendIcon } from './icons';

interface ChatbotProps {
  messages: ChatMessage[];
  currentUser: User;
  botUser: User;
  onSendMessage: (text: string) => Promise<void>;
}

const TypingDots: React.FC = () => (
    <div className="flex items-center space-x-1">
        <span className="animate-bounce w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full" style={{ animationDelay: '0s' }}></span>
        <span className="animate-bounce w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full" style={{ animationDelay: '0.2s' }}></span>
        <span className="animate-bounce w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full" style={{ animationDelay: '0.4s' }}></span>
    </div>
);


export const Chatbot: React.FC<ChatbotProps> = ({ messages, currentUser, botUser, onSendMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isBotTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const messageToSend = text;
    setText('');
    setIsBotTyping(true);
    await onSendMessage(messageToSend);
    setIsBotTyping(false);
  };

  return (
    <>
      <div className={`fixed bottom-24 right-4 sm:right-6 md:right-8 w-80 sm:w-96 h-[500px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out z-40 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <header className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
                <img src={botUser.avatarUrl} alt={botUser.name} className="h-10 w-10 rounded-full" />
                <div>
                    <p className="font-bold">{botUser.name}</p>
                    <p className="text-xs text-green-500">Online</p>
                </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <XIcon className="h-5 w-5" />
            </button>
        </header>
        
        <main className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map(msg => (
                <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                    {msg.senderId !== currentUser.id && <img src={botUser.avatarUrl} className="h-6 w-6 rounded-full" />}
                    <div className={`max-w-xs px-3 py-2 rounded-2xl ${msg.senderId === currentUser.id ? 'bg-highlight text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 rounded-bl-none'}`}>
                        <p className="text-sm">{msg.text}</p>
                    </div>
                </div>
            ))}
             {isBotTyping && (
                <div className="flex items-end gap-2 justify-start">
                    <img src={botUser.avatarUrl} className="h-6 w-6 rounded-full" />
                    <div className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-none">
                        <TypingDots />
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </main>

        <footer className="p-3 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSend} className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-1">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 bg-transparent focus:outline-none py-2 px-3 text-sm"
                />
                <button type="submit" className="p-2 rounded-full text-white bg-highlight disabled:opacity-50 transition-colors" disabled={!text.trim()}>
                    <SendIcon className="h-5 w-5" />
                </button>
            </form>
        </footer>
      </div>
      
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-4 sm:right-6 md:right-8 bg-highlight text-white p-4 rounded-full shadow-lg hover:bg-blue-500 transition-transform hover:scale-110 z-40">
         {isOpen ? <XIcon className="h-6 w-6" /> : <ChatbotIcon className="h-6 w-6" />}
      </button>
    </>
  );
};
