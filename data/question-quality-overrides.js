(() => {
  'use strict';

  const overrides = {
  MM2HQ1: { difficulty: 'hard' },
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
  };

  const groups = [window.SAT_QUESTIONS?.rw1 || [], window.SAT_QUESTIONS?.rw2?.easy || [], window.SAT_QUESTIONS?.rw2?.hard || [], window.SAT_QUESTIONS?.math1 || [], window.SAT_QUESTIONS?.math2?.easy || [], window.SAT_QUESTIONS?.math2?.hard || []];
  const letters = ['A', 'B', 'C', 'D'];
  function hash(value) { let h = 2166136261; for (const ch of value) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; }
  const mcqItems = groups.flat().filter((question) => question.type !== 'spr' && Array.isArray(question.options) && question.options.length === 4);
  const balancedTargets = mcqItems.map((_, index) => letters[index % letters.length]);
  const targetPositions = new Map();
  mcqItems.slice().sort((a, b) => hash(a.id) - hash(b.id) || a.id.localeCompare(b.id)).forEach((question, index) => {
    targetPositions.set(question.id, balancedTargets[index]);
  });

  groups.flat().forEach((question) => {
    if (question.__azmQualityOverridesApplied === true) return;
    const patch = overrides[question.id];
    if (patch) Object.assign(question, patch);
    if (question.type !== 'spr' && Array.isArray(question.options) && question.options.length === 4) {
      const originalIndex = letters.indexOf(String(question.answer).toUpperCase());
      const targetIndex = letters.indexOf(targetPositions.get(question.id));
      if (originalIndex >= 0 && targetIndex >= 0) {
        const shift = (targetIndex - originalIndex + letters.length) % letters.length;
        if (shift) {
          const original = question.options.slice();
          question.options = original.map((_, nextIndex) => original[(nextIndex - shift + letters.length) % letters.length]);
          question.answer = letters[targetIndex];
        }
      }
    }
    Object.defineProperty(question, '__azmQualityOverridesApplied', { value: true, enumerable: false, configurable: false, writable: false });
  });})();