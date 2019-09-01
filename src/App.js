/* eslint react/prop-types: 0 */
import React from "react";
import { connect } from "react-redux";
import { scales } from "./utils";
import {
  setProgram,
  startInterpreter,
  stopInterpreter,
  setTempo,
  setScale
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

const Description = () => (
  <section>
    <h2>Description</h2>
    Based on <a href="https://esolangs.org/wiki/Brainfuck">brainfuck</a>{" "}
    programming language with additional extensions for music.
    <h3>Opcodes</h3>
    <table>
      <tbody>
        <tr>
          <td>{">"}</td>
          <td>Moves the pointer to the right</td>
        </tr>
        <tr>
          <td>{"<"}</td>
          <td>Moves the pointer to the left</td>
        </tr>
        <tr>
          <td>+</td>
          <td>Increments the memory cell under the pointer</td>
        </tr>
        <tr>
          <td>-</td>
          <td>Decrements the memory cell under the pointer</td>
        </tr>
        <tr>
          <td>.</td>
          <td>
            Triggers a note determined by the memory cell under the pointer
          </td>
        </tr>
        <tr>
          <td>,</td>
          <td>
            Reads value from input - will be only available in O_C version
          </td>
        </tr>
        <tr>
          <td>[</td>
          <td>
            Jumps past the matching ] if the cell under the pointer is 0. If no
            matching ] is found proceedes as usual
          </td>
        </tr>
        <tr>
          <td>]</td>
          <td>
            Jumps back to the matching [ if the cell under the pointer is
            nonzero. If no matching [ is found proceedes as usual
          </td>
        </tr>
        <tr>
          <td>j</td>
          <td>
            Moves program pointer to random position and removes itself from
            program
          </td>
        </tr>
        <tr>
          <td>J</td>
          <td>Moves program pointer to random position</td>
        </tr>
        <tr>
          <td>c</td>
          <td>
            Replaces opcode at random position with random opcode and removes
            itself from program
          </td>
        </tr>
        <tr>
          <td>C</td>
          <td>Replaces opcode at random position with random opcode</td>
        </tr>
      </tbody>
    </table>
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

const AppComponent = ({ interpreter, running, dispatch }) => {
  const {
    program,
    programPointer,
    memoryPointer,
    memory,
    bpm,
    scale
  } = interpreter;
  return (
    <article>
      <section>
        <h1>Brain SEQ</h1>
        <Program program={program} dispatch={dispatch} />
        <Tempo bpm={bpm} dispatch={dispatch} />
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
