import React, { useState, useEffect, useRef } from 'react';
import type { User, ChatMessage } from '../types';
import { SendIcon, MessagesIcon, SearchIcon } from './icons';
import { generateChatReply } from '../services/geminiService';

interface MessagesPageProps {
    currentUser: User;
    users: User[];
    messages: Record<string, ChatMessage[]>;
    onSendMessage: (recipientId: string, text: string, senderId?: string) => void;
    unreadCounts: Record<string, number>;
    activeChat: string | null;
    onOpenChat: (userId: string | null) => void;
}

const TypingDots: React.FC = () => (
    <div className="flex items-center space-x-1">
        <span className="animate-bounce w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full" style={{ animationDelay: '0s' }}></span>
        <span className="animate-bounce w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full" style={{ animationDelay: '0.2s' }}></span>
        <span className="animate-bounce w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full" style={{ animationDelay: '0.4s' }}></span>
    </div>
);

export const MessagesPage: React.FC<MessagesPageProps> = ({ currentUser, users, messages, onSendMessage, unreadCounts, activeChat, onOpenChat }) => {
    const [text, setText] = useState('');
    const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const activeUser = users.find(u => u.id === activeChat);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages, activeChat, typingUsers]);
    
    useEffect(() => {
        // Cleanup timeout on unmount or when chat changes
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [activeChat]);

    const handleSendMessageWithBot = async (recipientId: string, text: string) => {
        onSendMessage(recipientId, text);
        setText('');

        // Simulate AI reply
        setTypingUsers(prev => ({ ...prev, [recipientId]: true }));
        setTimeout(async () => {
            const conversation = [...(messages[recipientId] || []), { id: 'temp', senderId: currentUser.id, recipientId, text, timestamp: '', status: 'sent' }]
              .map(m => `${m.senderId === currentUser.id ? 'You' : 'Them'}: ${m.text}`)
              .join('\n');
            
            const replyText = await generateChatReply(conversation);
            
            setTypingUsers(prev => ({ ...prev, [recipientId]: false }));
            onSendMessage(currentUser.id, replyText, recipientId);
        }, 1500);
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim() && activeChat) {
             if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
             setTypingUsers(prev => ({ ...prev, [currentUser.id]: false }));
            handleSendMessageWithBot(activeChat, text);
        }
    }
    
    const handleUserTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);

        if (!activeChat) return;

        if (!typingUsers[currentUser.id]) {
            setTypingUsers(prev => ({ ...prev, [currentUser.id]: true }));
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setTypingUsers(prev => ({ ...prev, [currentUser.id]: false }));
        }, 2000);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.handle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-screen flex border-x border-gray-200 dark:border-gray-700">
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <header className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-xl font-bold">{currentUser.handle}</h1>
                </header>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-800 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-highlight"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredUsers.map(user => (
                        <div key={user.id} onClick={() => onOpenChat(user.id)} className={`flex items-center justify-between space-x-3 p-3 cursor-pointer transition-colors ${activeChat === user.id ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                            <div className="flex items-center space-x-3">
                               <img src={user.avatarUrl} alt={user.name} className="h-12 w-12 rounded-full" />
                                <div>
                                    <p className="font-semibold">{user.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">@{user.handle}</p>
                                </div>
                            </div>
                            {unreadCounts[user.id] > 0 && (
                                <span className="bg-highlight text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {unreadCounts[user.id]}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-2/3 flex flex-col">
                {activeChat && activeUser ? (
                    <>
                        <header className="flex items-center space-x-3 p-4 border-b border-gray-200 dark:border-gray-700">
                             <img src={activeUser.avatarUrl} alt={activeUser.name} className="h-10 w-10 rounded-full" />
                             <span className="font-semibold">{activeUser.name}</span>
                        </header>
                        <div className="flex-1 p-4 overflow-y-auto">
                             {(messages[activeChat] || []).map(msg => (
                                <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'} mb-3`}>
                                    <div className={`max-w-md px-4 py-2 rounded-2xl ${msg.senderId === currentUser.id ? 'bg-highlight text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                        <p>{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="px-4 h-6 text-sm text-gray-500 dark:text-gray-400 italic">
                             {typingUsers[activeChat] ? (
                                <div className="flex items-center space-x-2">
                                    <span>{activeUser?.name} is typing</span>
                                    <TypingDots />
                                </div>
                            ) : typingUsers[currentUser.id] ? (
                                <div>You are typing...</div>
                            ) : null}
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <form onSubmit={handleSend} className="flex items-center border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2">
                                <input
                                    type="text"
                                    value={text}
                                    onChange={handleUserTyping}
                                    placeholder="Message..."
                                    className="flex-1 bg-transparent focus:outline-none"
                                />
                                <button type="submit" className="ml-2 p-2 rounded-full text-highlight disabled:opacity-50" disabled={!text.trim()}>
                                    <SendIcon className="h-6 w-6" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="border-2 border-gray-800 dark:border-gray-200 rounded-full p-4">
                            <MessagesIcon className="h-16 w-16" />
                        </div>
                        <h2 className="text-2xl font-light mt-4">Your Messages</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Send private photos and messages to a friend or group.</p>
                    </div>
                )}
            </div>
        </div>
    );
};