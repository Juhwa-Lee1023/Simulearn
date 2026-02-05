"use client";

import { useSimulation } from '@/lib/simulation-context';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

type Store = {
  id: string;
  name: string;
  address: string;
  left: string;
  top: string;
  sellingOutSoon: boolean;
};

const STORES: Store[] = [
  { id: 'gangnam', name: '강남점', address: '서울 강남구', left: '22%', top: '58%', sellingOutSoon: false },
  { id: 'hongdae', name: '홍대점', address: '서울 마포구', left: '48%', top: '32%', sellingOutSoon: true },
  { id: 'sinchon', name: '신촌점', address: '서울 서대문구', left: '62%', top: '48%', sellingOutSoon: false },
];

const DUJJONKU_IMAGE = '/ddujjonku.png';

export function AppPreview() {
  const { setStep } = useSimulation();
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white p-4 md:p-8 overflow-y-auto">
      <div className="max-w-2xl w-full flex flex-col h-full justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8 text-center shrink-0"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">당신의 기획안으로 만든 앱</h1>
          <p className="text-sm md:text-base text-gray-500 break-keep">
            팀이 기획안을 반영해 구현한, 두쫀쿠 소진 시점에 매진 임박 매장을 강조하는 화면입니다.
          </p>
        </motion.div>

        {/* Mock App: 지도 + 두쫀쿠 매장 마커, 소진 임박 강조 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden bg-white shrink-0 mb-8 md:mb-12"
        >
          {/* App header */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-600" />
            <span className="font-bold text-gray-900">매진 임박 매장</span>
          </div>

          {/* Map area - 세로 절반 높이 */}
          <div
            className="relative w-full overflow-hidden bg-[#e8eef4]"
            style={{ minHeight: 160, aspectRatio: '8/3' }}
          >
            {/* 지도 배경: 그리드 + 도로 느낌 */}
            <svg
              className="absolute inset-0 w-full h-full block"
              viewBox="0 0 400 300"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="지도 배경"
            >
              <rect width="400" height="300" fill="#e8eef4" />
              {[0,1,2,3,4,5,6,7,8,9,10].map((i) => (
                <line key={`grid-v-${i}`} x1={i * 40} y1={0} x2={i * 40} y2={300} stroke="#c5d4e4" strokeWidth="1" />
              ))}
              {[0,1,2,3,4,5,6,7].map((i) => (
                <line key={`grid-h-${i}`} x1={0} y1={i * 40} x2={400} y2={i * 40} stroke="#c5d4e4" strokeWidth="1" />
              ))}
              <rect x={0} y={118} width={400} height={64} fill="#d4dce6" />
              <rect x={168} y={0} width={64} height={300} fill="#d4dce6" />
              <rect x={0} y={0} width={400} height={300} fill="none" stroke="#b0bec9" strokeWidth="2" />
            </svg>

            {/* Store markers with 두쫀쿠 illustration */}
            {STORES.map((store, index) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
                style={{ left: store.left, top: store.top }}
              >
                {/* Marker: 두쫀쿠 일러스트, 소진임박은 은은한 강조 */}
                <div className="relative flex items-center justify-center">
                  {store.sellingOutSoon && (
                    <span
                      className="absolute inset-0 rounded-full animate-pulse opacity-40"
                      style={{
                        background: 'radial-gradient(circle, rgba(98,183,109,0.35) 0%, transparent 70%)',
                        transform: 'scale(1.8)',
                      }}
                    />
                  )}
                  <div
                    className={`
                      relative w-10 h-10 rounded-full overflow-hidden flex items-center justify-center
                      shadow-sm
                      ${store.sellingOutSoon
                        ? 'ring-2 ring-[#62B76D]/60 ring-offset-1 ring-offset-white border border-[#62B76D]/40'
                        : 'border border-gray-300/80 bg-white'
                      }
                    `}
                    style={
                      store.sellingOutSoon
                        ? { boxShadow: '0 2px 8px rgba(98, 183, 109, 0.2)' }
                        : undefined
                    }
                  >
                    <img
                      src={DUJJONKU_IMAGE}
                      alt="두쫀쿠"
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                </div>
                {/* Store label + 소진임박: 한 줄로 정리, 세련된 톤 */}
                <div className="flex flex-col items-center gap-0.5">
                  <span
                    className={`
                      text-[11px] font-medium whitespace-nowrap
                      ${store.sellingOutSoon ? 'text-gray-800' : 'text-gray-600'}
                    `}
                  >
                    {store.name}
                  </span>
                  {store.sellingOutSoon && (
                    <span
                      className="text-[8px] font-medium tracking-tight text-red-600 bg-red-50/95 text-center px-1.5 py-0.5 rounded-full border border-red-200/60"
                    >
                      소진 임박
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-xs text-gray-500 text-center py-3 border-t border-gray-100">
            지도에서 두쫀쿠 판매 매장을 확인할 수 있습니다. 소진 임박 매장은 강조되어 노출됩니다.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-12 flex justify-center shrink-0"
        >
          <Button
            size="lg"
            className="min-h-12 px-8 text-lg bg-gray-900 hover:bg-gray-800 text-white rounded-xl flex items-center gap-2"
            onClick={() => {
              setStep('completion');
              router.push('/completion');
            }}
          >
            시뮬레이션 완료하기 <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
