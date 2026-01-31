"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';

// --- Types ---
export type Job = 'Planner' | 'Marketer' | 'Designer';

export interface Persona {
  id: string;
  role: string;
  name: string;
  avatarUrl: string;
  description: string;
  style: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  type: 'text' | 'system' | 'mission';
}

export type Step = 
  | 'job-selection'
  | 'difficulty-selection'
  | 'intro'             
  | 'level-1-task'      
  | 'level-2-dev-inquiry'
  | 'app-preview'
  | 'completion';       

export type MissionDifficulty = 'easy' | 'normal' | 'hard';

export type ReviewStage = 'designer' | 'developer' | 'qa' | 'done';

export interface HelpTipContent {
    title: string;
    concept: string; 
    guide: string;   
}

interface FeedbackResponse {
  passed: boolean;
  message: string;
  senderId: string;
}

interface SimulationState {
  step: Step;
  reviewStage: ReviewStage;
  stageAttempts: number;
  job: Job | null;
  missionDifficulty: MissionDifficulty;
  team: Persona[];
  messages: Message[];
  prdContent: string;
  mentalGauge: number;
  feedbackRound: number;
  showSuccessPopup: boolean;
  helpTip: HelpTipContent | null;
  isReviewing: boolean;
}

interface SimulationContextType extends SimulationState {
  setStep: (step: Step) => void;
  setJob: (job: Job) => void;
  setMissionDifficulty: (d: MissionDifficulty) => void;
  addMessage: (msg: Message) => void;
  updatePrd: (content: string) => void;
  reduceMental: (amount: number) => void;
  restoreMental: () => void;
  submitPrd: () => void;
  triggerHelp: () => void;
  closeSuccessPopup: () => void;
  resetSimulation: () => void;
}

// --- Constants ---
const DEFAULT_MENTAL = 100;
const MAX_RETRIES = 2;
const RETRY_DELAYS = [300, 800];
const STORAGE_KEY = 'simulearn_state';
const STORAGE_VERSION = 1;
const DEFAULT_PRD = '# 두쫀쿠 소진 시점 판매 임박 매장 강조\n\n## 목표\n\n## 상세 정책\n\n';

interface PersistedState {
  version: number;
  prdContent: string;
  step: Step;
  reviewStage: ReviewStage;
  job: Job | null;
  mentalGauge: number;
  stageAttempts: number;
  messages: Array<Omit<Message, 'timestamp'> & { timestamp: string }>;
}

function loadPersistedState(): Partial<SimulationState> | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const parsed: PersistedState = JSON.parse(stored);
    if (parsed.version !== STORAGE_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return {
      prdContent: parsed.prdContent,
      step: parsed.step,
      reviewStage: parsed.reviewStage,
      job: parsed.job,
      mentalGauge: parsed.mentalGauge,
      stageAttempts: parsed.stageAttempts,
      messages: parsed.messages.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }))
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function savePersistedState(state: {
  prdContent: string;
  step: Step;
  reviewStage: ReviewStage;
  job: Job | null;
  mentalGauge: number;
  stageAttempts: number;
  messages: Message[];
}) {
  if (typeof window === 'undefined') return;
  
  const toStore: PersistedState = {
    version: STORAGE_VERSION,
    prdContent: state.prdContent,
    step: state.step,
    reviewStage: state.reviewStage,
    job: state.job,
    mentalGauge: state.mentalGauge,
    stageAttempts: state.stageAttempts,
    messages: state.messages.map(m => ({
      ...m,
      timestamp: m.timestamp.toISOString()
    }))
  };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    console.warn('Failed to save state to localStorage');
  }
}

const FALLBACK_MESSAGES: Record<ReviewStage, string> = {
  designer: "일시적인 오류가 발생했어요. 기획안을 다시 제출해주세요.",
  developer: "네트워크 문제가 있는 것 같아요. 잠시 후 다시 시도해주세요.",
  qa: "검토 중 문제가 발생했습니다. 다시 제출해주세요.",
  done: ""
};

const STAGE_SENDER_MAP: Record<ReviewStage, string> = {
  designer: 'designer-lead',
  developer: 'dev-senior',
  qa: 'qa-manager',
  done: ''
};

export const TEAM_PERSONAS: Persona[] = [
  {
    id: 'designer-lead',
    role: '디자이너',
    name: '이사라',
    avatarUrl: 'https://images.unsplash.com/photo-1626784579980-db39c1a13aa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGRlc2lnbmVyJTIwd29tYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3Njk4Nzc3Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'UX/UI 전문가',
    style: '시각적 & 사용자 중심'
  },
  {
    id: 'dev-senior',
    role: '개발자',
    name: '강개발',
    avatarUrl: 'https://images.unsplash.com/photo-1545830571-6d7665a05cb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW5pb3IlMjBkZXZlbG9wZXIlMjBhc2lhbiUyMG1hbiUyMGdsYXNzZXMlMjBwb3J0cmFpdHxlbnwxfHx8fDE3Njk4Nzc3Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: '테크 리드',
    style: '논리적 & 비판적'
  },
  {
    id: 'qa-manager',
    role: 'QA 매니저',
    name: '김꼼꼼',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHdvbWFuJTIwZ2xhc3NlcyUyMHRlY2h8ZW58MXx8fHwxNzY5ODc3Nzc5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: '품질 관리자',
    style: '예외 케이스 & 시나리오'
  },
  {
    id: 'biz-lead',
    role: '사업 리더',
    name: '최이사',
    avatarUrl: 'https://images.unsplash.com/photo-1584940120505-117038d90b05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbiUyMGxlYWRlciUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTg3Nzc3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: '프로젝트 오너',
    style: '목표 지향적'
  }
];

// --- Helper Functions ---
async function fetchFeedbackWithRetry(
  prdContent: string,
  reviewStage: ReviewStage,
  stageAttempts: number,
  missionDifficulty: MissionDifficulty
): Promise<FeedbackResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prdContent, reviewStage, stageAttempts, missionDifficulty }),
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      
      if (typeof data.passed !== 'boolean' || typeof data.message !== 'string') {
        throw new Error('Invalid response shape');
      }

      return data as FeedbackResponse;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`Feedback API attempt ${attempt + 1} failed:`, lastError.message);

      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}

// --- Context ---
const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<Step>('job-selection');
  const [reviewStage, setReviewStage] = useState<ReviewStage>('designer');
  const [stageAttempts, setStageAttempts] = useState<number>(0);
  const [job, setJob] = useState<Job | null>(null);
  const [missionDifficulty, setMissionDifficulty] = useState<MissionDifficulty>('easy');
  const [messages, setMessages] = useState<Message[]>([]);
  const [prdContent, setPrdContent] = useState<string>(DEFAULT_PRD);
  const [mentalGauge, setMentalGauge] = useState(DEFAULT_MENTAL);
  const [feedbackRound, setFeedbackRound] = useState(0);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [helpTip, setHelpTip] = useState<HelpTipContent | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const persisted = loadPersistedState();
    if (persisted) {
      if (persisted.step) setStep(persisted.step);
      if (persisted.reviewStage) setReviewStage(persisted.reviewStage);
      if (persisted.stageAttempts !== undefined) setStageAttempts(persisted.stageAttempts);
      if (persisted.job !== undefined) setJob(persisted.job);
      if (persisted.messages) setMessages(persisted.messages);
      if (persisted.prdContent) setPrdContent(persisted.prdContent);
      if (persisted.mentalGauge !== undefined) setMentalGauge(persisted.mentalGauge);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      savePersistedState({
        prdContent,
        step,
        reviewStage,
        job,
        mentalGauge,
        stageAttempts,
        messages
      });
    }, 500);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isHydrated, prdContent, step, reviewStage, job, mentalGauge, stageAttempts, messages]);

  const addMessage = useCallback((msg: Message) => {
    setMessages(prev => [...prev, msg]);
    if (msg.senderId !== 'user' && msg.senderId !== 'system') {
      const sender = TEAM_PERSONAS.find(p => p.id === msg.senderId);
      if (sender) {
        console.log(`${sender.role}님의 메시지`, {
          description: "피드백이 도착했습니다. 확인해보세요.",
        });
      }
    }
  }, []);

  const reduceMental = useCallback((amount: number) => {
    setMentalGauge(prev => Math.max(0, prev - amount));
  }, []);

  const restoreMental = useCallback(() => {
    setMentalGauge(prev => Math.min(100, prev + 20));
  }, []);

  const triggerHelp = useCallback(() => {
    let tip: HelpTipContent;

    if (step === 'level-1-task') {
      if (reviewStage === 'designer') {
        tip = {
          title: "디자이너를 위한 기획",
          concept: "디자이너는 '데이터'보다 '화면'을 그립니다.",
          guide: "버튼의 위치, 텍스트 문구, 그리고 상태(활성/비활성)에 대해 묘사해주세요. 예: '장바구니 하단에 [쿠폰 적용] 버튼 노출'"
        };
      } else if (reviewStage === 'developer') {
        tip = {
          title: "개발자를 위한 예외처리",
          concept: "Happy Path(성공 케이스)만 있는 기획서는 반쪽짜리입니다.",
          guide: "API가 실패하거나, 타임아웃이 발생했을 때 얼럿(Alert)을 띄울까요? 아니면 조용히 넘어갈까요? '예외' 항목을 추가하세요."
        };
      } else {
        tip = {
          title: "QA를 위한 인수 기준",
          concept: "기능이 완료되었다고 판단하는 기준(Acceptance Criteria)이 필요합니다.",
          guide: "예: '쿠폰이 있는 경우 -> 자동 적용', '쿠폰이 없는 경우 -> 버튼 비활성화' 처럼 케이스별 예상 결과를 명시하세요."
        };
      }
    } else {
      tip = {
        title: "명확한 의사결정",
        concept: "개발자는 A안과 B안 중 하나를 확정해주길 원합니다.",
        guide: "버튼을 아예 숨길지(Hide), 흐리게 보여줄지(Disabled) 결정해서 알려주세요."
      };
    }

    setHelpTip(tip);
  }, [step, reviewStage]);

  const submitPrd = useCallback(async () => {
    if (isReviewing) return;
    setIsReviewing(true);

    const startTime = Date.now();
    const MIN_REVIEW_TIME = 1500;

    try {
      if (step === 'level-1-task' && reviewStage !== 'done') {
        let feedback: FeedbackResponse;
        let usedFallback = false;

        try {
          feedback = await fetchFeedbackWithRetry(prdContent, reviewStage, stageAttempts, missionDifficulty);
        } catch {
          usedFallback = true;
          feedback = {
            passed: false,
            message: FALLBACK_MESSAGES[reviewStage],
            senderId: STAGE_SENDER_MAP[reviewStage],
          };
        }

        const elapsed = Date.now() - startTime;
        if (elapsed < MIN_REVIEW_TIME) {
          await new Promise(resolve => setTimeout(resolve, MIN_REVIEW_TIME - elapsed));
        }

        addMessage({
          id: `feedback-${Date.now()}`,
          senderId: feedback.senderId,
          text: feedback.message,
          timestamp: new Date(),
          type: 'text'
        });

        if (feedback.passed && !usedFallback) {
          setStageAttempts(0);
          
          if (reviewStage === 'designer') {
            setReviewStage('developer');
          } else if (reviewStage === 'developer') {
            setReviewStage('qa');
          } else if (reviewStage === 'qa') {
            setReviewStage('done');
            setShowSuccessPopup(true);
            restoreMental();
          }
        } else {
          setFeedbackRound(prev => prev + 1);
          reduceMental(10);
          
          const newAttempts = stageAttempts + 1;
          setStageAttempts(newAttempts);
          
          if (newAttempts >= 2) {
            addMessage({
              id: `hint-guide-${Date.now()}`,
              senderId: 'system',
              text: "💡 막히셨나요? 우측의 '힌트 보기'를 눌러보세요!",
              timestamp: new Date(),
              type: 'system'
            });
            triggerHelp();
          }
        }
      }
    } finally {
      setIsReviewing(false);
    }
  }, [isReviewing, step, reviewStage, prdContent, stageAttempts, missionDifficulty, addMessage, reduceMental, restoreMental, triggerHelp]);

  const closeSuccessPopup = useCallback(() => {
    setShowSuccessPopup(false);
    setStep('app-preview');
  }, []);

  const resetSimulation = useCallback(() => {
    setStep('job-selection');
    setReviewStage('designer');
    setStageAttempts(0);
    setJob(null);
    setMessages([]);
    setPrdContent(DEFAULT_PRD);
    setMentalGauge(DEFAULT_MENTAL);
    setFeedbackRound(0);
    setShowSuccessPopup(false);
    setHelpTip(null);
    setIsReviewing(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <SimulationContext.Provider value={{
      step, setStep,
      reviewStage,
      stageAttempts,
      job, setJob,
      missionDifficulty, setMissionDifficulty,
      team: TEAM_PERSONAS,
      messages, addMessage,
      prdContent, updatePrd: setPrdContent,
      mentalGauge, reduceMental, restoreMental,
      feedbackRound,
      showSuccessPopup, closeSuccessPopup,
      helpTip, triggerHelp,
      submitPrd, resetSimulation,
      isReviewing
    }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) throw new Error('useSimulation must be used within SimulationProvider');
  return context;
}
