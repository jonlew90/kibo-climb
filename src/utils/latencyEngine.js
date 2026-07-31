export function classifyLatency(answerString, latencyMs, isCorrect = true) {
  const responseTimeSec = latencyMs > 1000 ? latencyMs / 1000 : latencyMs;

  if (!isCorrect) {
    return { category: 'practice', label: 'Needs Review', icon: '🔴', color: 'text-rose-500' };
  }

  if (responseTimeSec < 0.8) {
    return { category: 'outlier', label: 'Rapid Guess', icon: '⚡', color: 'text-slate-400' };
  } else if (responseTimeSec < 3.0) {
    return { category: 'fluent', label: 'High Fluency (<3s)', icon: '⚡', color: 'text-emerald-500' };
  } else {
    return { category: 'deliberate', label: 'Deliberate Solve', icon: '🧠', color: 'text-indigo-600' };
  }
}
