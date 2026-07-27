import React from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function MobileMenuButton({ isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden p-2 rounded-lg hover:bg-cyber-dark/50 text-cyber-text transition-colors"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {isOpen ? (
        <XMarkIcon className="w-6 h-6" />
      ) : (
        <Bars3Icon className="w-6 h-6" />
      )}
    </button>
  );
}