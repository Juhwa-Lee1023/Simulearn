"use client";

import React from 'react';
import { useSimulation } from '@/lib/simulation-context';
import { Button } from '@/components/ui/button';
import { Send, Save, Loader2, HeartPulse, Check, User, Code, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const stages = [
  { id: 'designer', label: '디자인', icon: User },
  { id: 'developer', label: '개발', icon: Code },
  { id: 'qa', label: 'QA', icon: CheckCircle2 },
];

export function Editor() {
  const { prdContent, updatePrd, submitPrd, step, isReviewing, mentalGauge, reviewStage } = useSimulation();

  const getButtonText = () => {
    if (isReviewing) return '검토 중...';
    if (step === 'level-1-task') {
      if (reviewStage === 'designer') return '디자이너 리뷰 요청';
      if (reviewStage === 'developer') return '개발자 리뷰 요청';
      if (reviewStage === 'qa') return 'QA 검증 요청';
    }
    return '답변 보내기';
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="p-4 border-b border-gray-100 bg-white z-10 space-y-4">
        {step === 'level-1-task' && (
          <div className="flex flex-col px-4 pb-2">
            <div className="flex items-center w-full relative h-8">
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-100 -translate-y-1/2 -z-10 rounded-full" />
              <div 
                className="absolute left-0 top-1/2 h-1 bg-gray-900 -translate-y-1/2 -z-10 rounded-full transition-all duration-500"
                style={{ 
                  width: reviewStage === 'designer' ? '16%' : 
                         reviewStage === 'developer' ? '50%' : 
                         reviewStage === 'qa' ? '84%' : '100%' 
                }} 
              />
              {stages.map((s) => {
                const isCompleted = 
                  (reviewStage === 'developer' && s.id === 'designer') ||
                  (reviewStage === 'qa' && (s.id === 'designer' || s.id === 'developer')) ||
                  (reviewStage === 'done');
                const isActive = reviewStage === s.id;
                return (
                  <div key={s.id} className="flex-1 flex justify-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 shrink-0
                      ${isActive ? 'bg-gray-900 border-gray-900 text-white scale-110 shadow-lg' : 
                        isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-400'}
                    `}>
                      {isCompleted ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-around mt-2">
              {stages.map((s) => {
                const isCompleted = 
                  (reviewStage === 'developer' && s.id === 'designer') ||
                  (reviewStage === 'qa' && (s.id === 'designer' || s.id === 'developer')) ||
                  (reviewStage === 'done');
                const isActive = reviewStage === s.id;
                return (
                  <span 
                    key={s.id} 
                    className={`flex-1 text-center text-xs font-bold transition-colors duration-300 ${isActive ? 'text-gray-900' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    {s.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">기획안 에디터 (PRD)</h3>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              <HeartPulse className={`w-3 h-3 ${mentalGauge < 30 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
              <span className={`text-xs font-bold ${mentalGauge < 30 ? 'text-red-600' : 'text-gray-600'}`}>
                멘탈: {mentalGauge}%
              </span>
              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden ml-1">
                <motion.div 
                  className={`h-full ${mentalGauge < 30 ? 'bg-red-500' : 'bg-green-500'}`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${mentalGauge}%` }}
                  transition={{ type: "spring", stiffness: 100 }}
                />
              </div>
            </div>
          </div>
          
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Save className="w-3 h-3" /> 자동 저장 중...
          </span>
        </div>
      </div>

      <div className="flex-1 relative bg-white">
        <textarea
          className="w-full h-full p-6 resize-none focus:outline-none font-mono text-sm text-gray-800 leading-relaxed"
          value={prdContent}
          onChange={(e) => updatePrd(e.target.value)}
          placeholder="# 기획안을 작성해주세요..."
          spellCheck={false}
          disabled={isReviewing}
        />
      </div>
      <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
        <Button 
          onClick={submitPrd} 
          disabled={isReviewing}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white transition-all disabled:opacity-80 disabled:cursor-not-allowed"
          size="md"
        >
          {isReviewing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              검토 중...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> 
              {getButtonText()}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
