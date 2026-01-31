"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSimulation, Job } from '@/lib/simulation-context';
import { Button } from '@/components/ui/button';
import { Briefcase, Megaphone, Palette } from 'lucide-react';
import { motion } from 'motion/react';

const jobs = [
  { id: 'Planner', icon: Briefcase, label: '서비스 기획자', disabled: false, desc: '요구사항을 정의하고 소통합니다.' },
  { id: 'Marketer', icon: Megaphone, label: '마케터', disabled: true, desc: '서비스를 널리 알리고 분석합니다.' },
  { id: 'Designer', icon: Palette, label: '디자이너', disabled: true, desc: '사용자 경험을 아름답게 설계합니다.' },
];

export function JobSelection() {
  const router = useRouter();
  const { setStep, job, setJob } = useSimulation();

  const handleStart = () => {
    if (job) {
      setStep('difficulty-selection');
      router.push('/difficulty');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-zinc-950 p-8 text-white overflow-y-auto">
      <div className="max-w-5xl w-full flex flex-col h-full justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-12 shrink-0"
        >
          <span className="inline-block px-3 py-1 rounded-full border border-zinc-700 text-zinc-400 text-xs font-bold uppercase tracking-wider">
            시뮬레이션
          </span>
          <h1 className="text-5xl font-bold">Simulearn</h1>
          <p className="text-base text-zinc-400 max-w-2xl mx-auto break-keep">
            커리어를 선택하여 시뮬레이션을 시작하세요.
          </p>
        </motion.div>

        <h3 className="text-zinc-500 font-bold uppercase tracking-wider text-sm mb-6 text-center shrink-0">역할 선택</h3>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 shrink-0"
        >
          {jobs.map((role) => (
            <motion.button
              key={role.id}
              type="button"
              whileHover={!role.disabled ? { scale: 1.02 } : {}}
              whileTap={!role.disabled ? { scale: 0.98 } : {}}
              onClick={() => !role.disabled && setJob(role.id as Job)}
              className={`
                relative flex flex-col items-center justify-center p-8 rounded-xl text-center transition-all h-72
                ${job === role.id 
                  ? 'bg-zinc-800 border-2 shadow-xl shadow-black/20' 
                  : 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700'
                }
                ${role.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              `}
              style={!role.disabled && job === role.id ? { borderColor: '#2956CA' } : undefined}
            >
              <div 
                className={`p-4 rounded-full mb-6 transition-colors shrink-0 ${!role.disabled && job === role.id ? '' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'}`}
                style={!role.disabled && job === role.id ? { backgroundColor: '#2956CA', color: '#fff' } : undefined}
              >
                <role.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{role.label}</h3>
              {role.disabled ? (
                <span className="inline-block px-3 py-1 rounded-full border border-zinc-600 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                  오픈 예정
                </span>
              ) : (
                <span className="text-zinc-400 text-sm break-keep">{role.desc}</span>
              )}
            </motion.button>
          ))}
        </motion.div>

        <div className="flex justify-center shrink-0">
          <Button 
            onClick={handleStart} 
            disabled={!job} 
            className="w-full md:w-auto min-w-[200px] h-14 text-lg rounded-full font-bold transition-colors disabled:bg-zinc-800 disabled:text-zinc-500 disabled:opacity-60"
            style={job ? { backgroundColor: '#2956CA', color: '#fff' } : undefined}
          >
            시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}
