// Server-Side Anti-Cheat & Payload Validation Engine for Kibo Climb
// Prevents local storage editing, botting, time manipulation, and invalid currency injections

export const antiCheatService = {
  /**
   * Validates a climb session payload for speed feasibility, Sparks bounds, and rating sanity.
   * @param {Object} payload - Session outcome payload
   * @returns {Object} { valid: boolean, reason: string|null }
   */
  validateSessionPayload(payload) {
    if (!payload || typeof payload !== 'object') {
      return { valid: false, reason: 'Payload must be an object' };
    }

    const {
      totalTimeSec = 0,
      totalQuestions = 12,
      correctCount = 0,
      sparksEarned = 0,
      ratingGain = 0
    } = payload;

    const numTime = Number(totalTimeSec);
    const numQuestions = Number(totalQuestions);
    const numCorrect = Number(correctCount);
    const numSparks = Number(sparksEarned);
    const numRatingGain = Number(ratingGain);

    // 1. Sanity check bounds
    if (numQuestions <= 0 || numCorrect < 0 || numCorrect > numQuestions) {
      return { valid: false, reason: 'Invalid question count or correct count bounds' };
    }

    // 2. Speed / Time Feasibility Check: Minimum 0.4s per problem required
    const avgTimePerProblem = numQuestions > 0 ? numTime / numQuestions : 0;
    if (avgTimePerProblem < 0.4 && numQuestions >= 5) {
      return {
        valid: false,
        reason: `Implausible solving speed: ${avgTimePerProblem.toFixed(2)}s per problem`
      };
    }

    // 3. Maximum Sparks Bounds Check (max ~35 Sparks per problem with 2x multiplier)
    const maxAllowableSparks = numQuestions * 35;
    if (numSparks > maxAllowableSparks) {
      return {
        valid: false,
        reason: `Sparks earned (${numSparks}) exceeds maximum allowable threshold (${maxAllowableSparks})`
      };
    }

    // 4. Rating Delta Bounds Check (single run gain capped at +60)
    if (Math.abs(numRatingGain) > 60) {
      return {
        valid: false,
        reason: `Rating gain (${numRatingGain}) exceeds max single-run rating delta limit (+60)`
      };
    }

    return { valid: true, reason: null };
  },

  /**
   * Validates currency balance modification requests.
   */
  validateSparksTransaction(currentBalance, requestedDeduction) {
    const cur = Number(currentBalance) || 0;
    const req = Number(requestedDeduction) || 0;

    if (req <= 0) {
      return { valid: false, reason: 'Transaction amount must be greater than zero' };
    }

    if (cur < req) {
      return { valid: false, reason: 'Insufficient Sparks balance for transaction' };
    }

    return { valid: true, reason: null };
  }
};
