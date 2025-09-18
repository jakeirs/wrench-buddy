import { ChatMessage } from '@/types/chat';

export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    content: 'Hey! I just uploaded a new image to the library. Can you check it out?',
    isFromUser: true,
    timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    sender: 'You'
  },
  {
    id: '2',
    content: 'Sure! I can see it in the grid. The AI enhancement looks amazing. The colors really pop now!',
    isFromUser: false,
    timestamp: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
    sender: 'Alex'
  },
  {
    id: '3',
    content: 'Thanks! I used the new mixer-edit API. The results are much better than before.',
    isFromUser: true,
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    sender: 'You'
  },
  {
    id: '4',
    content: 'That\'s awesome! I\'ve been working on some landscape photos. Mind if I share the editing techniques I discovered?',
    isFromUser: false,
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    sender: 'Alex'
  }
];