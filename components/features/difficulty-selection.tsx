"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSimulation, MissionDifficulty } from '@/lib/simulation-context';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const difficulties: { id: MissionDifficulty; label: string; desc: string }[] = [
  { id: 'easy', label: '쉬움', desc: '가이드가 많고 피드백이 부드러워요' },
  { id: 'normal', label: '보통', desc: '적당한 난이도로 진행해요' },
  { id: 'hard', label: '어려움', desc: '기준이 엄격하고 피드백이 짧아요' },
];

export function DifficultySelection() {
  const router = useRouter();
  const { missionDifficulty, setMissionDifficulty, setStep } = useSimulation();

  const handleNext = () => {
    setStep('intro');
    router.push('/intro');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-zinc-950 p-8 text-white overflow-y-auto">
      <div className="max-w-2xl w-full flex flex-col h-full justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center space-y-4 shrink-0"
        >
          <span className="inline-block px-3 py-1 rounded-full border border-zinc-700 text-zinc-400 text-xs font-bold uppercase tracking-wider">
            시뮬레이션
          </span>
          <h1 className="text-5xl font-bold">미션 난이도</h1>
          <p className="text-base text-zinc-400 max-w-xl mx-auto break-keep">
            난이도를 선택하면 미션 화면으로 이동합니다.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row flex-nowrap justify-center gap-6 sm:gap-8 mb-16 shrink-0"
        >
          {difficulties.map((d) => {
            const isSelected = missionDifficulty === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setMissionDifficulty(d.id)}
                className={`
                  flex-1 min-w-0 rounded-xl text-left transition-all px-6 py-4
                  flex flex-col justify-center
                  border-2
                  ${isSelected
                    ? 'bg-white border-[#2956CA] shadow-lg text-gray-900'
                    : 'bg-zinc-900 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800'}
                `}
              >
                <div className="mb-1.5">
                  <span className={`font-bold text-lg ${isSelected ? 'text-gray-900' : 'text-zinc-200'}`}>
                    {d.label}
                  </span>
                </div>
                <span className={`text-sm leading-snug ${isSelected ? 'text-gray-600' : 'text-zinc-500'}`}>
                  {d.desc}
                </span>
              </button>
            );
          })}
        </motion.div>

        <div className="flex justify-center shrink-0">
          <Button
            onClick={handleNext}
            className="w-full md:w-auto min-w-[200px] h-14 text-lg rounded-full font-bold flex items-center gap-2 transition-colors"
            style={{ backgroundColor: '#2956CA', color: '#fff' }}
          >
            다음 <ArrowRight className="w-5 h-5 shrink-0" />
          </Button>
        </div>
      </div>
    </div>
  );
}
