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

const interpreterStarted = ({ loopId, synth }) => ({
  type: "INTERPRETER_STARTED",
  loopId,
  synth
});

const interpreterStopped = () => ({
  type: "INTERPRETER_STOPPED"
});

const initSynth = () => {
  const saw = new Wad({ source: "sine" });
  saw.setVolume(0.5);
  return saw;
};

export const stopInterpreter = () => (dispatch, getState) => {
  const { interpreter } = getState();
  console.log("STOP INTERPRETER", interpreter);

  clearInterval(interpreter.loopId);
  dispatch(interpreterStopped());
};

export const startInterpreter = () => (dispatch, getState) => {
  const { interpreter } = getState();
  console.log("START INTERPRETER", interpreter);

  const loopId = setInterval(() => dispatch(tick()), bpmToMs(interpreter.bpm));
  const synth = initSynth();
  dispatch(interpreterStarted({ loopId, synth }));
};
