import React, { useEffect } from 'react';
import './studyStyles.css';

// This React wrapper mounts the DOM-based StudyInterface implementation
// defined in studyInterface.js. It ensures styles are loaded and the
// interface is initialized when this component is rendered by React.

type Props = { onClose?: () => void };

const StudyInterface: React.FC<Props> = () => {
  useEffect(() => {
    let cleanup = () => {};

    (async () => {
      try {
        // Importing the JS module will auto-initialize the DOM interface
        // (it calls new StudyInterface() on load). We only need to ensure
        // styles are present and provide cleanup on unmount.
        await import('./studyInterface.js');

        cleanup = () => {
          const el = document.getElementById('study-interface');
          if (el && el.parentElement) {
            el.parentElement.removeChild(el);
          }
        };
      } catch (e) {
        console.error('Failed to initialize Study Interface:', e);
      }
    })();

    return () => {
      try { cleanup(); } catch {}
    };
  }, []);

  return (
    <div style={{ display: 'contents' }} />
  );
};

export default StudyInterface;

import React, { useState, useEffect } from 'react';
import { StudyProfile, StudyPlan } from './types';
import { generateStudyPlan } from './adaptiveEngine';
import { getUserProfile, saveStudyPlan } from './studyStorage';

interface StudyInterfaceProps {
  onClose: () => void;
}

export const StudyInterface: React.FC<StudyInterfaceProps> = ({ onClose }) => {
  const [profile, setProfile] = useState<StudyProfile | null>(null);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userProfile = await getUserProfile();
        setProfile(userProfile);
        const newPlan = generateStudyPlan(userProfile, userProfile.preferences);
        await saveStudyPlan(newPlan);
        setPlan(newPlan);
      } catch (error) {
        console.error("Failed to load study data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-white">Loading study plan...</div>;
  }

  if (!profile || !plan) {
    return <div className="p-4 text-center text-white">Could not load study plan.</div>;
  }

  return (
    <div className="study-plan-container p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Your Adaptive Study Plan</h2>
        <button onClick={onClose} className="text-white">X</button>
      </div>
      <div className="stats-grid">
        <div className="stats-card">
          <div className="text-sm text-gray-400">Daily Streak</div>
          <div className="text-2xl font-bold text-white">{profile.stats.streak} 🔥</div>
        </div>
        <div className="stats-card">
          <div className="text-sm text-gray-400">Problems Solved</div>
          <div className="text-2xl font-bold text-white">{profile.stats.problemsSolved}</div>
        </div>
      </div>
      <div className="study-section">
        <h3 className="study-section-title">Today's Focus ({plan.totalPlanned} mins)</h3>
        {plan.blocks.map(block => (
          <div key={block.id} className="study-block">
            <div>
              <div className="font-bold">{block.skill}</div>
              <div className="text-sm text-gray-400">{block.type.replace('_', ' ')}</div>
            </div>
            <div className="text-lg">{block.duration} min</div>
          </div>
        ))}
      </div>
      <div className="study-section">
        <h3 className="study-section-title">Skill Proficiency</h3>
        {Object.entries(profile.skillScores).map(([skill, score]) => (
          <div key={skill} className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white">{skill}</span>
              <span className="text-gray-400">{score}/500</span>
            </div>
            <div className="skill-progress">
              <div className="skill-progress-bar" style={{ width: `${(score / 500) * 100}%` }}></div>
            </div>
          </div>
        ))}
      </div>
      <div className="study-section">
        <h3 className="study-section-title">Achievements</h3>
        <div className="grid grid-cols-4 gap-4">
          {profile.achievements.map(ach => (
            <div key={ach.id} className="achievement-card text-center p-2 rounded-lg bg-gray-700">
              <div className="text-2xl">{ach.icon}</div>
              <div className="text-xs mt-1">{ach.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
