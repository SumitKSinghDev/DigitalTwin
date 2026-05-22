import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api.js';
import { 
  BrainCircuit, 
  Sparkles, 
  Clock, 
  Moon, 
  Sun, 
  Gauge, 
  Target, 
  GraduationCap, 
  BookOpen, 
  Activity, 
  ArrowRight, 
  Check, 
  Flame 
} from 'lucide-react';

const Onboarding = () => {
  const { user, completeOnboarding } = useContext(AuthContext);
  const navigate = useNavigate();

  // Multi-step form state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // User input answers
  const [academicInterests, setAcademicInterests] = useState('');
  const [studyGoals, setStudyGoals] = useState('');
  const [preferredStudyTiming, setPreferredStudyTiming] = useState('Night');
  const [sleepTargets, setSleepTargets] = useState(8);
  const [productivityStyle, setProductivityStyle] = useState('Deep Focus Sprints');
  const [burnoutSensitivity, setBurnoutSensitivity] = useState('Medium');

  // Completed Archetype details returned by the API
  const [calculatedArchetype, setCalculatedArchetype] = useState(null);

  const totalSteps = 4;

  const handleNextStep = () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleOnboardingSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.put('/auth/onboarding', {
        studyGoals,
        preferredStudyTiming,
        sleepTargets,
        academicInterests,
        burnoutSensitivity,
        productivityStyle
      });
      
      // Store calculated archetype details to show final wow screen
      setCalculatedArchetype(res.data.twinPersonality);

      // Trigger context updates to match onboarding reactively
      if (res.data && completeOnboarding) {
        completeOnboarding(res.data);
      }

      setStep(4); // Move to the reveal step
    } catch (err) {
      console.error("Onboarding submission failed:", err);
    }
    setLoading(false);
  };

  const handleFinishOnboarding = () => {
    navigate('/', { replace: true });
  };

  // Step render content helper
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-2">
                <GraduationCap className="text-indigo-400 w-6 h-6" /> Academic Baseline
              </h2>
              <p className="text-zinc-400 text-sm">
                Help your Digital Twin configure its behavioral base to match your study focus area and immediate milestones.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-zinc-350 dark:text-zinc-305 font-bold text-xs uppercase tracking-wider mb-2">
                  Academic Focus & Interests
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    value={academicInterests}
                    onChange={(e) => setAcademicInterests(e.target.value)}
                    placeholder="e.g., Computer Science, Engineering, Pre-Med"
                    className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] dark:bg-zinc-950/80 border border-border dark:border-zinc-800/80 rounded-xl text-text-primary dark:text-white placeholder-zinc-400 dark:placeholder-zinc-650 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold text-xs uppercase tracking-wider mb-2">
                  Your Primary Study Goal
                </label>
                <div className="relative">
                  <Target className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    value={studyGoals}
                    onChange={(e) => setStudyGoals(e.target.value)}
                    placeholder="e.g., Master DSA & Leetcode, prep for coding sprints"
                    className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] dark:bg-zinc-950/80 border border-border dark:border-zinc-800/80 rounded-xl text-text-primary dark:text-white placeholder-zinc-400 dark:placeholder-zinc-650 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-2">
                <Clock className="text-indigo-400 w-6 h-6" /> Circadian Rhythm
              </h2>
              <p className="text-zinc-400 text-sm">
                Your brain's peak focus window shifts naturally. Select your actual peak mental hours.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-zinc-300 font-bold text-xs uppercase tracking-wider mb-3">
                  Preferred Study Slot
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPreferredStudyTiming('Morning')}
                    className={`flex flex-col items-center justify-center p-4 border rounded-2xl transition-all gap-2 ${
                      preferredStudyTiming === 'Morning'
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500/50 text-indigo-600 dark:text-white shadow-lg shadow-indigo-500/5'
                        : 'bg-background dark:bg-zinc-950/60 border-border dark:border-zinc-800 text-text-secondary dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-bg-secondary dark:hover:bg-zinc-950'
                    }`}
                  >
                    <Sun className={`w-8 h-8 ${preferredStudyTiming === 'Morning' ? 'text-amber-500' : 'text-zinc-500'}`} />
                    <span className="font-bold text-sm">Early Bird Focus</span>
                    <span className="text-xxs text-zinc-500 font-semibold">5:00 AM – 1:00 PM</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreferredStudyTiming('Night')}
                    className={`flex flex-col items-center justify-center p-4 border rounded-2xl transition-all gap-2 ${
                      preferredStudyTiming === 'Night'
                        ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-500/50 text-purple-600 dark:text-white shadow-lg shadow-purple-500/5'
                        : 'bg-background dark:bg-zinc-950/60 border-border dark:border-zinc-800 text-text-secondary dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-bg-secondary dark:hover:bg-zinc-950'
                    }`}
                  >
                    <Moon className={`w-8 h-8 ${preferredStudyTiming === 'Night' ? 'text-violet-500 dark:text-violet-400' : 'text-zinc-500'}`} />
                    <span className="font-bold text-sm">Night Owl Focus</span>
                    <span className="text-xxs text-zinc-500 font-semibold">7:00 PM – 3:00 AM</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-zinc-300 font-bold text-xs uppercase tracking-wider">
                    Sleep Duration Target
                  </label>
                  <span className="text-sm font-black text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                    {sleepTargets} Hours
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="10"
                  step="0.5"
                  value={sleepTargets}
                  onChange={(e) => setSleepTargets(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-xxs text-zinc-500 dark:text-zinc-600 font-bold mt-1 px-1">
                  <span>5h (Minimal recovery)</span>
                  <span>8h (Recommended)</span>
                  <span>10h (High rest)</span>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-2">
                <Gauge className="text-indigo-400 w-6 h-6" /> Cognitive Profile
              </h2>
              <p className="text-zinc-400 text-sm">
                Define your productivity workflow style and fatigue limits so the AI behavioral engine can compute recommendations accurately.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-zinc-300 font-bold text-xs uppercase tracking-wider mb-2">
                  Study Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Deep Focus Sprints',
                    'Consistent Pomodoro Blocks',
                    'Highly Analytical Learning',
                    'Adaptive Consistency Mode'
                  ].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setProductivityStyle(style)}
                      className={`p-3 text-left border rounded-xl transition-all flex flex-col justify-between h-20 ${
                        productivityStyle === style
                          ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500/50 text-indigo-600 dark:text-white font-bold'
                          : 'bg-background dark:bg-zinc-950/60 border-border dark:border-zinc-800 text-text-secondary dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-bg-secondary dark:hover:bg-zinc-950'
                      }`}
                    >
                      <span className="font-bold text-xs">{style}</span>
                      <span className="text-xxs text-zinc-500">
                        {style === 'Deep Focus Sprints' && 'Intense, long focus slots'}
                        {style === 'Consistent Pomodoro Blocks' && 'Structured intervals'}
                        {style === 'Highly Analytical Learning' && 'Data & logic heavy reviews'}
                        {style === 'Adaptive Consistency Mode' && 'Flexible daily targets'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-350 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider mb-2">
                  Burnout Sensitivity Index
                </label>
                <div className="flex bg-background dark:bg-zinc-950/80 p-1 border border-border dark:border-zinc-800 rounded-xl">
                  {['Low', 'Medium', 'High'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setBurnoutSensitivity(level)}
                      className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 ${
                        burnoutSensitivity === level
                          ? level === 'High'
                            ? 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
                            : level === 'Medium'
                            ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-605 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'text-zinc-500 hover:text-zinc-305'
                      }`}
                    >
                      {level === 'High' && <Flame className="w-3.5 h-3.5" />}
                      {level} Sensitivity
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="reveal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6 text-center py-4"
          >
            <div className="flex justify-center mb-2">
              <div className="w-24 h-24 rounded-full bg-indigo-500/10 border-2 border-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 relative">
                <BrainCircuit className="w-12 h-12 text-indigo-400 animate-pulse" />
                <motion.div 
                  className="absolute -inset-1 rounded-full border border-indigo-500/40 animate-ping"
                  style={{ animationDuration: '3s' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xxs font-black tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                AI Alignment Synced
              </span>
              <h2 className="text-3xl font-black text-white">Your Twin is Alive!</h2>
              <p className="text-zinc-400 text-sm max-w-sm mx-auto">
                The behavioral intelligence core has generated your learning profile and calibrated your Digital Twin.
              </p>
            </div>

            {calculatedArchetype && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card dark:bg-zinc-955/80 border border-border dark:border-zinc-800 p-6 rounded-2xl max-w-sm mx-auto text-left space-y-4 shadow-xl"
              >
                <div className="space-y-1">
                  <span className="text-xxs text-zinc-500 uppercase font-bold tracking-widest">Calculated Archetype</span>
                  <h3 className="text-lg font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> {calculatedArchetype.archetype}
                  </h3>
                </div>

                <div className="space-y-2">
                  <span className="text-xxs text-zinc-500 uppercase font-bold tracking-widest">Cognitive Strengths</span>
                  <div className="space-y-1">
                    {calculatedArchetype.strengths.map((str, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xxs text-zinc-500 uppercase font-bold tracking-widest">System Vulnerabilities</span>
                  <div className="space-y-1">
                    {calculatedArchetype.weaknesses.map((weak, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 font-medium">
                        <span className="text-red-500 mt-0.5 font-bold">!</span>
                        <span className="text-zinc-450 dark:text-zinc-400">{weak}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-screen relative flex items-center justify-center bg-background px-4 py-8 overflow-hidden">
      {/* Decorative Glow Canvas */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl relative">
        {/* Onboarding Wizard Card */}
        <div className="bg-card dark:bg-zinc-900/60 backdrop-blur-xl border border-border dark:border-zinc-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Header Progress indicators */}
          {step < 4 && (
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                <span className="text-sm font-black text-text-primary dark:text-white">Digital Twin Setup</span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      step >= s ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-200 dark:bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Form screen container */}
          <div className="min-h-[280px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 border-t border-border dark:border-zinc-800/40 pt-6">
              {step < 4 ? (
                <>
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={step === 1}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                      step === 1 
                        ? 'opacity-0 pointer-events-none' 
                        : 'text-text-secondary dark:text-zinc-400 hover:text-text-primary dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    Back
                  </button>

                  {step === 3 ? (
                    <button
                      type="button"
                      onClick={handleOnboardingSubmit}
                      disabled={loading || !academicInterests || !studyGoals}
                      className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 hover:shadow-lg hover:shadow-indigo-500/20 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
                    >
                      {loading ? (
                        <>Calibrating Core...</>
                      ) : (
                        <>
                          Sync Twin <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishOnboarding}
                  className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  Enter Operating System <Activity className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
