import React from 'react';
import { BookOpen, Clock, Target, ArrowRight, CheckCircle } from 'lucide-react';

const PRACTICE_TESTS = [
  {
    id: 'test_measurement_drill',
    title: 'Domain A: Measurement Mastery Drill',
    description: '10-question high-yield drill covering continuous measurement (rate, duration, latency, IRT) and discontinuous time sampling.',
    questionCount: 10,
    difficulty: 'Medium',
    estimatedMinutes: 15,
    domain: 'A: Measurement',
  },
  {
    id: 'test_assessment_drill',
    title: 'Domain B: Assessment & Data Collection',
    description: '10-question drill focusing on preference assessments (MSWO, MSW, Paired) and ABC narrative data collection.',
    questionCount: 10,
    difficulty: 'Medium',
    estimatedMinutes: 15,
    domain: 'B: Assessment',
  },
  {
    id: 'test_skill_acq_drill',
    title: 'Domain C: Skill Acquisition Protocols',
    description: '10-question drill on DTT prompting hierarchies, shaping, chaining, and token economy implementation.',
    questionCount: 10,
    difficulty: 'Hard',
    estimatedMinutes: 15,
    domain: 'C: Skill Acquisition',
  },
  {
    id: 'test_behavior_reduc_drill',
    title: 'Domain D: Behavior Reduction & DRI/DRA',
    description: '10-question drill covering functional extinction, differential reinforcement (DRA, DRI, DRO), and crisis emergency plans.',
    questionCount: 10,
    difficulty: 'Hard',
    estimatedMinutes: 15,
    domain: 'D: Behavior Reduction',
  },
  {
    id: 'test_ethics_drill',
    title: 'Domain F: Ethics 2.0 & Professional Conduct',
    description: '10-question scenario drill on gifts, dual relationships, social media, and mandatory reporting.',
    questionCount: 10,
    difficulty: 'Easy',
    estimatedMinutes: 12,
    domain: 'F: Professional Conduct',
  },
];

export default function PracticeTestsListIsland() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Targeted Domain Practice
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          RBT Topic Practice Tests
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl">
          Quick, focused domain drills with instant scoring and state preservation. Master each BACB task list area individually.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PRACTICE_TESTS.map((test) => (
          <div
            key={test.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-800 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200">
                  {test.domain}
                </span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{test.estimatedMinutes} Mins</span>
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {test.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {test.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-500" />
                <span>{test.questionCount} Questions</span>
              </div>

              <a
                href={`/practice-tests/${test.id}`}
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 hover:scale-[1.02] transition-all"
              >
                <span>Start Practice Test</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
