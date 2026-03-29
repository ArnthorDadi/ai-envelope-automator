'use client';

import React, { useEffect, useState } from 'react';
import { Role } from '@/lib/types';

interface RoleCardProps {
  role: Role;
  onClose: () => void;
}

const roleConfig = {
  liberal: {
    name: 'LIBERAL',
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    message: 'Your mission: Enact 5 liberal policies or find and eliminate Hitler.',
  },
  fascist: {
    name: 'FASCIST',
    color: 'bg-red-600',
    textColor: 'text-red-600',
    message: 'Your mission: Enact 6 fascist policies or elect Hitler as chancellor.',
  },
  hitler: {
    name: 'HITLER',
    color: 'bg-gray-800',
    textColor: 'text-gray-800',
    message: 'Act like a liberal to survive.',
  },
};

export const RoleCard = React.memo(function RoleCard({ role, onClose }: RoleCardProps) {
  const [visible, setVisible] = useState(false);
  const config = roleConfig[role];

  useEffect(() => {
    requestAnimationFrame(() => {
      setVisible(true);
    });

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 7000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl p-8 max-w-sm mx-4 transform transition-all duration-500 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <p className="text-lg font-semibold mb-4">You are a</p>
          <div className={`inline-block px-6 py-4 rounded-lg ${config.color} text-white mb-4`}>
            <span className="text-2xl font-bold">{config.name}</span>
          </div>
          <p className="text-gray-600">{config.message}</p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2 text-gray-500 hover:text-gray-700"
        >
          Tap outside to dismiss
        </button>
      </div>
    </div>
  );
});
