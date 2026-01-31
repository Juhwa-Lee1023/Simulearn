"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSimulation } from '@/lib/simulation-context';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/figma/image-with-fallback';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function Intro() {
  const router = useRouter();
  const { team, setStep, addMessage } = useSimulation();

  const handleNext = () => {
    addMessage({
      id: 'msg-boss-init',
      senderId: 'biz-lead',
      text: '두쫀쿠가 다 떨어지는 시점에 판매 임박 매장을 더 강조하는 기능을 개발하려고 합니다. 기획안을 작성해주세요.',
      timestamp: new Date(),
      type: 'mission'
    });

    setStep('level-1-task');
    router.push('/workspace');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-zinc-950 p-8 text-white overflow-y-auto">
      <div className="max-w-6xl w-full flex flex-col h-full justify-center">
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center space-y-4 shrink-0"
        >
          <span className="inline-block px-3 py-1 rounded-full border border-zinc-700 text-zinc-400 text-xs font-bold uppercase tracking-wider">
            역할: 서비스 기획자
          </span>
          <h1 className="text-5xl font-bold">당신의 미션</h1>
          <p className="text-base text-zinc-400 max-w-2xl mx-auto break-keep leading-relaxed">
            두쫀쿠가 다 떨어지는 시점에 판매 임박 매장을 더 강조하는 기능을 기획하세요.
            팀원들과 협업하여 예외 상황을 처리하고 완성도 높은 기획안(PRD)을 만들어야 합니다.
          </p>
        </motion.div>

        <h3 className="text-zinc-500 font-bold uppercase tracking-wider text-sm mb-6 text-center shrink-0">함께할 동료들</h3>
        
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-row flex-nowrap justify-center items-stretch gap-4 mb-16 shrink-0"
        >
          {team.map((persona) => (
            <motion.div key={persona.id} variants={item} className="flex-1 min-w-0 basis-0">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center text-center hover:bg-zinc-800 hover:border-zinc-700 transition-all shadow-lg shadow-black/20">
                <div className="w-14 h-14 rounded-full overflow-hidden mb-3 border-2 border-zinc-700 grayscale hover:grayscale-0 transition-all ring-2 ring-zinc-800/50 shrink-0">
                  <ImageWithFallback 
                    src={persona.avatarUrl} 
                    alt={persona.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-base font-bold text-white mb-0.5 truncate w-full">{persona.name}</h3>
                <p className="text-zinc-400 text-xs truncate w-full">{persona.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex justify-center shrink-0">
          <Button 
            onClick={handleNext} 
            className="w-full md:w-auto min-w-[200px] h-14 text-lg rounded-full font-bold flex items-center gap-2 transition-colors"
            style={{ backgroundColor: '#2956CA', color: '#fff' }}
          >
            미션 시작하기 <ArrowRight className="w-5 h-5 shrink-0" />
          </Button>
        </div>
      </div>
    </div>
  );
}
