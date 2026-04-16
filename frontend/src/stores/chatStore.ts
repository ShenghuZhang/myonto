/**
 * Chat Store
 * Zustand store for chat messages and state
 */

import { create } from 'zustand';
import { ChatMessage } from '../types/ontology';

interface ChatState {
  // Messages
  messages: ChatMessage[];

  // Streaming state
  isStreaming: boolean;

  // Collapsed tools state - map from section id to collapsed state
  collapsedTools: Set<string>;

  // Actions
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  appendToMessage: (id: string, content: string) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  toggleToolCollapse: (sectionId: string) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  messages: [],
  isStreaming: false,
  collapsedTools: new Set(),

  // Actions
  setMessages: (messages) => set({ messages }),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  updateMessage: (id, updates) => set((state) => ({
    messages: state.messages.map(m =>
      m.id === id ? { ...m, ...updates } : m
    )
  })),

  appendToMessage: (id, content) => set((state) => ({
    messages: state.messages.map(m =>
      m.id === id ? { ...m, content: m.content + content } : m
    )
  })),

  setIsStreaming: (isStreaming) => set({ isStreaming }),

  toggleToolCollapse: (sectionId) => set((state) => {
    const next = new Set(state.collapsedTools);
    if (next.has(sectionId)) {
      next.delete(sectionId);
    } else {
      next.add(sectionId);
    }
    return { collapsedTools: next };
  }),

  clearChat: () => set({
    messages: [],
    isStreaming: false,
    collapsedTools: new Set()
  }),
}));
