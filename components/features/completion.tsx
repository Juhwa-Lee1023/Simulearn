"use client";

import { useSimulation } from '@/lib/simulation-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'motion/react';
import { BookOpen, Users, Briefcase } from 'lucide-react';

const cards = [
  { 
    icon: BookOpen, 
    title: "기획 강의 수강하기", 
    desc: "서비스 기획 실무 방법론을 깊이 있게 배워보세요.", 
    color: "bg-blue-50 text-blue-600",
    iconBg: "#D0E4F8",
    iconColor: "#2956CA",
    href: "https://fastcampus.co.kr"
  },
  { 
    icon: Users, 
    title: "현직자와 커피챗", 
    desc: "시니어 PM에게 1:1로 멘토링을 받아보세요.", 
    color: "bg-purple-50 text-purple-600",
    iconBg: "#E0E7FF",
    iconColor: "#6366F1",
    href: "https://www.linkedin.com"
  },
  { 
    icon: Briefcase, 
    title: "채용 공고 확인하기", 
    desc: "준비가 되셨나요? 지금 바로 지원해보세요.", 
    color: "bg-green-50 text-green-600",
    iconBg: "#E5F19A",
    iconColor: "#9ED28B",
    href: "https://jasoseol.com"
  },
];

export function Completion() {
  const { resetSimulation } = useSimulation();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white p-8 overflow-y-auto">
      <div className="max-w-4xl w-full text-center flex flex-col h-full justify-center">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 shrink-0"
        >
            <h1 className="text-5xl font-bold text-gray-900 mb-4">시뮬레이션 완료</h1>
            <p className="text-xl text-gray-500 break-keep">
                축하합니다! 성공적으로 프로덕트 기획 과정을 경험하셨습니다.<br/>
                이제 더 넓은 세상으로 나아갈 준비가 되셨나요?
            </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 shrink-0">
            {cards.map((c, i) => (
                <motion.div 
                    key={c.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="h-full"
                >
                    <a href={c.href} target="_blank" rel="noopener noreferrer" className="w-full text-left h-full group block">
                        <Card className="h-full hover:shadow-xl transition-all border-gray-200 group-hover:border-gray-400 flex flex-col p-6">
                            <div 
                                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                                style={{ backgroundColor: c.iconBg, color: c.iconColor }}
                            >
                                <c.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {c.title}
                            </h3>
                            <p className="text-gray-500 break-keep">
                                {c.desc}
                            </p>
                        </Card>
                    </a>
                </motion.div>
            ))}
        </div>

        <div className="shrink-0">
            <Button onClick={resetSimulation} variant="ghost" className="text-gray-400 hover:text-gray-900">
                처음으로 돌아가기
            </Button>
        </div>
      </div>
    </div>
  );
}
