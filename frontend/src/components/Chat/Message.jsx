import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

export default function Message({ role, content, timestamp }) {
  const { user } = useAuth();
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`px-4 py-3 ${isUser ? 'message-user shadow-glow-purple/20' : 'message-bot shadow-glow-purple/5'}`}>
          <div className="flex items-center justify-between gap-4 mb-1">
            <span className="text-xs font-medium opacity-70">
              {isUser ? user?.username || 'You' : 'Nova AI'}
            </span>
            <span className="text-xs opacity-40">
              {timestamp ? formatDate(timestamp) : ''}
            </span>
          </div>
          <div className="prose prose-invert max-w-none prose-pre:bg-cyber-dark prose-pre:border prose-pre:border-cyber-border/30">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  
                  return !inline && match ? (
                    <div className="relative group">
                      <div className="flex justify-between items-center bg-cyber-dark/80 rounded-t-lg px-4 py-2 border-b border-cyber-border/30">
                        <span className="text-xs text-cyber-text-dim font-medium">{match[1]}</span>
                        <button
                          onClick={() => copyToClipboard(codeString)}
                          className="text-xs text-cyber-text-dim hover:text-cyber-text transition flex items-center gap-1.5"
                        >
                          {copied ? (
                            <>
                              <ClipboardDocumentCheckIcon className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <ClipboardIcon className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-b-lg !mt-0 !bg-cyber-dark/50"
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className={`${className} bg-cyber-dark/50 px-1.5 py-0.5 rounded text-cyber-cyan text-sm`} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </motion.div>
  );
}