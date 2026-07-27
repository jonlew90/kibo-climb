// Latency & Accuracy classification engine for post-sprint categorization

export function classifyLatency(answerString, latencyMs, isCorrect = true) {
  if (!isCorrect) {
    return { category: 'practice', label: 'Focus Area', icon: '🔵', color: 'text-blue-500' };
  }

  const responseTimeSec = latencyMs > 1000 ? latencyMs / 1000 : latencyMs;

  if (responseTimeSec < 3.5) {
    return { category: 'super_fast', label: 'Instant Recall', icon: '⚡', color: 'text-amber-500' };
  } else {
    return { category: 'fluent', label: 'Worked Out', icon: '🟡', color: 'text-yellow-600' };
  }
}
