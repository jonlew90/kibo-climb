// Math Shortcuts & Trail Tricks Database for Kibo Math

export const MATH_TRICKS = {
  mult_9: {
    id: 'mult_9',
    title: 'The 10-Finger Magic for 9s!',
    icon: '🖐️',
    badge: '9s Shortcut',
    summary: "Put down the finger you're multiplying by. Left = Tens, Right = Ones!",
    example: '9 × 4: Put down 4th finger. 3 fingers left (30) + 6 right (6) = 36!'
  },
  mult_5: {
    id: 'mult_5',
    title: 'The Clock Trick for 5s!',
    icon: '⏰',
    badge: '5s Shortcut',
    summary: 'Multiplying by 5 is always half of multiplying by 10!',
    example: '5 × 8: First do 10 × 8 = 80, then cut in half to get 40!'
  },
  add_9: {
    id: 'add_9',
    title: 'Plus 9 Hop!',
    icon: '🦘',
    badge: 'Addition Tip',
    summary: 'Add 10 first, then step back 1!',
    example: '9 + 7: Jump to 10 + 7 = 17, then step back 1 to 16!'
  },
  mult_4: {
    id: 'mult_4',
    title: 'Double-Double Trick!',
    icon: '⚡',
    badge: '4s Shortcut',
    summary: 'Double the number, then double it again!',
    example: '4 × 7: Double 7 is 14. Double 14 is 28!'
  },
  mult_11: {
    id: 'mult_11',
    title: 'The Twin Mirror for 11s!',
    icon: '🪞',
    badge: '11s Shortcut',
    summary: 'For single digits 1 to 9, write the digit twice!',
    example: '11 × 6: Write 6 twice to get 66!'
  },
  lcm_trick: {
    id: 'lcm_trick',
    title: 'Summit Sync (LCM)!',
    icon: '🏔️',
    badge: 'LCM Shortcut',
    summary: 'Skip-count the LARGER number until the smaller number divides into it!',
    example: 'LCM(4, 6): Count 6, 12... 12 divides by 4! LCM is 12.'
  },
  gcf_trick: {
    id: 'gcf_trick',
    title: 'Difference Trick (GCF)!',
    icon: '📐',
    badge: 'GCF Shortcut',
    summary: 'Subtract the two numbers! The difference (or one of its factors) is the GCF!',
    example: 'GCF(12, 18): 18 - 12 = 6. Since 6 divides both 12 and 18, GCF is 6!'
  },
  divisibility_3: {
    id: 'divisibility_3',
    title: 'Digit Sum Rule for 3s!',
    icon: '✨',
    badge: 'Divisibility Rule',
    summary: 'Add all the digits together! If the sum divides by 3, the whole number does too!',
    example: '144: 1 + 4 + 4 = 9. Since 9 is divisible by 3, 144 is divisible by 3!'
  },
  squares: {
    id: 'squares',
    title: 'Perfect Square Twins!',
    icon: '🟩',
    badge: 'Squares Tip',
    summary: 'When multiplying a number by itself, think of a square grid!',
    example: '6 × 6 = 36 • 7 × 7 = 49 • 8 × 8 = 64!'
  }
};

/**
 * Returns a relevant trick based on an equation string
 */
export function getTrickForProblem(problemStr) {
  if (!problemStr) return MATH_TRICKS.mult_9;

  const str = String(problemStr).toLowerCase();

  if (str.includes('lcm')) {
    return MATH_TRICKS.lcm_trick;
  }
  if (str.includes('gcf')) {
    return MATH_TRICKS.gcf_trick;
  }
  if (str.includes('divisible') || str.includes('÷ 3')) {
    return MATH_TRICKS.divisibility_3;
  }
  if (str.includes('9 x') || str.includes('x 9') || str.includes('9 ×') || str.includes('× 9')) {
    return MATH_TRICKS.mult_9;
  }
  if (str.includes('5 x') || str.includes('x 5') || str.includes('5 ×') || str.includes('× 5')) {
    return MATH_TRICKS.mult_5;
  }
  if (str.includes('4 x') || str.includes('x 4') || str.includes('4 ×') || str.includes('× 4')) {
    return MATH_TRICKS.mult_4;
  }
  if (str.includes('11 x') || str.includes('x 11') || str.includes('11 ×') || str.includes('× 11')) {
    return MATH_TRICKS.mult_11;
  }
  if (str.includes('+ 9') || str.includes('9 +')) {
    return MATH_TRICKS.add_9;
  }

  return MATH_TRICKS.mult_9;
}

/**
 * Returns a recommended trick based on Tier level (1-8)
 */
export function getTrickForTier(tierId) {
  const t = Number(tierId);
  if (t === 1) return MATH_TRICKS.add_9;
  if (t === 2) return MATH_TRICKS.mult_4;
  if (t === 3) return MATH_TRICKS.mult_5;
  if (t === 4) return MATH_TRICKS.mult_9;
  if (t === 5) return MATH_TRICKS.divisibility_3;
  if (t === 6) return MATH_TRICKS.mult_11;
  if (t === 7) return MATH_TRICKS.lcm_trick;
  if (t === 8) return MATH_TRICKS.gcf_trick;
  return MATH_TRICKS.mult_9;
}
