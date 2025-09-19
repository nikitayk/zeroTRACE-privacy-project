import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdaptiveLearning } from '../hooks/useAdaptiveLearning';
import { Domain, DomainProgress } from '../types/adaptiveLearning';

// Icons for each domain
const DomainIcons = {
  dsa_programming: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
  upsc_preparation: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  ),
  jee_preparation: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
    </svg>
  ),
  developer_skills: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
    </svg>
  )
};

// Domain colors and gradients
const DomainStyles = {
  dsa_programming: {
    gradient: 'from-blue-500 to-purple-600',
    bg: 'bg-gradient-to-br from-blue-500 to-purple-600',
    hover: 'hover:from-blue-600 hover:to-purple-700',
    shadow: 'shadow-blue-500/25',
    border: 'border-blue-500/20'
  },
  upsc_preparation: {
    gradient: 'from-green-500 to-teal-600',
    bg: 'bg-gradient-to-br from-green-500 to-teal-600',
    hover: 'hover:from-green-600 hover:to-teal-700',
    shadow: 'shadow-green-500/25',
    border: 'border-green-500/20'
  },
  jee_preparation: {
    gradient: 'from-orange-500 to-red-600',
    bg: 'bg-gradient-to-br from-orange-500 to-red-600',
    hover: 'hover:from-orange-600 hover:to-red-700',
    shadow: 'shadow-orange-500/25',
    border: 'border-orange-500/20'
  },
  developer_skills: {
    gradient: 'from-indigo-500 to-pink-600',
    bg: 'bg-gradient-to-br from-indigo-500 to-pink-600',
    hover: 'hover:from-indigo-600 hover:to-pink-700',
    shadow: 'shadow-indigo-500/25',
    border: 'border-indigo-500/20'
  }
};

interface DomainSelectorProps {
  onDomainSelect?: (domainId: string) => void;
  onBack?: () => void;
}

const DomainSelector: React.FC<DomainSelectorProps> = ({ onDomainSelect, onBack }) => {
  const { learningInterface, isInitialized, isLoading, error } = useAdaptiveLearning();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [isLoadingDomains, setIsLoadingDomains] = useState(true);

  useEffect(() => {
    const loadDomains = async () => {
      if (learningInterface && isInitialized) {
        try {
          const availableDomains = await learningInterface.getAvailableDomains();
          // Map the learning interface domain data to match our Domain interface
          const domainsWithIcons = availableDomains.map(domain => ({
            id: domain.id,
            name: domain.name,
            description: domain.description,
            icon: domain.id, // Use domain id as icon identifier
            userProgress: {
              completedTopics: domain.userProgress.topicsMastered,
              totalTopics: domain.userProgress.totalTopics,
              averageAccuracy: domain.userProgress.averageAccuracy,
              studyStreak: domain.userProgress.studyStreak,
              lastStudied: domain.userProgress.lastStudied || null
            }
          }));
          setDomains(domainsWithIcons);
        } catch (error) {
          console.error('Failed to load domains:', error);
          // Fallback to default domains
          setDomains(getDefaultDomains());
        } finally {
          setIsLoadingDomains(false);
        }
      } else {
        // Use default domains if learning interface is not ready
        setDomains(getDefaultDomains());
        setIsLoadingDomains(false);
      }
    };

    loadDomains();
  }, [learningInterface, isInitialized]);

  const getDefaultDomains = (): Domain[] => [
    {
      id: 'dsa_programming',
      name: 'Data Structures & Algorithms',
      description: 'Master coding interviews and competitive programming with advanced DSA concepts',
      icon: 'dsa_programming',
      userProgress: {
        completedTopics: 0,
        totalTopics: 10,
        averageAccuracy: 0.0,
        studyStreak: 0,
        lastStudied: null
      }
    },
    {
      id: 'upsc_preparation',
      name: 'UPSC Civil Services',
      description: 'Comprehensive preparation for UPSC examinations with current affairs and GK',
      icon: 'upsc_preparation',
      userProgress: {
        completedTopics: 0,
        totalTopics: 12,
        averageAccuracy: 0.0,
        studyStreak: 0,
        lastStudied: null
      }
    },
    {
      id: 'jee_preparation',
      name: 'JEE (Joint Entrance Examination)',
      description: 'Engineering entrance exam preparation with Physics, Chemistry, and Mathematics',
      icon: 'jee_preparation',
      userProgress: {
        completedTopics: 0,
        totalTopics: 15,
        averageAccuracy: 0.0,
        studyStreak: 0,
        lastStudied: null
      }
    },
    {
      id: 'developer_skills',
      name: 'Software Development',
      description: 'Modern software development skills including frontend, backend, and DevOps',
      icon: 'developer_skills',
      userProgress: {
        completedTopics: 0,
        totalTopics: 8,
        averageAccuracy: 0.0,
        studyStreak: 0,
        lastStudied: null
      }
    }
  ];

  const handleDomainClick = async (domainId: string) => {
    setSelectedDomain(domainId);
    
    // Add a small delay for animation
    setTimeout(() => {
      if (onDomainSelect) {
        onDomainSelect(domainId);
      }
    }, 300);
  };

  const getProgressPercentage = (progress: DomainProgress) => {
    return progress.totalTopics > 0 ? (progress.completedTopics / progress.totalTopics) * 100 : 0;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    if (percentage >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return 'text-yellow-400';
    if (streak >= 3) return 'text-orange-400';
    return 'text-gray-400';
  };

  if (isLoading || isLoadingDomains) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg font-medium">Loading learning domains...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-6"
        >
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Something went wrong</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8 overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          What do you want to learn?
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Choose your learning path and start your personalized adaptive learning journey
        </p>
      </motion.div>

      {/* Domain Cards Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
          <AnimatePresence>
            {domains.map((domain, index) => {
              const progressPercentage = getProgressPercentage(domain.userProgress);
              const progressColor = getProgressColor(progressPercentage);
              const streakColor = getStreakColor(domain.userProgress.studyStreak);
              const domainStyle = DomainStyles[domain.icon as keyof typeof DomainStyles];

              return (
                <motion.div
                  key={domain.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative group cursor-pointer rounded-2xl overflow-hidden ${domainStyle.bg} ${domainStyle.hover} transition-all duration-300 ${domainStyle.shadow} hover:shadow-2xl`}
                  onClick={() => handleDomainClick(domain.id)}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
                  </div>

                  {/* Card Content */}
                  <div className="relative p-6 md:p-8 text-white">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm ${domainStyle.border}`}>
                        {DomainIcons[domain.icon as keyof typeof DomainIcons]}
                      </div>
                      {domain.userProgress.studyStreak > 0 && (
                        <div className={`flex items-center space-x-1 text-sm font-medium ${streakColor}`}>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span>{domain.userProgress.studyStreak} day streak</span>
                        </div>
                      )}
                    </div>

                    {/* Title and Description */}
                    <h3 className="text-xl md:text-2xl font-bold mb-2">{domain.name}</h3>
                    <p className="text-white/80 text-sm md:text-base mb-6 leading-relaxed">
                      {domain.description}
                    </p>

                    {/* Progress Section */}
                    <div className="space-y-3">
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-white/90">Progress</span>
                          <span className={`font-semibold ${progressColor}`}>
                            {Math.round(progressPercentage)}%
                          </span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className={`h-full ${domainStyle.gradient} rounded-full`}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-white/70">
                            {domain.userProgress.completedTopics}/{domain.userProgress.totalTopics} topics
                          </span>
                          {domain.userProgress.averageAccuracy > 0 && (
                            <span className="text-white/70">
                              {Math.round(domain.userProgress.averageAccuracy * 100)}% accuracy
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          <span className="text-white/60">Start</span>
                        </div>
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center"
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                        <p className="text-white font-medium">Begin Learning</p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        {onBack && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <button
              onClick={onBack}
              className="inline-flex items-center space-x-2 px-6 py-3 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              <span>Go Back</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Loading Overlay for Selection */}
      <AnimatePresence>
        {selectedDomain && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4"
            >
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Preparing your learning session...</h3>
              <p className="text-gray-600">Setting up personalized content for you</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DomainSelector;
