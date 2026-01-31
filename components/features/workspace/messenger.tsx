"use client";

import React, { useEffect, useRef } from 'react';
import { useSimulation } from '@/lib/simulation-context';
import { ImageWithFallback } from '@/components/figma/image-with-fallback';
import { Card } from '@/components/ui/card';

export function Messenger() {
  const { messages, team } = useSimulation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getPersona = (id: string) => {
    if (id === 'user') return { name: '나', avatarUrl: '', role: '기획자' };
    if (id === 'system') return { name: '시스템', avatarUrl: '', role: 'Bot' };
    return team.find(p => p.id === id);
  };

  return (
    <Card className="flex flex-col h-full bg-white border-r border-gray-200 rounded-none shadow-none p-0">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">팀 채팅</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pt-8 space-y-6 bg-gray-50">
        {messages.map((msg) => {
          const sender = getPersona(msg.senderId);
          const isSystem = msg.type === 'system';
          const isMission = msg.type === 'mission';
          const isUser = msg.senderId === 'user';
          
          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="text-xs text-gray-400 px-2 py-1">
                  {msg.text}
                </span>
              </div>
            );
          }

          if (isMission) {
            return (
              <div key={msg.id} className="bg-gray-900 text-white p-4 rounded-lg shadow-lg mx-4 my-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase text-yellow-500">새로운 요청</span>
                  <span className="text-xs text-gray-400">{sender?.name}</span>
                </div>
                <p className="text-sm font-medium leading-relaxed break-keep">{msg.text}</p>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
              {sender && sender.avatarUrl ? (
                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden mt-1 border border-gray-200">
                  <ImageWithFallback src={sender.avatarUrl} alt={sender.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                  {sender?.name?.[0]}
                </div>
              )}
              <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-bold text-xs text-gray-900">{sender?.name}</span>
                  {sender && !isUser && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">
                      {sender.role}
                    </span>
                  )}
                </div>
                <div className={`px-4 py-3 text-sm leading-relaxed shadow-sm rounded-2xl break-keep ${
                  isUser 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </Card>
  );
}
