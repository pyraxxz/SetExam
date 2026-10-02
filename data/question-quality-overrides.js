(() => {
  'use strict';

  const overrides = {
    RWM1Q1: { prompt: "Which choice best summarizes the community garden's impact on nearby residents?" },
    RWM1Q9: { prompt: "What does the comparison between the two sensor trials suggest about the revised measurement procedure?" },
    RWM1Q20: { prompt: "According to the rainfall data, which month recorded the second-highest total?" },
    RW2E10: { prompt: "How do the authors differ in the factor they emphasize when evaluating the same hand tool?" },
    RW2E20: { prompt: "According to the table, which category has the highest reported value?" },
    RW2E22: { prompt: "What does the commuter survey indicate about the trade-off respondents made between travel time and route quietness?" },
    RWM2HQ16: { prompt: "Which interpretation of the feedback study is most consistent with the researchers' stated limitations?" },
    RWM2HQ20: { prompt: "Based on the resident-survey data, what percentage of residents were undecided?" },
    RWM2HQ21: { prompt: "Which choice best combines the two texts' views about the role of consistent methods in community science?" },
    RWM2HQ24: { prompt: "Which statement best explains when the tested material showed increased strength?" },
    RWM1Q16: { prompt: "Which choice best describes the relationship the researchers observed between root depth and above-ground growth?" },
    RWM1Q22: { prompt: "What does the larger effect among borrowers with previous late returns suggest about the reminder system?" },
    RWM1Q26: { prompt: "Which conclusion about the three lighting conditions is best supported by the study results?" },
    RW2E1: { prompt: "Which choice best captures the two main changes reported after the park renovation?" },
    RW2E16: { prompt: "What did the one-season trial indicate about the relative effectiveness of the two planting methods?" },
    RW2E17: { prompt: "Which choice most effectively synthesizes the lecture plans described in the notes?" },
    RW2E25: { prompt: "Which finding about light conditions is directly supported by the seedling experiment?" },
    RW2E9: { prompt: 'Which inference is best supported by the revised transit schedule?' },
    RWM2HQ2: { prompt: 'What does the comparison between the new and older irrigation schedules suggest?' },
    RWM2HQ9: { prompt: "Why do the authors caution against applying the first phase's conclusions too broadly?" },
    MM2EQ3: { options: ['3', '4.5', '6', '7'] },
    MM2EQ20: { options: ['5', '6', '7', '10'] },
    MM2EQ4: { options: ['1', '3', '5', '7'] },
    MM2HQ8: { options: ['2', '4', '7', '9'] },
    MM2HQ16: { options: ['1', '4', '5', '8'] },
    MM2HQ1: { difficulty: 'hard', prompt: 'The system 4x + 3y = 17 and 7x − 2y = 8 has a solution (x, y). What is the value of 2x − y?', options: ['−1', '3', '1', '5'], answer: 'C', explanation: 'Multiply the first equation by 2 and the second by 3: 8x + 6y = 34 and 21x − 6y = 24. Adding gives 29x = 58, so x = 2. Substituting into 4x + 3y = 17 gives y = 3. Therefore 2x − y = 1.' },
    MM2HQ2: { difficulty: 'hard', prompt: 'If |2x − 5| < 9, what is the greatest integer value of x?', options: ['4', '5', '6', '7'], answer: 'C', explanation: 'The absolute-value inequality gives −9 < 2x − 5 < 9. Adding 5 and dividing by 2 gives −2 < x < 7, so the greatest integer solution is 6.' },
    MM2HQ3: { difficulty: 'hard', prompt: 'For k > 4, the roots of x² − (k + 4)x + 4k = 0 differ by 6. What is the value of k?', options: ['8', '10', '12', '14'], answer: 'B', explanation: 'The quadratic factors as (x − 4)(x − k), so its roots are 4 and k. Because k > 4 and the roots differ by 6, k − 4 = 6 and k = 10.' },
    MM2HQ4: { difficulty: 'hard', prompt: 'Let f(x) = 2x − 1 and g(x) = x² + 3. If x > 0 and f(g(x)) = 15, what is x?', options: ['√2', '√5', '5/2', '4'], answer: 'B', explanation: 'f(g(x)) = 2(x² + 3) − 1 = 2x² + 5. Setting this equal to 15 gives 2x² = 10, so x² = 5. Because x > 0, x = √5.' },
    MM2HQ5: { difficulty: 'hard', prompt: 'If 2^x + 2^(x+1) = 96, what is the value of x?', type: 'spr', options: [], answer: '5', explanation: 'Factor out 2^x: 2^x(1 + 2) = 96, so 3·2^x = 96 and 2^x = 32. Therefore x = 5.' },
    MM2HQ6: { difficulty: 'hard', prompt: 'After a population is increased by 40% and then decreased by 25%, the final population is 31,500. What was the original population?', options: ['27,000', '30,000', '31,500', '35,000'], answer: 'B', explanation: 'The combined multiplier is 1.40 × 0.75 = 1.05. Thus 1.05P = 31,500, so P = 30,000.' },
    MM2HQ7: { difficulty: 'hard', prompt: 'A chord of a circle with radius 10 has a central angle of 120°. What is the length of the chord?', options: ['5√2', '5√3', '10√3', '20'], answer: 'C', explanation: 'A radius drawn to the midpoint of the chord creates a 30°-60°-90° triangle with hypotenuse 10. The half-chord is 10·sin(60°) = 5√3, so the full chord is 10√3.' },
    MM2HQ8: { difficulty: 'hard', prompt: 'A theater sold 240 adult and child tickets in total. Adult tickets cost $12 and child tickets cost $7. If the total revenue was $2,250, how many adult tickets were sold?', options: ['96', '108', '114', '120'], answer: 'C', explanation: 'Let a be the number of adult tickets. Then 12a + 7(240 − a) = 2250. This simplifies to 5a = 570, so a = 114.' },
    MM2HQ9: { difficulty: 'hard', prompt: 'The polynomial x³ + ax² − 5x − 6 is divisible by x − 2. What is the sum of the coefficients of the quotient?', options: ['5', '7', '8', '10'], answer: 'C', explanation: 'Because x − 2 is a factor, substituting x = 2 gives 8 + 4a − 10 − 6 = 0, so a = 2. Dividing x³ + 2x² − 5x − 6 by x − 2 gives x² + 4x + 3, whose coefficients sum to 8.' },
    MM2HQ10: { difficulty: 'hard', prompt: 'A data set has a standard deviation of 4. Every value in the data set is transformed by y = 1.5x + 3. What is the standard deviation of the transformed data set?', options: ['4', '5.5', '6', '7.5'], answer: 'C', explanation: 'Adding 3 shifts every value without changing spread, while multiplying by 1.5 multiplies the standard deviation by 1.5. Thus the new standard deviation is 1.5 × 4 = 6.' },
    MM2HQ11: { difficulty: 'hard', prompt: 'A solid consists of a cylinder with radius 3 and height 4 joined to a cone with the same radius and height 6. What is the total volume, in terms of π?', options: ['36π', '45π', '54π', '72π'], answer: 'C', explanation: 'The cylinder volume is π(3²)(4) = 36π. The cone volume is (1/3)π(3²)(6) = 18π. Their total is 54π.' },
    MM2HQ12: { difficulty: 'hard', prompt: 'A line perpendicular to 3x − 2y = 8 passes through (4, −1). What is the y-intercept of the line?', options: ['1/3', '5/3', '7/3', '11/3'], answer: 'B', explanation: 'Rewrite the given line as y = (3/2)x − 4, so its slope is 3/2. A perpendicular line has slope −2/3. Using (4, −1) gives y = −(2/3)x + 5/3, so the y-intercept is 5/3.' },
    MM2HQ13: { difficulty: 'hard', prompt: 'The equation 2/(x − 1) + 1/(x + 1) = 1 has two real solutions. What is the sum of those solutions?', options: ['1', '2', '3', '4'], answer: 'C', explanation: 'Multiplying by (x − 1)(x + 1) gives 2(x + 1) + (x − 1) = x² − 1, or x² − 3x − 2 = 0. By the quadratic-root sum relation, the solutions sum to 3.' },
    MM2HQ14: { difficulty: 'hard', prompt: 'A chemist mixes a 30% acid solution with a 50% acid solution to make 25 milliliters of a 36% acid solution. How many milliliters of the 50% solution are needed?', type: 'spr', options: [], answer: '7.5', explanation: 'Let x be the milliliters of 50% solution. Then 0.30(25 − x) + 0.50x = 0.36(25). This gives 7.5 + 0.20x = 9, so x = 7.5.' },
    MM2HQ15: { difficulty: 'hard', prompt: 'Two similar triangles have corresponding side lengths in the ratio 3:5. If the difference between their areas is 64, what is the area of the smaller triangle?', options: ['24', '32', '36', '40'], answer: 'C', explanation: 'Areas scale as the square of side lengths, so the area ratio is 9:25. The difference is 16 equal area units, and 16u = 64 gives u = 4. The smaller area is 9u = 36.' },
    MM2HQ16: { difficulty: 'hard', prompt: 'A theater sells adult tickets for $18 and child tickets for $10. One performance sold 84 tickets for $1,384. How many child tickets were sold?', options: ['12', '16', '17', '20'], answer: 'B', explanation: 'Let a and c be adult and child tickets. Then a + c = 84 and 18a + 10c = 1384. Substituting a = 84 − c gives 1512 − 8c = 1384, so 8c = 128 and c = 16. Therefore 16 child tickets were sold.' },
    MM2HQ17: { difficulty: 'hard', prompt: 'If 9^(x − 1) = 27^(2 − x) and x is positive, what is the value of x?', options: ['1', '8/5', '2', '5/2'], answer: 'B', explanation: 'Write both sides with base 3: 3^(2x − 2) = 3^(6 − 3x). Therefore 2x − 2 = 6 − 3x, so 5x = 8 and x = 8/5.' },
    MM2HQ18: { difficulty: 'hard', prompt: 'A bag contains 5 red, 3 blue, and 2 green marbles. Two marbles are drawn without replacement. What is the probability that both marbles are not blue?', options: ['5/18', '7/15', '2/5', '7/10'], answer: 'B', explanation: 'There are 7 non-blue marbles out of 10 initially, then 6 non-blue marbles out of 9. The probability is (7/10)(6/9) = 7/15.' },
    MM2HQ19: { difficulty: 'hard', prompt: 'A circle has center (4, −3) and radius 5. The circle intersects the y-axis at two points. What is the sum of the y-coordinates of those points?', options: ['−8', '−6', '0', '6'], answer: 'B', explanation: 'Set x = 0 in (x − 4)² + (y + 3)² = 25. Then 16 + (y + 3)² = 25, so y + 3 = ±3 and the two y-values are 0 and −6. Their sum is −6.' },
    MM2HQ20: { difficulty: 'hard', prompt: 'For x ≠ −4, if (3x − 2)/5 = (x + 6)/2, what is x?', type: 'spr', options: [], answer: '34', explanation: 'Cross-multiplying gives 2(3x − 2) = 5(x + 6), so 6x − 4 = 5x + 30 and x = 34.' },
    MM2HQ21: { difficulty: 'hard', prompt: 'For x ≥ 0, the equation √(x + 9) + √x = 9 has one solution. What is x?', type: 'spr', options: [], answer: '16', explanation: 'Let a = √x. Then √(a² + 9) = 9 − a. Squaring gives a² + 9 = 81 − 18a + a², so a = 4 and x = 16. The solution satisfies the original equation.' },
    MM2HQ22: { difficulty: 'hard', prompt: 'In a survey, 60% of respondents initially preferred option A. After 12 additional respondents chose option B, the proportion preferring A became 54%. How many respondents were in the original survey?', type: 'spr', options: [], answer: '108', explanation: 'Let the original number of respondents be n. Then 0.60n = 0.54(n + 12). Solving gives 0.06n = 6.48, so n = 108.' }
  };

  const groups = [window.SAT_QUESTIONS?.rw1 || [], window.SAT_QUESTIONS?.rw2?.easy || [], window.SAT_QUESTIONS?.rw2?.hard || [], window.SAT_QUESTIONS?.math1 || [], window.SAT_QUESTIONS?.math2?.easy || [], window.SAT_QUESTIONS?.math2?.hard || []];
  const letters = ['A', 'B', 'C', 'D'];
  function hash(value) { let h = 2166136261; for (const ch of value) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; }
  groups.flat().forEach((question) => {
    if (question.__azmQualityOverridesApplied === true) return;
    const patch = overrides[question.id];
    if (patch) Object.assign(question, patch);
    if (question.type !== 'spr' && Array.isArray(question.options) && question.options.length === 4) {
      const originalIndex = letters.indexOf(String(question.answer).toUpperCase());
      if (originalIndex >= 0) {
        const shift = hash(question.id) % 4;
        if (shift) {
          const original = question.options.slice();
          question.options = original.map((_, nextIndex) => original[(nextIndex - shift + 4) % 4]);
          question.answer = letters[(originalIndex + shift) % 4];
        }
      }
    }
    Object.defineProperty(question, '__azmQualityOverridesApplied', { value: true, enumerable: false, configurable: false, writable: false });
  });
})();