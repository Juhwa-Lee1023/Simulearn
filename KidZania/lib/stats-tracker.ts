type ApiEndpoint = 'feedback' | 'dev-inquiry' | 'claude';

interface Stats {
  totalRequests: number;
  todayRequests: number;
  feedbackRequests: number;
  devInquiryRequests: number;
  claudeRequests: number;
  todayDate: string;
  activeSessions: number;
  completedSessions: number;
}

const defaultStats: Stats = {
  totalRequests: 0,
  todayRequests: 0,
  feedbackRequests: 0,
  devInquiryRequests: 0,
  claudeRequests: 0,
  todayDate: new Date().toISOString().split('T')[0],
  activeSessions: 0,
  completedSessions: 0,
};

let stats: Stats = { ...defaultStats };

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function resetTodayIfNeeded(): void {
  const today = getTodayDate();
  if (stats.todayDate !== today) {
    stats.todayRequests = 0;
    stats.todayDate = today;
  }
}

export function trackApiRequest(endpoint: ApiEndpoint): void {
  resetTodayIfNeeded();
  
  stats.totalRequests++;
  stats.todayRequests++;
  
  switch (endpoint) {
    case 'feedback':
      stats.feedbackRequests++;
      break;
    case 'dev-inquiry':
      stats.devInquiryRequests++;
      break;
    case 'claude':
      stats.claudeRequests++;
      break;
  }
}

export function trackSessionStart(): void {
  stats.activeSessions++;
}

export function trackSessionComplete(): void {
  stats.activeSessions = Math.max(0, stats.activeSessions - 1);
  stats.completedSessions++;
}

export function getStats(): {
  api: {
    totalRequests: number;
    todayRequests: number;
    feedbackRequests: number;
    devInquiryRequests: number;
    claudeRequests: number;
    lastUpdated: string;
  };
  sessions: {
    activeSessions: number;
    completedSessions: number;
    averageCompletionRate: number;
  };
} {
  resetTodayIfNeeded();
  
  const total = stats.activeSessions + stats.completedSessions;
  const averageCompletionRate = total > 0 ? stats.completedSessions / total : 0;
  
  return {
    api: {
      totalRequests: stats.totalRequests,
      todayRequests: stats.todayRequests,
      feedbackRequests: stats.feedbackRequests,
      devInquiryRequests: stats.devInquiryRequests,
      claudeRequests: stats.claudeRequests,
      lastUpdated: new Date().toISOString(),
    },
    sessions: {
      activeSessions: stats.activeSessions,
      completedSessions: stats.completedSessions,
      averageCompletionRate,
    },
  };
}

export function resetStats(): void {
  stats = { ...defaultStats, todayDate: getTodayDate() };
}
