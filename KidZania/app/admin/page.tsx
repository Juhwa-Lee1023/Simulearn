'use client';

import { useState, useEffect } from 'react';

interface ApiStats {
  totalRequests: number;
  todayRequests: number;
  feedbackRequests: number;
  devInquiryRequests: number;
  claudeRequests: number;
  lastUpdated: string;
}

interface SessionStats {
  activeSessions: number;
  completedSessions: number;
  averageCompletionRate: number;
}

export default function AdminPage() {
  const [apiStats, setApiStats] = useState<ApiStats | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setApiStats(data.api);
        setSessionStats(data.sessions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Simulearn Admin</h1>
          <p className="text-gray-600 mt-1">API 사용 현황 및 세션 통계</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="오늘 API 요청"
            value={apiStats?.todayRequests ?? 0}
            subtitle="Total requests today"
            color="blue"
          />
          <StatCard
            title="전체 API 요청"
            value={apiStats?.totalRequests ?? 0}
            subtitle="All time requests"
            color="green"
          />
          <StatCard
            title="활성 세션"
            value={sessionStats?.activeSessions ?? 0}
            subtitle="Currently active"
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">API 요청 상세</h2>
            <div className="space-y-4">
              <StatRow
                label="Feedback API"
                value={apiStats?.feedbackRequests ?? 0}
                total={apiStats?.totalRequests ?? 1}
              />
              <StatRow
                label="Dev Inquiry API"
                value={apiStats?.devInquiryRequests ?? 0}
                total={apiStats?.totalRequests ?? 1}
              />
              <StatRow
                label="Claude API"
                value={apiStats?.claudeRequests ?? 0}
                total={apiStats?.totalRequests ?? 1}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">세션 통계</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">완료된 세션</span>
                <span className="font-semibold">{sessionStats?.completedSessions ?? 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">평균 완료율</span>
                <span className="font-semibold">
                  {((sessionStats?.averageCompletionRate ?? 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">마지막 업데이트</span>
                <span className="text-sm text-gray-500">{apiStats?.lastUpdated ?? '-'}</span>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
          자동 새로고침: 30초마다
        </footer>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: number;
  subtitle: string;
  color: 'blue' | 'green' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <h3 className="text-sm font-medium opacity-80">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value.toLocaleString()}</p>
      <p className="text-xs opacity-60 mt-1">{subtitle}</p>
    </div>
  );
}

function StatRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold">{value.toLocaleString()}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
