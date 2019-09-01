import Wad from "web-audio-daw";
import { bpmToMs } from "../utils";

export const setProgram = program => ({
  type: "SET_PROGRAM",
  program
});

export const setTempo = bpm => ({
  type: "SET_TEMPO",
  bpm
});

export const setScale = scale => ({
  type: "SET_SCALE",
  scale
});

export const setBaseFreq = baseFreq => ({
  type: "SET_BASE_FREQ",
  baseFreq
});

const tick = () => ({ type: "TICK" });

const tickLoop = () => (dispatch, getState) => {
  const { interpreter, running } = getState();
  if (running) {
    dispatch(tick());
    setTimeout(() => dispatch(tickLoop()), bpmToMs(interpreter.bpm));
  }
};

const interpreterStarted = ({ synth }) => ({
  type: "INTERPRETER_STARTED",
  synth
});

const initSynth = () => {
  return new Wad({
    source: "sawtooth",
    volume: 0.5,
    env: {
      attack: 0.0,
      decay: 0.0,
      sustain: 1.0,
      hold: 0.5,
      release: 1
    },
    filter: {
      type: "lowpass",
      frequency: 600,
      q: 0,
      env: {
        frequency: 800,
        attack: 0.1,
        hold: 0.0,
        release: 0.0,
        sustain: 0.0,
        decay: 0.5
      }
    }
  });
};

export const stopInterpreter = () => ({
  type: "INTERPRETER_STOPPED"
});

export const startInterpreter = () => (dispatch, getState) => {
  const { interpreter } = getState();
  console.log("START INTERPRETER", interpreter);

  const synth = initSynth();
  dispatch(interpreterStarted({ synth }));
  dispatch(tickLoop());
};
