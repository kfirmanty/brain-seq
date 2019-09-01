export const bpmToMs = bpm => 60000 / bpm;

export const scales = {
  chromatic: [...Array(12).keys()],
  minor: [0, 2, 3, 5, 7, 8, 10],
  minorPentatonic: [0, 3, 5, 7, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  majorPentatonic: [0, 4, 5, 7, 11]
};
