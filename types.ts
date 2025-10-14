
export interface User {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  bio: string;
  followers: string[]; // array of user ids
  following: string[]; // array of user ids
  isPrivate: boolean;
  blockedUsers: string[]; // array of user ids
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  timestamp: string;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  timestamp: string;
  likes: string[]; // array of user ids
  comments: Comment[];
}

export interface ChatMessage {
  id:string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow';
  actorId: string; // user who performed the action
  timestamp: string;
  postId?: string; // relevant for like/comment
  isRead: boolean;
}

export type Page = 'feed' | 'profile' | 'messages' | 'notifications' | 'settings';
