// Latency classification engine based on answer digit length and response time in ms

export function classifyLatency(answerString, latencyMs) {
  const isTwoDigit = answerString.length >= 2;

  if (!isTwoDigit) {
    // 1-Digit Answer Thresholds
    if (latencyMs < 1500) {
      return { category: 'super_fast', label: 'Super Fast', icon: '⚡', color: 'text-amber-500' };
    } else if (latencyMs <= 4000) {
      return { category: 'fluent', label: 'Fluent', icon: '🟡', color: 'text-yellow-600' };
    } else {
      return { category: 'practice', label: 'Needs Practice', icon: '🔵', color: 'text-blue-500' };
    }
  } else {
    // 2-Digit Answer Thresholds
    if (latencyMs < 2200) {
      return { category: 'super_fast', label: 'Super Fast', icon: '⚡', color: 'text-amber-500' };
    } else if (latencyMs <= 4500) {
      return { category: 'fluent', label: 'Fluent', icon: '🟡', color: 'text-yellow-600' };
    } else {
      return { category: 'practice', label: 'Needs Practice', icon: '🔵', color: 'text-blue-500' };
    }
  }
}
