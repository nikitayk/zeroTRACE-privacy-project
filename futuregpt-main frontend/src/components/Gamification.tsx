import React, { useEffect, useMemo, useState } from 'react';
import { Trophy, Flame, Award, Clock, Play, Pause, RotateCcw, Activity, CheckCircle2, Target, BarChart3 } from 'lucide-react';

type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
};

type ChallengeRun = {
  id: string;
  startedAt: number;
  endedAt: number;
  durationSec: number;
  stats: Record<string, number>;
};

const SESSION_KEY_PREFIX = 'zt_session_';
const LOCAL_KEY_PREFIX = 'zt_local_';

const readSession = <T,>(key: string, fallback: T): T => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeSession = (key: string, value: unknown) => {
  try {
    sessionStorage.setItem(SESSION_KEY_PREFIX + key, JSON.stringify(value));
  } catch {}
};

const readLocal = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeLocal = (key: string, value: unknown) => {
  try {
    localStorage.setItem(LOCAL_KEY_PREFIX + key, JSON.stringify(value));
  } catch {}
};

function getTodayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function Gamification() {
  // Activity counters (session-based)
  const [activity, setActivity] = useState<Record<string, number>>(() => readSession('activity', {}));

  // Streak tracking (local, daily)
  const [streak, setStreak] = useState<number>(() => readLocal('streak_count', 0));
  const [lastActiveDate, setLastActiveDate] = useState<string>(() => readLocal('last_active_date', ''));

  // Achievements (session-based)
  const [achievements, setAchievements] = useState<Achievement[]>(() => readSession('achievements', [
    { id: 'ten_answers', title: 'Conversationalist', description: '10 assistant answers in a session', unlocked: false },
    { id: 'five_dsa', title: 'Problem Crusher', description: 'Solve 5 DSA problems in a session', unlocked: false },
    { id: 'three_day_streak', title: 'Consistent', description: 'Maintain a 3-day streak', unlocked: false },
    { id: 'search_master', title: 'Search Master', description: 'Run 5 web searches in a session', unlocked: false },
  ]));

  // Challenge state (session-based)
  const [challengeActive, setChallengeActive] = useState<boolean>(() => readSession('challenge_active', false));
  const [challengeSeconds, setChallengeSeconds] = useState<number>(() => readSession('challenge_seconds', 300));
  const [remaining, setRemaining] = useState<number>(() => readSession('challenge_remaining', 300));
  const [runs, setRuns] = useState<ChallengeRun[]>(() => readSession('challenge_runs', []));

  // Handle activity events from the app (non-invasive)
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ type: string; payload?: any; ts: number }>;
      const { type } = ev.detail || { type: 'unknown' };
      setActivity(prev => {
        const next = { ...prev, [type]: (prev[type] || 0) + 1 };
        writeSession('activity', next);
        return next;
      });

      // Streak update upon any activity
      const today = getTodayKey();
      if (lastActiveDate !== today) {
        const isNextDay = !!lastActiveDate && new Date(today) > new Date(lastActiveDate);
        const missed = isNextDay && (new Date(today).getTime() - new Date(lastActiveDate).getTime() > 24 * 60 * 60 * 1000);
        const newStreak = missed ? 1 : (lastActiveDate ? streak + 1 : 1);
        setStreak(newStreak);
        setLastActiveDate(today);
        writeLocal('streak_count', newStreak);
        writeLocal('last_active_date', today);
      }

      // Check achievements
      setAchievements(prev => {
        const ans = (ev.detail?.type === 'assistant_response') ? (prev as any) : prev; // noop to trigger update after responses
        const updated = prev.map(a => {
          if (a.unlocked) return a;
          if (a.id === 'ten_answers' && (activity['assistant_response'] || 0) + (type === 'assistant_response' ? 1 : 0) >= 10) {
            return { ...a, unlocked: true, unlockedAt: Date.now() };
          }
          if (a.id === 'five_dsa' && (activity['dsa_solved'] || 0) + (type === 'dsa_solved' ? 1 : 0) >= 5) {
            return { ...a, unlocked: true, unlockedAt: Date.now() };
          }
          if (a.id === 'search_master' && (activity['web_search'] || 0) + (type === 'web_search' ? 1 : 0) >= 5) {
            return { ...a, unlocked: true, unlockedAt: Date.now() };
          }
          if (a.id === 'three_day_streak' && streak >= 3) {
            return { ...a, unlocked: true, unlockedAt: Date.now() };
          }
          return a;
        });
        writeSession('achievements', updated);
        return updated;
      });
    };
    window.addEventListener('zt-activity', handler as EventListener);
    return () => window.removeEventListener('zt-activity', handler as EventListener);
  }, [activity, lastActiveDate, streak]);

  // Challenge countdown
  useEffect(() => {
    writeSession('challenge_active', challengeActive);
    writeSession('challenge_seconds', challengeSeconds);
    writeSession('challenge_remaining', remaining);
  }, [challengeActive, challengeSeconds, remaining]);

  useEffect(() => {
    if (!challengeActive) return;
    if (remaining <= 0) {
      // end challenge
      setChallengeActive(false);
      const statsSnapshot = { ...activity };
      const run: ChallengeRun = {
        id: `${Date.now()}`,
        startedAt: Date.now() - challengeSeconds * 1000,
        endedAt: Date.now(),
        durationSec: challengeSeconds,
        stats: statsSnapshot,
      };
      setRuns(prev => {
        const list = [run, ...prev].slice(0, 10);
        writeSession('challenge_runs', list);
        return list;
      });
      return;
    }
    const id = setInterval(() => setRemaining(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [challengeActive, remaining, challengeSeconds, activity]);

  const startChallenge = () => {
    setRemaining(challengeSeconds);
    setChallengeActive(true);
  };
  const pauseChallenge = () => setChallengeActive(false);
  const resetChallenge = () => {
    setChallengeActive(false);
    setRemaining(challengeSeconds);
  };

  const totalAnswers = activity['assistant_response'] || 0;
  const totalMessages = (activity['message_sent'] || 0) + totalAnswers;
  const webSearches = activity['web_search'] || 0;
  const dsaSolved = activity['dsa_solved'] || 0;

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6 bg-[#0D0D0D]">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-[#9A4DFF]" />
        <h2 className="text-lg font-semibold text-white">Gamification</h2>
      </div>

      {/* Streaks */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-[#B3B3B3]">Current Streak</div>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#9A4DFF]" />
              {streak} day{streak === 1 ? '' : 's'}
            </div>
          </div>
          <div className="text-xs text-[#B3B3B3]">Last active: {lastActiveDate || '—'}</div>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg p-4">
          <div className="text-sm text-[#B3B3B3] mb-1">Session Activity</div>
          <div className="h-2 w-full rounded bg-[#0D0D0D] border border-[#2E2E2E] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6A0DAD] via-teal-400 to-[#9A4DFF]"
              style={{ width: `${Math.min(100, totalMessages * 5)}%` }}
            />
          </div>
          <div className="text-xs text-[#B3B3B3] mt-2">Messages this session: {totalMessages}</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-[#9A4DFF]" />
          <h3 className="text-sm font-semibold text-white">Achievements</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((a) => (
            <div key={a.id} className={`rounded-lg p-3 border ${a.unlocked ? 'border-[#9A4DFF] bg-[#2B0F45]' : 'border-[#2E2E2E] bg-[#0D0D0D]'}`}>
              <div className="flex items-center justify-between">
                <div className="text-white text-sm">{a.title}</div>
                {a.unlocked ? <CheckCircle2 className="w-4 h-4 text-[#9A4DFF]" /> : <Target className="w-4 h-4 text-[#B3B3B3]" />}
              </div>
              <div className="text-xs text-[#B3B3B3] mt-1">{a.description}</div>
              {a.unlocked && (
                <div className="text-[10px] text-[#B3B3B3] mt-1">Unlocked {new Date(a.unlockedAt!).toLocaleTimeString()}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Analytics */}
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-[#9A4DFF]" />
          <h3 className="text-sm font-semibold text-white">Progress Analytics</h3>
        </div>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="rounded-lg border border-[#2E2E2E] p-3">
            <div className="text-xs text-[#B3B3B3]">Answers</div>
            <div className="text-lg text-white font-semibold">{totalAnswers}</div>
          </div>
          <div className="rounded-lg border border-[#2E2E2E] p-3">
            <div className="text-xs text-[#B3B3B3]">Web Searches</div>
            <div className="text-lg text-white font-semibold">{webSearches}</div>
          </div>
          <div className="rounded-lg border border-[#2E2E2E] p-3">
            <div className="text-xs text-[#B3B3B3]">DSA Solved</div>
            <div className="text-lg text-white font-semibold">{dsaSolved}</div>
          </div>
          <div className="rounded-lg border border-[#2E2E2E] p-3">
            <div className="text-xs text-[#B3B3B3]">Messages</div>
            <div className="text-lg text-white font-semibold">{totalMessages}</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-[#B3B3B3]">
          {totalAnswers >= 5 ? 'You answered 5+ questions in a row. Keep going!' : 'Answer more to unlock insights.'}
        </div>
      </div>

      {/* Challenge Mode */}
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#9A4DFF]" />
            <h3 className="text-sm font-semibold text-white">Challenge Mode</h3>
          </div>
          <div className="text-xs text-[#B3B3B3]">Duration</div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="range"
            min={120}
            max={1800}
            step={60}
            value={challengeSeconds}
            onChange={(e) => setChallengeSeconds(parseInt(e.target.value, 10))}
            className="w-full"
          />
          <div className="text-xs text-[#B3B3B3] w-16 text-right">{Math.round(challengeSeconds / 60)}m</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold text-white tabular-nums">{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</div>
          <div className="flex items-center gap-2">
            {!challengeActive ? (
              <button onClick={startChallenge} className="px-3 py-1.5 rounded border border-[#9A4DFF] bg-[#2B0F45] text-white flex items-center gap-1">
                <Play className="w-4 h-4" /> Start
              </button>
            ) : (
              <button onClick={pauseChallenge} className="px-3 py-1.5 rounded border border-[#2E2E2E] bg-[#1A1A1A] text-white flex items-center gap-1">
                <Pause className="w-4 h-4" /> Pause
              </button>
            )}
            <button onClick={resetChallenge} className="px-3 py-1.5 rounded border border-[#2E2E2E] bg-[#1A1A1A] text-white flex items-center gap-1">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
        {runs.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-[#B3B3B3] mb-2">Recent Runs (session)</div>
            <div className="space-y-2">
              {runs.map(r => (
                <div key={r.id} className="rounded border border-[#2E2E2E] p-2 text-xs text-[#B3B3B3] flex items-center justify-between">
                  <div>
                    <div className="text-white">{Math.round(r.durationSec / 60)}m</div>
                    <div>{new Date(r.endedAt).toLocaleTimeString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>Ans: <span className="text-white">{r.stats['assistant_response'] || 0}</span></div>
                    <div>Search: <span className="text-white">{r.stats['web_search'] || 0}</span></div>
                    <div>DSA: <span className="text-white">{r.stats['dsa_solved'] || 0}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


