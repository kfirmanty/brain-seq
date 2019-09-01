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
  const saw = new Wad({ source: "sine" });
  saw.setVolume(0.5);
  return saw;
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
