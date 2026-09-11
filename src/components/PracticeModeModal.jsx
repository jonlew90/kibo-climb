import React, { useState, useEffect } from 'react';
import { X, Dumbbell, Sparkles, CheckCircle2, RotateCcw, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { soundFx } from '../utils/audio';

const PRACTICE_TOPICS = {
  math: [
    { id: 'math_add_sub', title: 'Addition & Subtraction', desc: 'Sums and differences up to 20 & 100' },
    { id: 'math_mult', title: 'Multiplication Tables', desc: '0s through 12s recall drills' },
    { id: 'math_div', title: 'Division Foundations', desc: 'Fact families and equal sharing' },
    { id: 'math_frac', title: 'Fractions & Decimals', desc: 'Halves, quarters, and decimal equivalents' }
  ],
  words: [
    { id: 'words_phonics', title: 'Phonics & Missing Letters', desc: 'Vowels, blends, and rhyming patterns' },
    { id: 'words_spelling', title: 'Spelling Sprint', desc: 'Common words and tricky letter patterns' },
    { id: 'words_vocab', title: 'Vocabulary Definitions', desc: 'Context clues and meaning match' }
  ],
  world: [
    { id: 'world_capitals', title: 'Capitals of the World', desc: 'Countries and capital cities' },
    { id: 'world_geography', title: 'Mountains & Continents', desc: 'Summits, landforms, and ocean basins' }
  ],
  coding: [
    { id: 'coding_logic', title: 'Sequencing & Algorithms', desc: 'Step-by-step logic commands' },
    { id: 'coding_loops', title: 'Loops & Conditionals', desc: 'Repeat blocks and boolean if/else' }
  ]
};

function generatePracticeQuestion(subject, topicId) {
  if (subject === 'math') {
    if (topicId === 'math_mult') {
      const a = Math.floor(Math.random() * 10) + 2;
      const b = Math.floor(Math.random() * 9) + 2;
      const correct = a * b;
      const options = [correct, correct + a, Math.max(1, correct - b), correct + 2].sort(() => Math.random() - 0.5);
      return {
        prompt: `What is ${a} × ${b}?`,
        options: Array.from(new Set(options)).slice(0, 4).map(String),
        correctAnswer: String(correct),
        explanation: `${a} groups of ${b} equals ${correct}.`
      };
    } else if (topicId === 'math_div') {
      const b = Math.floor(Math.random() * 8) + 2;
      const ans = Math.floor(Math.random() * 9) + 2;
      const a = b * ans;
      const options = [ans, ans + 1, Math.max(1, ans - 1), ans + 2].sort(() => Math.random() - 0.5);
      return {
        prompt: `What is ${a} ÷ ${b}?`,
        options: Array.from(new Set(options)).slice(0, 4).map(String),
        correctAnswer: String(ans),
        explanation: `${a} divided into ${b} equal parts is ${ans}.`
      };
    } else if (topicId === 'math_frac') {
      const pairs = [
        { q: 'What is 1/2 + 1/2?', ans: '1', opts: ['1', '1/4', '2/4', '2'] },
        { q: 'What is 1/4 + 1/4?', ans: '1/2', opts: ['1/2', '2/8', '1/4', '1'] },
        { q: 'Which is equal to 0.5?', ans: '1/2', opts: ['1/2', '1/4', '3/4', '1/5'] },
        { q: 'Which is equal to 0.25?', ans: '1/4', opts: ['1/4', '1/2', '2/5', '1/10'] }
      ];
      const selected = pairs[Math.floor(Math.random() * pairs.length)];
      return {
        prompt: selected.q,
        options: selected.opts.sort(() => Math.random() - 0.5),
        correctAnswer: selected.ans,
        explanation: `Correct! ${selected.q} = ${selected.ans}`
      };
    } else {
      const isSub = Math.random() > 0.5;
      const a = Math.floor(Math.random() * 15) + 5;
      const b = Math.floor(Math.random() * a) + 1;
      const ans = isSub ? a - b : a + b;
      const op = isSub ? '−' : '+';
      const options = [ans, ans + 2, Math.max(1, ans - 2), ans + 1].sort(() => Math.random() - 0.5);
      return {
        prompt: `What is ${a} ${op} ${b}?`,
        options: Array.from(new Set(options)).slice(0, 4).map(String),
        correctAnswer: String(ans),
        explanation: `${a} ${op} ${b} = ${ans}`
      };
    }
  } else if (subject === 'words') {
    const list = [
      { q: 'Which letter completes: C _ T ?', ans: 'A', opts: ['A', 'E', 'O', 'U'], exp: 'CAT makes a furry pet!' },
      { q: 'Which word rhymes with "SUN"?', ans: 'FUN', opts: ['FUN', 'SONG', 'SAND', 'SIT'], exp: 'Sun and Fun both end in -un.' },
      { q: 'Which is spelled correctly?', ans: 'FRIEND', opts: ['FRIEND', 'FREIND', 'FREND', 'FRIND'], exp: 'Remember: i before e in FRIEND!' },
      { q: 'What does "ENORMOUS" mean?', ans: 'Very Big', opts: ['Very Big', 'Tiny', 'Fast', 'Cold'], exp: 'Enormous means gigantic or very big.' }
    ];
    const picked = list[Math.floor(Math.random() * list.length)];
    return {
      prompt: picked.q,
      options: picked.opts.sort(() => Math.random() - 0.5),
      correctAnswer: picked.ans,
      explanation: picked.exp
    };
  } else if (subject === 'world') {
    const list = [
      { q: 'What is the capital of France?', ans: 'Paris', opts: ['Paris', 'Rome', 'Madrid', 'Berlin'], exp: 'Paris is the capital of France!' },
      { q: 'What is the tallest mountain in Africa?', ans: 'Mount Kilimanjaro', opts: ['Mount Kilimanjaro', 'Mount Everest', 'Mont Blanc', 'Mount Fuji'], exp: 'Mount Kilimanjaro (Kibo) is 5,895m!' },
      { q: 'What is the capital of Japan?', ans: 'Tokyo', opts: ['Tokyo', 'Kyoto', 'Seoul', 'Beijing'], exp: 'Tokyo is the capital of Japan!' },
      { q: 'Which continent has the most countries?', ans: 'Africa', opts: ['Africa', 'Asia', 'Europe', 'South America'], exp: 'Africa has 54 sovereign nations!' }
    ];
    const picked = list[Math.floor(Math.random() * list.length)];
    return {
      prompt: picked.q,
      options: picked.opts.sort(() => Math.random() - 0.5),
      correctAnswer: picked.ans,
      explanation: picked.exp
    };
  } else {
    // coding
    const list = [
      { q: 'If repeat(3) { moveForward() }, how many times does Kibo move?', ans: '3', opts: ['3', '1', '2', '4'], exp: 'The loop executes 3 times.' },
      { q: 'Which command checks if a path is clear?', ans: 'if (isPathClear())', opts: ['if (isPathClear())', 'loop()', 'stop()', 'print()'], exp: 'Conditionals start with "if"!' },
      { q: 'What is a bug in programming?', ans: 'An error in code', opts: ['An error in code', 'A computer virus', 'A fast program', 'A keyboard button'], exp: 'A bug is an unexpected mistake or glitch in logic.' }
    ];
    const picked = list[Math.floor(Math.random() * list.length)];
    return {
      prompt: picked.q,
      options: picked.opts.sort(() => Math.random() - 0.5),
      correctAnswer: picked.ans,
      explanation: picked.exp
    };
  }
}

export default function PracticeModeModal({
  isOpen,
  onClose,
  activeSubject = 'math',
  onAwardPracticeSparks
}) {
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0, sparksEarned: 0 });

  const topics = PRACTICE_TOPICS[activeSubject] || PRACTICE_TOPICS.math;

  useEffect(() => {
    if (isOpen) {
      // Pick first topic by default
      const initialTopic = topics[0]?.id || 'math_add_sub';
      setSelectedTopicId(initialTopic);
      setCurrentQuestion(generatePracticeQuestion(activeSubject, initialTopic));
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setSessionStats({ correct: 0, total: 0, sparksEarned: 0 });
    }
  }, [isOpen, activeSubject]);

  if (!isOpen) return null;

  const handleSelectTopic = (topicId) => {
    soundFx.playKeyTap();
    setSelectedTopicId(topicId);
    setCurrentQuestion(generatePracticeQuestion(activeSubject, topicId));
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
  };

  const handleAnswerClick = (option) => {
    if (isAnswerChecked) return;
    soundFx.playKeyTap();
    setSelectedAnswer(option);
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer || isAnswerChecked) return;
    const isCorrect = String(selectedAnswer).trim().toLowerCase() === String(currentQuestion.correctAnswer).trim().toLowerCase();
    setIsAnswerChecked(true);

    if (isCorrect) {
      soundFx.playCorrect();
      // Cap at 10 practice sparks per day
      const newSparks = sessionStats.sparksEarned < 10 ? 1 : 0;
      setSessionStats(prev => ({
        correct: prev.correct + 1,
        total: prev.total + 1,
        sparksEarned: prev.sparksEarned + newSparks
      }));
      if (newSparks > 0 && onAwardPracticeSparks) {
        onAwardPracticeSparks(newSparks);
      }
    } else {
      soundFx.playIncorrect();
      setSessionStats(prev => ({
        ...prev,
        total: prev.total + 1
      }));
    }
  };

  const handleNextQuestion = () => {
    soundFx.playKeyTap();
    setCurrentQuestion(generatePracticeQuestion(activeSubject, selectedTopicId));
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-pop cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-gradient-to-b from-slate-50 via-white to-sky-50 border-4 border-indigo-400 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-800 space-y-4 max-h-[92vh] overflow-y-auto cursor-default flex flex-col justify-between"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-700">
              <Dumbbell className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-none">
                Training Camp • {activeSubject.toUpperCase()}
              </h3>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Unlimited Untimed Practice • Streak-Safe
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center justify-between bg-indigo-50/80 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs font-black text-indigo-950 shrink-0">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Solved: {sessionStats.correct} / {sessionStats.total}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-700">
            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
            <span>+{sessionStats.sparksEarned} Sparks (Max 10)</span>
          </div>
        </div>

        {/* Topic Selector Chips */}
        <div className="space-y-1.5 shrink-0">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
            Choose Skill Focus:
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {topics.map(t => {
              const isSelected = t.id === selectedTopicId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTopic(t.id)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="text-xs font-black truncate">{t.title}</div>
                  <div className={`text-[10px] truncate ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {t.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Area */}
        {currentQuestion && (
          <div className="bg-white border-2 border-indigo-100 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 text-center my-1">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Practice Question
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {currentQuestion.prompt}
            </h2>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-2">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedAnswer === opt;
                let btnStyle = 'bg-slate-50 text-slate-800 border-slate-200 hover:border-indigo-400';

                if (isAnswerChecked) {
                  const isCorrect = String(opt).trim().toLowerCase() === String(currentQuestion.correctAnswer).trim().toLowerCase();
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-300';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-500 text-white border-rose-600';
                  } else {
                    btnStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-indigo-100 text-indigo-900 border-indigo-500 ring-2 ring-indigo-400/30';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswerChecked}
                    onClick={() => handleAnswerClick(opt)}
                    className={`p-3 rounded-xl border-2 font-black text-base transition-all active:scale-95 cursor-pointer flex items-center justify-center ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Feedback / Explanation */}
            {isAnswerChecked && (
              <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200 text-xs font-bold text-indigo-900 animate-pop">
                {currentQuestion.explanation}
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-2 shrink-0">
          {!isAnswerChecked ? (
            <button
              type="button"
              disabled={!selectedAnswer}
              onClick={handleCheckAnswer}
              className={`w-full py-3 px-4 rounded-xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                selectedAnswer
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Check Answer</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="w-full py-3 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Next Practice Problem</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
