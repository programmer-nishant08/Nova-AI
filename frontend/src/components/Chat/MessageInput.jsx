import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PaperAirplaneIcon, 
  MicrophoneIcon, 
  PaperClipIcon,
  SpeakerWaveIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useChat } from '../../hooks/useChat';

export default function MessageInput({ onSend, disabled }) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const { uploadFile } = useChat();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setMessage(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  // Text-to-Speech
  const speakText = () => {
    if ('speechSynthesis' in window) {
      // Find the last assistant message
      const messageElements = document.querySelectorAll('.message-bot:last-child');
      if (messageElements.length === 0) {
        toast.error('No message to read aloud');
        return;
      }
      
      const text = messageElements[messageElements.length - 1].textContent || '';
      if (!text) {
        toast.error('No message to read aloud');
        return;
      }

      // If already speaking, stop
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Text-to-speech is not supported in your browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      // If we have a file, upload it first
      if (uploadedFile) {
        const result = await uploadFile(uploadedFile);
        if (result) {
          toast.success(`File "${uploadedFile.name}" uploaded! You can now ask questions about it.`);
        }
        setUploadedFile(null);
      }
      
      onSend(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error('File too large. Maximum size is 10MB.');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/png', 'image/jpeg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('File type not supported. Please upload PDF, DOCX, TXT, PNG, or JPEG.');
        return;
      }
      
      setUploadedFile(file);
      toast.success(`File "${file.name}" selected for upload. Send your message to upload.`);
    }
  };

  const startVoiceRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      recognitionRef.current.start();
    } else {
      toast.error('Voice recognition is not supported in your browser.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-cyber-surface/30 backdrop-blur-sm">
      {/* Uploaded file preview */}
      {uploadedFile && (
        <div className="flex items-center justify-between gap-2 px-4 py-2 bg-cyber-dark/30 border-b border-cyber-border/10">
          <div className="flex items-center gap-2">
            <span className="text-sm text-cyber-text-dim">📎</span>
            <span className="text-sm text-cyber-text truncate max-w-[200px]">{uploadedFile.name}</span>
            <span className="text-xs text-cyber-text-dim/50">
              {(uploadedFile.size / 1024).toFixed(1)} KB
            </span>
          </div>
          <button
            onClick={clearFile}
            className="text-cyber-text-dim hover:text-red-400 transition p-1 rounded-lg hover:bg-red-400/10"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2 max-w-4xl mx-auto px-4 py-3">
        <div className="flex-1 relative">
          <div className={`absolute left-3 bottom-3 flex items-center gap-1 transition-opacity duration-200 ${
            isFocused || message ? 'opacity-0' : 'opacity-100'
          }`}>
            <span className="text-xs text-cyber-text-dim/30">⌘</span>
            <span className="text-xs text-cyber-text-dim/20">Message Nova...</span>
          </div>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder=""
            rows={1}
            className="w-full bg-cyber-dark/50 border border-cyber-border/20 rounded-2xl px-4 py-3 text-cyber-text placeholder-transparent focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition resize-none min-h-[52px] max-h-[120px]"
            disabled={disabled}
          />
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* File Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2.5 rounded-xl transition ${
              uploadedFile 
                ? 'text-cyber-purple bg-cyber-purple/10' 
                : 'text-cyber-text-dim hover:text-cyber-text hover:bg-cyber-dark/50'
            }`}
            title="Upload file (PDF, DOCX, TXT, Images)"
          >
            <PaperClipIcon className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Voice Typing Button */}
          <button
            type="button"
            onClick={startVoiceRecording}
            className={`p-2.5 rounded-xl transition ${
              isRecording 
                ? 'text-red-400 bg-red-400/10 animate-pulse' 
                : 'text-cyber-text-dim hover:text-cyber-text hover:bg-cyber-dark/50'
            }`}
            title="Voice typing"
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>

          {/* Text-to-Speech Button */}
          <button
            type="button"
            onClick={speakText}
            className={`p-2.5 rounded-xl transition ${
              isSpeaking 
                ? 'text-cyber-purple bg-cyber-purple/10' 
                : 'text-cyber-text-dim hover:text-cyber-text hover:bg-cyber-dark/50'
            }`}
            title="Read last response aloud"
          >
            <SpeakerWaveIcon className="w-5 h-5" />
          </button>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!message.trim() || disabled}
            className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white p-2.5 rounded-xl hover:shadow-glow-purple transition-all duration-300 disabled:opacity-40 disabled:hover:shadow-none disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </motion.button>
        </div>
      </form>
    </div>
  );
}