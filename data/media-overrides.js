(() => {
  'use strict';

  const question = window.SAT_QUESTIONS?.rw1?.find((item) => item.id === 'RWM1Q20');
  if (!question || question.__azmMediaOverrideApplied) return;
  question.media = {
    type: 'image',
    src: 'assets/media/rainfall-chart.svg',
    alt: 'Bar chart showing monthly rainfall of 42 millimeters in January, 58 in February, 51 in March, and 49 in April.',
    caption: 'Monthly rainfall totals used in this original practice question.'
  };
  Object.defineProperty(question, '__azmMediaOverrideApplied', { value: true, enumerable: false });

  const graphQuestion = window.SAT_QUESTIONS?.rw2?.hard?.find((item) => item.id === 'RWM2HQ5');
  if (graphQuestion && !graphQuestion.__azmMediaOverrideApplied) {
    graphQuestion.media = {
      type: 'image',
      src: 'assets/media/battery-capacity-chart.svg',
      alt: 'Line graph showing retained battery capacity of 92 percent after 100 cycles, 81 percent after 200, 74 percent after 300, and 68 percent after 400 cycles.',
      caption: 'Retained battery capacity in this original practice data set.'
    };
    Object.defineProperty(graphQuestion, '__azmMediaOverrideApplied', { value: true, enumerable: false });
  }

  const mathQuestion = window.SAT_QUESTIONS?.math1?.find((item) => item.id === 'MM1Q7');
  if (mathQuestion && !mathQuestion.__azmMediaOverrideApplied) {
    mathQuestion.media = {
      type: 'image',
      src: 'assets/media/triangle-area.svg',
      alt: 'Triangle diagram with a base labeled 12 and a perpendicular height labeled 7.',
      caption: 'Dimensions for this original practice geometry question.'
    };
    Object.defineProperty(mathQuestion, '__azmMediaOverrideApplied', { value: true, enumerable: false });
  }
})();
