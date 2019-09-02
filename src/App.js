/* eslint react/prop-types: 0 */
import React from "react";
import { connect } from "react-redux";
import { scales } from "./utils";
import {
  setProgram,
  startInterpreter,
  stopInterpreter,
  setTempo,
  setScale,
  setBaseFreq
} from "./actions/index";

const mapStateToProps = state => ({
  interpreter: state.interpreter,
  running: state.running
});

const Program = ({ program, dispatch }) => (
  <div>
    <p>Program:</p>
    <input
      type="text"
      value={program}
      onChange={e => dispatch(setProgram(e.target.value))}
    />
  </div>
);

const Pointers = ({ programPointer, memoryPointer }) => (
  <div>
    {" "}
    <p>Pointers:</p>
    Program pointer: {programPointer}
    <br />
    Memory pointer: {memoryPointer}
  </div>
);

const Memory = ({ memory }) => (
  <div>
    <p>Memory:</p>
    {memory.map((el, index) => index + ":" + el + ", ")}
  </div>
);

const Scale = ({ scale, dispatch }) => (
  <div>
    <p>Scale:</p>
    <select value={scale} onChange={e => dispatch(setScale(e.target.value))}>
      {Object.keys(scales).map(el => (
        <option value={el} key={el}>
          {el}
        </option>
      ))}
    </select>
  </div>
);

const PlayButton = ({ dispatch, running }) => (
  <p onClick={() => dispatch(running ? stopInterpreter() : startInterpreter())}>
    {running ? "Click to Stop!" : "Click to Start!"}
  </p>
);

const opsDescriptions = {
  ">": "Moves the pointer to the right",
  "<": "Moves the pointer to the left",
  "+": "Increments the memory cell under the pointer",
  "-": "Decrements the memory cell under the pointer",
  ".": "Triggers a note determined by the memory cell under the pointer",
  ",": "Reads value from input - will be only available in O_C version",
  "[":
    "Jumps past the matching ] if the cell under the pointer is 0. If no matching ] is found proceedes as usual",
  "]":
    "Jumps back to the matching [ if the cell under the pointer is nonzero. If no matching [ is found proceedes as usual",
  j: "Moves program pointer to random position and removes itself from program",
  J: "Moves program pointer to random position",
  c:
    "Replaces opcode at random position with random opcode and removes itself from program",
  C: "Replaces opcode at random position with random opcode",
  r:
    "Inserts random value to cell under the pointer and removes itself from program",
  R: "Inserts random value to cell under the pointer"
};

const Table = ({ from }) => (
  <table>
    <tbody>
      {Object.keys(from).map(el => (
        <tr key={el}>
          <td>{el}</td>
          <td>{from[el]}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const examples = {
  ".+": "Play a sequence of notes raising by one scale step",
  ".+.+.+--":
    "Plays repeated sequences of three rising notes starting one scale step higher on each repetition",
  "++++.+++.+.+.+.--.--.+.-------":
    'Plays the notes from the "lick" - set scale to minor'
};

const Description = () => (
  <section>
    <h2>Description</h2>
    Based on <a href="https://esolangs.org/wiki/Brainfuck">brainfuck</a>{" "}
    programming language with additional extensions for music.
    <h3>Opcodes</h3>
    <Table from={opsDescriptions} />
    <h3>Examples</h3>
    <Table from={examples} />
  </section>
);

const Tempo = ({ bpm, dispatch }) => (
  <div>
    <p>Tempo:</p>
    <input
      type="text"
      defaultValue={bpm}
      onBlur={e => dispatch(setTempo(e.target.value))}
    />
  </div>
);

const BaseFreq = ({ baseFreq, dispatch }) => (
  <div>
    <p>Base frequency:</p>
    <input
      type="number"
      min="1"
      max="1000"
      defaultValue={baseFreq}
      onBlur={e => dispatch(setBaseFreq(e.target.value))}
    />
  </div>
);

const AppComponent = ({ interpreter, running, dispatch }) => {
  const {
    program,
    programPointer,
    memoryPointer,
    memory,
    bpm,
    scale,
    baseFreq
  } = interpreter;
  return (
    <article>
      <section>
        <h1>Brain SEQ</h1>
        <Program program={program} dispatch={dispatch} />
        <Tempo bpm={bpm} dispatch={dispatch} />
        <BaseFreq baseFreq={baseFreq} dispatch={dispatch} />
        <Scale scale={scale} dispatch={dispatch} />
        <Memory memory={memory} />
        <Pointers
          programPointer={programPointer}
          memoryPointer={memoryPointer}
        />
        <PlayButton running={running} dispatch={dispatch} />
      </section>
      <Description />
    </article>
  );
};

const App = connect(mapStateToProps)(AppComponent);
export default App;
