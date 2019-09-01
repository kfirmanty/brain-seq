const scales = {
  chromatic: [...Array(12).keys()],
  minor: [0, 2, 3, 5, 7, 8, 10],
  minorPentatonic: [0, 3, 5, 7, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  majorPentatonic: [0, 4, 5, 7, 11]
};

const initialState = {
  synth: null,
  interpreter: {
    bpm: 120,
    memory: [],
    memoryPointer: 0,
    programPointer: 0,
    program: "",
    loopId: 0,
    memorySize: 16,
    scale: scales.chromatic
  },
  running: false
};

const opcodes = "<>+-.cCjJ";
const opcodesNonMatchRe = /[^+-[\].cCjJ<>]/g;

const merge = (o1, o2) => {
  return Object.assign({}, o1, o2);
};

const randInt = to => {
  return Math.floor(Math.random() * to);
};

const memoryToFreq = (scale, val) => {
  const baseFreq = 440;
  const step = 440 / 12;
  return baseFreq + step * scale[val % scale.length];
};

const randomOpcode = () => {
  return opcodes[randInt(opcodes.length)];
};

const removeOpcodeAtProgramPointer = (program, programPointer) =>
  program.slice(0, programPointer) +
  program.slice(programPointer + 1, program.length);

const changeRandomOpcode = program => {
  const at = randInt(program.length);
  return (
    program.slice(0, at) +
    randomOpcode() +
    program.slice(at + 1, program.length)
  );
};

const tick = state => {
  const interpreter = Object.assign({}, state.interpreter);
  const synth = state.synth;
  let {
    memory,
    memoryPointer,
    programPointer,
    program,
    memorySize,
    scale
  } = interpreter;
  const currentOp = program[programPointer];
  switch (currentOp) {
    case "+":
      memory[memoryPointer] = (memory[memoryPointer] || 0) + 1;
      break;
    case "-":
      memory[memoryPointer] = Math.max((memory[memoryPointer] || 0) - 1, 0);
      break;
    case ">":
      memoryPointer = Math.min(memoryPointer + 1, memorySize);
      break;
    case "<":
      memoryPointer = Math.max(memoryPointer - 1, 0);
      break;
    case ".":
      synth.play({
        env: { hold: 0.5, release: 1 },
        pitch: memoryToFreq(scale, memory[memoryPointer] || 0)
      }); //FIXME: awful side effect
      break;
    case "j": //jumps to random point in program and opcode removes itself from program
      program = removeOpcodeAtProgramPointer(program, programPointer);
      programPointer = randInt(program.length);
      break;
    case "J":
      programPointer = randInt(program.length);
      break;
    case "c": //replaces random opcode in program to other random opcode and removes itself from program
      program = removeOpcodeAtProgramPointer(program, programPointer);
      program = changeRandomOpcode(program);
      break;
    case "C":
      program = changeRandomOpcode(program);
      break;
    default:
      break;
  }
  programPointer = (programPointer + 1) % program.length;
  return Object.assign({}, state, {
    interpreter: merge(state.interpreter, {
      memory,
      memoryPointer,
      programPointer,
      program
    })
  });
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_PROGRAM":
      return Object.assign({}, state, {
        interpreter: merge(state.interpreter, {
          program: action.program.replace(opcodesNonMatchRe, "")
        })
      });
    case "INTERPRETER_STARTED":
      return Object.assign({}, state, {
        interpreter: merge(state.interpreter, {
          loopId: action.loopId
        }),
        synth: action.synth,
        running: true
      });
    case "INTERPRETER_STOPPED":
      return Object.assign({}, state, {
        synth: null,
        interpreter: merge(state.interpreter, { loopId: 0 }),
        running: false
      });
    case "SET_TEMPO":
      return Object.assign({}, state, {
        interpreter: merge(state.interpreter, { bpm: action.bpm })
      });
    case "TICK":
      return tick(state);
    default:
      return state;
  }
};

export default rootReducer;
