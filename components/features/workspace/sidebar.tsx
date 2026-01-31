"use client";

import React, { useState, useEffect } from 'react';
import { useSimulation } from '@/lib/simulation-context';
import { Button } from '@/components/ui/button';
import { Lightbulb, Info, Sparkles, BookOpen, CheckSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Sidebar() {
  const { step, helpTip, triggerHelp } = useSimulation();
  const [isTipVisible, setIsTipVisible] = useState(false);

  const handleTriggerHelp = () => {
    triggerHelp();
    setIsTipVisible(true);
  };

  useEffect(() => {
    if (helpTip) setIsTipVisible(true);
  }, [helpTip]);

  return (
    <div className="w-72 flex flex-col gap-4 h-full bg-white border-l border-gray-200 p-4">
      <div className="mb-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            type="button"
            onClick={handleTriggerHelp}
            className="w-full h-12 flex items-center justify-center gap-2 text-white font-bold shadow-md hover:shadow-lg border-none text-base relative overflow-hidden group"
            style={{ backgroundColor: '#2956CA' }}
          >
            <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 -skew-x-12 -translate-x-full" />
            <Lightbulb className="w-5 h-5 fill-white" />
            힌트 보기
          </Button>
        </motion.div>
        
        <AnimatePresence>
          {isTipVisible && helpTip && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-4 bg-white rounded-xl overflow-hidden relative"
            >
              <div 
                className="p-3 flex justify-between items-start"
                style={{ backgroundColor: '#D0E4F8' }}
              >
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-full text-white" style={{ backgroundColor: '#2956CA' }}>
                    <Sparkles className="w-3 h-3" />
                  </span>
                  <span className="font-bold text-sm" style={{ color: '#0F172A' }}>멘토의 가이드</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsTipVisible(false)} 
                  className="opacity-70 hover:opacity-100 transition-opacity"
                  style={{ color: '#2956CA' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <h4 className="font-bold text-base leading-tight" style={{ color: '#0F172A' }}>
                  {helpTip.title}
                </h4>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2956CA' }} />
                    <p className="text-xs leading-relaxed break-keep" style={{ color: '#0F172A' }}>
                      <span className="font-bold" style={{ color: '#2956CA' }}>Concept:</span> {helpTip.concept}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckSquare className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2956CA' }} />
                    <p className="text-xs leading-relaxed break-keep" style={{ color: '#0F172A' }}>
                      <span className="font-bold" style={{ color: '#2956CA' }}>Action:</span> {helpTip.guide}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div>
        <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider flex items-center gap-2">
          <Info className="w-3 h-3" /> 퀵 가이드
        </h3>
        
        <div className="space-y-4">
          {step === 'level-1-task' ? (
            <>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors">
                <h4 className="font-bold text-gray-900 text-sm mb-1">1. 목표(Goal) 정의</h4>
                <p className="text-xs text-gray-600 break-keep leading-relaxed">
                  이 기능을 왜 만드나요? 비즈니스 목적을 가장 먼저 명시하세요.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors">
                <h4 className="font-bold text-gray-900 text-sm mb-1">2. 유저 플로우(Flow)</h4>
                <p className="text-xs text-gray-600 break-keep leading-relaxed">
                  지도 진입 &rarr; 매장 재고 조회 &rarr; 판매 임박 매장 강조 &rarr; 사용자 노출 순서를 그려보세요.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors">
                <h4 className="font-bold text-gray-900 text-sm mb-1">3. 예외 처리(Exception)</h4>
                <p className="text-xs text-gray-600 break-keep leading-relaxed">
                  재고 데이터가 없거나, API 호출이 실패했을 때 어떻게 보여줄까요?
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors">
                <h4 className="font-bold text-gray-900 text-sm mb-1">개발자 질문 대응</h4>
                <p className="text-xs text-gray-600 break-keep leading-relaxed">
                  개발자는 명확한 로직을 원합니다. '적당히'가 아닌 '정확한' 조건을 제시하세요.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors">
                <h4 className="font-bold text-gray-900 text-sm mb-1">케이스 분기</h4>
                <p className="text-xs text-gray-600 break-keep leading-relaxed">
                  데이터가 있을 때(Show)와 없을 때(Hide/Disabled)를 명확히 구분해야 합니다.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
