import { scales } from "../utils";

const initialState = {
  synth: null,
  interpreter: {
    bpm: 120,
    memoryPointer: 0,
    programPointer: 0,
    program: "",
    memorySize: 16,
    memory: Array(16).fill(0),
    scale: "chromatic",
    maxMemoryVal: 16,
    minMemoryVal: 0
  },
  running: false
};

const opcodes = "<>+-.cCjJrR";
const opcodesNonMatchRe = /[^\+\-\[\]\.cCjJ<>rR]/g;

const merge = (o1, o2) => {
  return Object.assign({}, o1, o2);
};

const randInt = to => {
  return Math.floor(Math.random() * to);
};

const memoryToFreq = (scaleName, val) => {
  const scale = scales[scaleName];
  const baseFreq = 440;
  const octave = Math.floor(val / scale.length);
  const octaveFreq = baseFreq + baseFreq * octave;
  const step = Math.pow(1.0595, scale[val % scale.length]);
  return octaveFreq * step;
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

const findMatchingLoopEnd = (program, programPointer) => {
  let newPointer = programPointer;
  let openingCount = -1;
  for (let i = newPointer; i < program.length - programPointer; i++) {
    const c = program[i];
    if (c === "[") {
      openingCount += 1;
    } else if (c === "]") {
      if (openingCount === 0) {
        newPointer = i;
        break;
      } else {
        openingCount -= 1;
      }
    }
  }
  return newPointer;
};

const findMatchingLoopStart = (program, programPointer) => {
  let newPointer = programPointer;
  let closingCount = -1;
  for (let i = newPointer; i >= 0; i--) {
    const c = program[i];
    if (c === "]") {
      closingCount += 1;
    } else if (c === "[") {
      if (closingCount === 0) {
        newPointer = i;
        break;
      } else {
        closingCount -= 1;
      }
    }
  }
  return newPointer;
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
    scale,
    maxMemoryVal,
    minMemoryVal
  } = interpreter;
  const currentOp = program[programPointer];
  switch (currentOp) {
    case "+":
      memory[memoryPointer] =
        memory[memoryPointer] + 1 > maxMemoryVal
          ? minMemoryVal
          : memory[memoryPointer] + 1;
      break;
    case "-":
      memory[memoryPointer] =
        memory[memoryPointer] - 1 < minMemoryVal
          ? maxMemoryVal
          : memory[memoryPointer] - 1;
      break;
    case ">":
      memoryPointer = memoryPointer + 1 >= memorySize ? 0 : memoryPointer + 1;
      break;
    case "<":
      memoryPointer =
        memoryPointer - 1 < 0 ? memorySize - 1 : memoryPointer - 1;
      break;
    case ".":
      synth.play({
        env: { hold: 0.5 },
        pitch: memoryToFreq(scale, memory[memoryPointer])
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
    case "[":
      programPointer =
        memory[memoryPointer] === 0
          ? findMatchingLoopEnd(program, programPointer)
          : programPointer;
      break;
    case "]":
      programPointer =
        memory[memoryPointer] !== 0
          ? findMatchingLoopStart(program, programPointer)
          : programPointer;
      break;
    case "r":
      program = removeOpcodeAtProgramPointer(program, programPointer);
      memory[memoryPointer] = randInt(maxMemoryVal);
      break;
    case "R":
      memory[memoryPointer] = randInt(maxMemoryVal);
      break;
    default:
      break;
  }
  programPointer = (programPointer + 1) % program.length || 0;
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
        synth: action.synth,
        running: true
      });
    case "INTERPRETER_STOPPED":
      return Object.assign({}, state, {
        synth: null,
        running: false
      });
    case "SET_TEMPO":
      return Object.assign({}, state, {
        interpreter: merge(state.interpreter, { bpm: action.bpm })
      });
    case "SET_SCALE":
      return Object.assign({}, state, {
        interpreter: merge(state.interpreter, { scale: action.scale })
      });
    case "TICK":
      return tick(state);
    default:
      return state;
  }
};

export default rootReducer;
