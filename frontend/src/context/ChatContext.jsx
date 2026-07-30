import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [personality, setPersonality] = useState('default');
  const [personalities, setPersonalities] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    loadPersonalities();
    loadConversations();
    loadFiles();
  }, []);

  // ============================================
  // CONVERSATION METHODS
  // ============================================

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
      return null;
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

  // ============================================
  // MESSAGE METHODS
  // ============================================

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

  // ============================================
  // FILE UPLOAD METHODS
  // ============================================

  const loadFiles = async () => {
    try {
      const response = await api.get('/api/files');
      if (response.data.success) {
        setUploadedFiles(response.data.files || []);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        toast.success(`File "${file.name}" uploaded successfully!`);
        await loadFiles();
        return response.data;
      } else {
        toast.error(response.data.error || 'File upload failed');
        return null;
      }
    } catch (error) {
      toast.error('File upload failed: ' + (error.response?.data?.error || error.message));
      return null;
    }
  };

  const deleteFile = async (fileId) => {
    try {
      await api.delete(`/api/files/${fileId}`);
      toast.success('File deleted');
      await loadFiles();
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value = {
    conversations,
    currentConversation,
    setCurrentConversation,
    loadConversations,
    createConversation,
    deleteConversation,
    
    messages,
    setMessages,
    loadMessages,
    sendMessage,
    
    personality,
    setPersonality,
    personalities,
    loadPersonalities,
    
    uploadedFiles,
    uploadFile,
    deleteFile,
    loadFiles,
    
    loading,
    setLoading,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}