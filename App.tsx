import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { User, Post, Page, ChatMessage, Notification, Comment } from './types';
import { mockData } from './data/mockData';

import { Navbar } from './components/Navbar';
import { Feed, CreatePostModal } from './components/Feed';
import { ProfilePage } from './components/ProfilePage';
import { MessagesPage } from './components/MessagesPage';
import { NotificationsPage } from './components/NotificationsPage';
import { SettingsPage } from './components/SettingsPage';
import { EditProfileModal } from './components/EditProfileModal';
import { SearchPanel } from './components/SearchPanel';
import { Chatbot } from './components/Chatbot';
import { generatePostContent } from './services/geminiService';
import { PostModal } from './components/PostModal';

const POSTS_PER_PAGE_FEED = 5;
const POSTS_PER_PAGE_PROFILE = 9;

const App: React.FC = () => {
    const [users, setUsers] = useState<User[]>([...mockData.users, mockData.chatbotUser]);
    const [allPosts, setAllPosts] = useState<Post[]>(mockData.posts);
    const [messages, setMessages] = useState(mockData.messages);
    const [chatbotMessages, setChatbotMessages] = useState<ChatMessage[]>(mockData.initialChatbotMessages);
    const [notifications, setNotifications] = useState<Notification[]>(mockData.notifications);
    const [currentUser, setCurrentUser] = useState<User>(users[0]);

    const [currentPage, setCurrentPage] = useState<Page>('feed');
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);

    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
    const [viewingPost, setViewingPost] = useState<Post | null>(null);
    
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    
    // Centralized pagination state
    const [paginationPage, setPaginationPage] = useState(1);

    const usersById = useMemo(() => {
        const map: Record<string, User> = {};
        users.forEach(user => {
            map[user.id] = user;
        });
        return map;
    }, [users]);

    const postsById = useMemo(() => {
        const map: Record<string, Post> = {};
        allPosts.forEach(post => {
            map[post.id] = post;
        });
        return map;
    }, [allPosts]);
    
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);
    
    // Determine which list of posts to paginate
    const sourcePosts = useMemo(() => {
        if (currentPage === 'profile') {
            const profileId = activeProfileId || currentUser.id;
            return allPosts.filter(p => p.authorId === profileId);
        }
        return allPosts; // For feed
    }, [currentPage, activeProfileId, allPosts, currentUser.id]);

    // Reset pagination when the source of posts changes (e.g., navigating to a new page)
    useEffect(() => {
        setPaginationPage(1);
    }, [sourcePosts]);

    // Derive visible posts and whether there are more to load
    const { visiblePosts, hasMorePosts } = useMemo(() => {
        const postsPerPage = currentPage === 'profile' ? POSTS_PER_PAGE_PROFILE : POSTS_PER_PAGE_FEED;
        const visible = sourcePosts.slice(0, paginationPage * postsPerPage);
        const hasMore = visible.length < sourcePosts.length;
        return { visiblePosts: visible, hasMorePosts: hasMore };
    }, [sourcePosts, paginationPage, currentPage]);


    const handleLoadMorePosts = useCallback(() => {
        if (!hasMorePosts) return;
        // Simulate network delay for a better UX
        setTimeout(() => {
            setPaginationPage(prev => prev + 1);
        }, 1000);
    }, [hasMorePosts]);

    
    const navigateTo = (page: Page, id?: string) => {
        setCurrentPage(page);
        if (page === 'profile' && id) {
            setActiveProfileId(id);
        }
        if (page === 'messages' && id) {
            setActiveChatId(id);
        } else if (page !== 'messages') {
             setActiveChatId(null);
        }
    };
    
    const handleNavigateFromModal = (page: Page, userId?: string) => {
        setViewingPost(null);
        navigateTo(page, userId);
    };

    const handleLikePost = (postId: string) => {
        const updateLikes = (posts: Post[]) =>
            posts.map(p => {
                if (p.id === postId) {
                    const isLiked = p.likes.includes(currentUser.id);
                    const newLikes = isLiked
                        ? p.likes.filter(id => id !== currentUser.id)
                        : [...p.likes, currentUser.id];
                    return { ...p, likes: newLikes };
                }
                return p;
            });

        setAllPosts(updateLikes);
        if (viewingPost?.id === postId) {
            setViewingPost(prev => prev ? updateLikes([prev])[0] : null);
        }
    };

    const handleAddComment = (postId: string, text: string) => {
         const updateComments = (posts: Post[]) =>
            posts.map(p => {
                if (p.id === postId) {
                    const newComment: Comment = {
                        id: `comment-${Date.now()}`,
                        authorId: currentUser.id,
                        text,
                        timestamp: new Date().toISOString()
                    };
                    return { ...p, comments: [...p.comments, newComment] };
                }
                return p;
            });
        
        setAllPosts(updateComments);
         if (viewingPost?.id === postId) {
            setViewingPost(prev => prev ? updateComments([prev])[0] : null);
        }
    };

    const handleEditPost = (postId: string, newContent: string) => {
        const updateContent = (posts: Post[]) => posts.map(p => p.id === postId ? {...p, content: newContent} : p);
        setAllPosts(updateContent);
         if (viewingPost?.id === postId) {
            setViewingPost(prev => prev ? updateContent([prev])[0] : null);
        }
    };

    const handleCreatePost = (content: string, mediaUrl: string, mediaType: 'image' | 'video') => {
        const newPost: Post = {
            id: `post-${Date.now()}`,
            authorId: currentUser.id,
            content,
            mediaUrl,
            mediaType,
            timestamp: new Date().toISOString(),
            likes: [],
            comments: []
        };
        setAllPosts(prevPosts => [newPost, ...prevPosts]);
        setIsCreatePostModalOpen(false);
    };

    const handleSendMessage = (recipientId: string, text: string, senderId: string = currentUser.id) => {
        const newMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            senderId: senderId,
            recipientId: recipientId === currentUser.id ? senderId : recipientId,
            text,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };

        const chatPartnerId = senderId === currentUser.id ? recipientId : senderId;
        
        setMessages(prev => ({
            ...prev,
            [chatPartnerId]: [...(prev[chatPartnerId] || []), newMessage]
        }));
    };

    const handleSendChatbotMessage = async (text: string) => {
        const userMessage: ChatMessage = {
            id: `chatbot-msg-${Date.now()}`,
            senderId: currentUser.id,
            recipientId: 'chatbot-assistant',
            text,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };
        setChatbotMessages(prev => [...prev, userMessage]);

        const conversationHistory = [...chatbotMessages, userMessage]
            .map(m => `${m.senderId === currentUser.id ? 'User' : 'Bot'}: ${m.text}`)
            .join('\n');
            
        const prompt = `You are EchoBot, a helpful assistant for a social media app called EchoSphere. A user said: "${text}". The conversation so far is:\n${conversationHistory}\n\nProvide a concise and helpful response.`;
        const botReplyText = await generatePostContent(prompt);

        const botMessage: ChatMessage = {
            id: `chatbot-msg-${Date.now() + 1}`,
            senderId: 'chatbot-assistant',
            recipientId: currentUser.id,
            text: botReplyText,
            timestamp: new Date().toISOString(),
            status: 'read'
        };
        setChatbotMessages(prev => [...prev, botMessage]);
    };

    const handleUpdateProfile = (updatedData: Partial<User>) => {
        const updatedUser = { ...currentUser, ...updatedData };
        setCurrentUser(updatedUser);
        setUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? updatedUser : u));
        setIsEditProfileModalOpen(false);
    };
    
    const handleToggleFollow = (targetUserId: string) => {
        setUsers(prevUsers => prevUsers.map(user => {
            if (user.id === currentUser.id) { // Current user
                return user.following.includes(targetUserId)
                    ? { ...user, following: user.following.filter(id => id !== targetUserId) }
                    : { ...user, following: [...user.following, targetUserId] };
            }
            if (user.id === targetUserId) { // Target user
                 return user.followers.includes(currentUser.id)
                    ? { ...user, followers: user.followers.filter(id => id !== currentUser.id) }
                    : { ...user, followers: [...user.followers, currentUser.id] };
            }
            return user;
        }));
    };
    
    const unreadMessagesCount = Object.values(messages).flat().filter(m => m.recipientId === currentUser.id && m.status !== 'read').length;
    const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
    const unreadMessagesPerChat = Object.entries(messages).reduce((acc, [userId, userMessages]) => {
        acc[userId] = userMessages.filter(m => m.recipientId === currentUser.id && m.status !== 'read').length;
        return acc;
    }, {} as Record<string, number>);

    const whoToFollow = users.filter(u => u.id !== currentUser.id && !currentUser.following.includes(u.id) && u.id !== 'chatbot-assistant').slice(0, 5);

    const renderPage = () => {
        switch (currentPage) {
            case 'feed':
                return <Feed 
                    posts={visiblePosts} 
                    currentUser={currentUser} 
                    usersById={usersById}
                    onLikePost={handleLikePost}
                    onAddComment={handleAddComment}
                    onEditPost={handleEditPost}
                    navigateTo={navigateTo}
                    hasMorePosts={hasMorePosts}
                    loadMorePosts={handleLoadMorePosts}
                />;
            case 'profile':
                const profileUser = usersById[activeProfileId || currentUser.id];
                return <ProfilePage
                    user={profileUser}
                    currentUser={currentUser}
                    posts={visiblePosts}
                    totalPostCount={sourcePosts.length}
                    onEditProfile={() => setIsEditProfileModalOpen(true)}
                    onToggleFollow={handleToggleFollow}
                    onViewPost={setViewingPost}
                    hasMorePosts={hasMorePosts}
                    loadMorePosts={handleLoadMorePosts}
                />;
            case 'messages':
                return <MessagesPage
                    currentUser={currentUser}
                    users={users.filter(u => u.id !== currentUser.id && u.id !== 'chatbot-assistant')}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    unreadCounts={unreadMessagesPerChat}
                    activeChat={activeChatId}
                    onOpenChat={(userId) => setActiveChatId(userId)}
                />;
            case 'notifications':
                return <NotificationsPage 
                    notifications={notifications} 
                    usersById={usersById}
                    postsById={postsById}
                    onViewPost={setViewingPost}
                />;
            case 'settings':
                return <SettingsPage
                     currentUser={currentUser}
                     usersById={usersById}
                     onEditProfile={() => setIsEditProfileModalOpen(true)}
                     onChangePassword={() => alert('Password changed!')}
                     onTogglePrivacy={() => setUsers(prev => prev.map(u => u.id === currentUser.id ? {...u, isPrivate: !u.isPrivate} : u))}
                     onUnblockUser={(userId) => setUsers(prev => prev.map(u => u.id === currentUser.id ? {...u, blockedUsers: u.blockedUsers.filter(id => id !== userId)} : u))}
                     onChangeTheme={setTheme}
                     currentTheme={theme}
                />;
            default:
                return <Feed 
                    posts={visiblePosts} 
                    currentUser={currentUser} 
                    usersById={usersById}
                    onLikePost={handleLikePost}
                    onAddComment={handleAddComment}
                    onEditPost={handleEditPost}
                    navigateTo={navigateTo}
                    hasMorePosts={hasMorePosts}
                    loadMorePosts={handleLoadMorePosts}
                />;
        }
    };

    return (
        <div className={`flex justify-center bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen h-dvh`}>
            <div className="flex w-full max-w-7xl">
                <Navbar
                    currentPage={currentPage}
                    navigateTo={navigateTo}
                    currentUserId={currentUser.id}
                    unreadMessages={unreadMessagesCount}
                    unreadNotifications={unreadNotificationsCount}
                    onOpenCreatePost={() => setIsCreatePostModalOpen(true)}
                    onToggleSearch={() => setIsSearchPanelOpen(!isSearchPanelOpen)}
                />
                <main className="flex-1 max-w-2xl border-x border-gray-200 dark:border-gray-700 overflow-y-auto">
                    {renderPage()}
                </main>
                <aside className="w-96 hidden lg:flex flex-col p-4">
                    <div className="sticky top-0 flex-1 overflow-y-auto">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
                            <h2 className="text-xl font-bold mb-4">Who to follow</h2>
                            <div className="space-y-4">
                                {whoToFollow.map(user => (
                                    <div key={user.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full cursor-pointer" onClick={() => navigateTo('profile', user.id)} />
                                            <div>
                                                <p className="font-semibold cursor-pointer" onClick={() => navigateTo('profile', user.id)}>{user.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">@{user.handle}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleToggleFollow(user.id)} className="bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-full text-sm font-semibold">
                                            Follow
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
            {isCreatePostModalOpen && <CreatePostModal onCreatePost={handleCreatePost} onClose={() => setIsCreatePostModalOpen(false)} />}
            {isEditProfileModalOpen && <EditProfileModal user={currentUser} onUpdateProfile={handleUpdateProfile} onClose={() => setIsEditProfileModalOpen(false)} />}
            <SearchPanel isOpen={isSearchPanelOpen} onClose={() => setIsSearchPanelOpen(false)} users={users.filter(u => u.id !== currentUser.id)} navigateTo={navigateTo} />
            <Chatbot messages={chatbotMessages} currentUser={currentUser} botUser={usersById['chatbot-assistant']} onSendMessage={handleSendChatbotMessage} />
            {viewingPost && (
                 <PostModal 
                    post={viewingPost}
                    author={usersById[viewingPost.authorId]}
                    currentUser={currentUser}
                    usersById={usersById}
                    onLike={handleLikePost}
                    onAddComment={handleAddComment}
                    onEditPost={handleEditPost}
                    navigateTo={handleNavigateFromModal}
                    onClose={() => setViewingPost(null)}
                />
            )}
        </div>
    );
};

export default App;