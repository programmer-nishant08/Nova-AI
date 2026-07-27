import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

// ✅ Create the context
const ChatContext = createContext();

// ✅ Export the provider
export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [personality, setPersonality] = useState('default');
  const [personalities, setPersonalities] = useState([]);

  useEffect(() => {
    loadPersonalities();
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await api.get('/api/conversations');
      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Failed to load conversations:', error);
      }
    }
  };

  const loadPersonalities = async () => {
    try {
      const response = await api.get('/api/personalities');
      if (response.data.success) {
        setPersonalities(response.data.personalities);
      }
    } catch (error) {
      console.error('Failed to load personalities:', error);
    }
  };

  const createConversation = async (title = 'New Conversation') => {
    try {
      const response = await api.post('/api/conversations', { title });
      if (response.data.success) {
        await loadConversations();
        const convId = response.data.conversation_id;
        setCurrentConversation(convId);
        setMessages([]);
        toast.success('New chat created!');
        return convId;
      }
    } catch (error) {
      toast.error('Failed to create chat');
    }
  };

  const deleteConversation = async (id) => {
    try {
      await api.delete(`/api/conversations/${id}`);
      await loadConversations();
      if (currentConversation === id) {
        setCurrentConversation(null);
        setMessages([]);
      }
      toast.success('Conversation deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await api.get(`/api/messages/${conversationId}`);
      if (response.data.success) {
        setMessages(response.data.messages);
        setCurrentConversation(conversationId);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await api.post('/api/chat', {
        message,
        conversation_id: currentConversation,
        personality,
      });

      if (response.data.success) {
        const botMessage = { id: Date.now() + 1, role: 'assistant', content: response.data.response };
        setMessages(prev => [...prev, botMessage]);
        
        if (!currentConversation) {
          setCurrentConversation(response.data.conversation_id);
          await loadConversations();
        }
      } else {
        toast.error(response.data.error || 'Failed to get response');
        setMessages(prev => prev.slice(0, -1));
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.error('Response is taking longer than expected. It will appear once complete.', {
          duration: 5000,
        });
        setTimeout(async () => {
          if (currentConversation) {
            await loadMessages(currentConversation);
          }
          setLoading(false);
        }, 5000);
      } else {
        toast.error('Connection error. Please try again.');
        setMessages(prev => prev.slice(0, -1));
      }
    } finally {
      setLoading(false);
    }
  };

  const value = {
    conversations,
    currentConversation,
    setCurrentConversation,
    messages,
    setMessages,
    loading,
    personality,
    setPersonality,
    personalities,
    loadConversations,
    loadPersonalities,
    loadMessages,
    createConversation,
    deleteConversation,
    sendMessage,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

// ✅ Export the context and a custom hook
export { ChatContext };

// ✅ Custom hook for using the chat context
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}