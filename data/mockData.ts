
import type { User, Post, ChatMessage, Notification } from '../types';

const users: User[] = [
  {
    id: 'user-1',
    name: 'Alice',
    handle: 'alice_codes',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-1',
    bio: 'Frontend dev & UI/UX enthusiast. Turning coffee into code.',
    followers: ['user-2', 'user-3'],
    following: ['user-2'],
    isPrivate: false,
    blockedUsers: ['user-3'],
  },
  {
    id: 'user-2',
    name: 'Bob',
    handle: 'bob_builds',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-2',
    bio: 'Backend engineer. Making things work.',
    followers: ['user-1'],
    following: ['user-1', 'user-3'],
    isPrivate: false,
    blockedUsers: [],
  },
  {
    id: 'user-3',
    name: 'Charlie',
    handle: 'charlie_designs',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-3',
    bio: 'Designer and illustrator. Colors are my jam.',
    followers: [],
    following: ['user-2'],
    isPrivate: true,
    blockedUsers: [],
  },
];

const chatbotUser: User = {
  id: 'chatbot-assistant',
  name: 'EchoBot',
  handle: 'echobot',
  avatarUrl: 'https://i.pravatar.cc/150?u=chatbot-assistant',
  bio: 'Your friendly neighborhood assistant.',
  followers: [],
  following: [],
  isPrivate: false,
  blockedUsers: [],
};

const basePosts: Omit<Post, 'id' | 'timestamp'>[] = [
  {
    authorId: 'user-1',
    content: 'Just deployed a new feature for our app! So excited to see users interact with it. #webdev #react',
    mediaUrl: 'https://images.unsplash.com/photo-1522252234503-e356532cafd5?q=80&w=2070&auto=format&fit=crop',
    mediaType: 'image',
    likes: ['user-2'],
    comments: [
      { id: 'comment-1', authorId: 'user-2', text: 'Looks amazing, great job!', timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString() },
    ],
  },
  {
    authorId: 'user-2',
    content: 'Finally figured out a tricky database query. That feeling of relief is the best!',
    mediaUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop',
    mediaType: 'image',
    likes: ['user-1', 'user-3'],
    comments: [],
  },
    {
    authorId: 'user-3',
    content: 'Working on some new illustrations today. Here\'s a sneak peek!',
    mediaUrl: 'https://images.unsplash.com/photo-1561835491-02535a0e0a8e?q=80&w=1956&auto=format&fit=crop',
    mediaType: 'image',
    likes: [],
    comments: [
      { id: 'comment-2', authorId: 'user-1', text: 'Wow, that looks beautiful!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString() },
      { id: 'comment-3', authorId: 'user-2', text: 'I love the color palette.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString() },
    ],
  },
];

// Generate a larger list of posts for infinite scroll demonstration
const posts: Post[] = Array.from({ length: 15 }).flatMap((_, i) => 
    basePosts.map((p, j) => ({
        ...p,
        id: `post-${i}-${j}`,
        timestamp: new Date(Date.now() - (i * basePosts.length + j) * 1000 * 60 * 60 * 3 - Math.random() * 1000 * 60 * 60).toISOString(),
    }))
);


const messages: Record<string, ChatMessage[]> = {
    'user-2': [
        { id: 'msg-1', senderId: 'user-2', recipientId: 'user-1', text: 'Hey! Saw your new post, looks great!', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'read' },
        { id: 'msg-2', senderId: 'user-1', recipientId: 'user-2', text: 'Thanks Bob! Appreciate it.', timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString(), status: 'read' },
    ],
    'user-3': [
        { id: 'msg-3', senderId: 'user-3', recipientId: 'user-1', text: 'Can I get your feedback on a design?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), status: 'delivered' },
    ]
};

const initialChatbotMessages: ChatMessage[] = [
  {
    id: 'chatbot-msg-1',
    senderId: 'chatbot-assistant',
    recipientId: 'user-1', // The current user
    text: 'Hello! I am EchoBot, your personal assistant. How can I help you navigate EchoSphere today?',
    timestamp: new Date().toISOString(),
    status: 'read',
  }
];

const notifications: Notification[] = [
    { id: 'notif-1', type: 'like', actorId: 'user-2', postId: 'post-0-0', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), isRead: false },
    { id: 'notif-2', type: 'comment', actorId: 'user-2', postId: 'post-0-0', timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(), isRead: true },
    { id: 'notif-3', type: 'follow', actorId: 'user-3', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), isRead: false },
];

export const mockData = {
    users,
    posts,
    messages,
    notifications,
    chatbotUser,
    initialChatbotMessages,
};
