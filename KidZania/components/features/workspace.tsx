"use client";

import { useSimulation } from '@/lib/simulation-context';
import { Editor } from './workspace/editor';
import { Messenger } from './workspace/messenger';
import { Sidebar } from './workspace/sidebar';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

export function Workspace() {
  const { showSuccessPopup, closeSuccessPopup } = useSimulation();

  return (
    <div className="flex h-full w-full bg-gray-50 overflow-hidden">
      <div className="w-[380px] border-r border-gray-200 flex flex-col bg-white shrink-0">
        <Messenger />
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-sm z-10">
        <Editor />
      </div>

      <div className="shrink-0 h-full z-0">
        <Sidebar />
      </div>

      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center"
            >
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: '#E8F5E9' }}
              >
                <CheckCircle className="w-10 h-10 shrink-0" style={{ color: '#2E7D32' }} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">수고하셨습니다!</h2>
              <p className="text-gray-600 mb-8 text-lg break-keep">
                팀원들이 기획안을 확인하고 승인했습니다.<br/>
                완성된 앱 화면을 확인해보세요.
              </p>
              <Button
                className="w-full min-w-[200px] min-h-14 text-lg rounded-full font-bold flex items-center justify-center gap-2 transition-colors bg-gray-900 hover:bg-gray-800 text-white"
                onClick={closeSuccessPopup}
              >
                완성된 앱 화면 보기 <ArrowRight className="w-5 h-5 shrink-0" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
