import Fs from 'fs';
import Str from 'underscore.string';

const updateModel = (data, order = 2, initialModel = {}) => {
  const model = initialModel;

  let currentState = Array(order).fill('-'); // root state

  for (let i = 0; i < data.length; i += 1) {
    const subState = data[i];
    const stateKey = currentState.toString();
    if (stateKey in model) {
      const state = model[stateKey];
      if (subState in state) {
        state[subState] += 1;
      } else {
        state[subState] = 1;
      }
      state.__total += 1; // TODO improve total management
    } else {
      model[stateKey] = {};
      model[stateKey][subState] = 1;
      model[stateKey].__total = 1; // TODO improve total management
    }

    currentState = currentState.slice(1);
    currentState.push(subState);
  }

  return model;
};

export const updateModelFromFile = (nbSentences, order = 2) => {
  let model = {};
  let sentences = [];

  // TODO must improve the file loading (line by line reading instead of loading everything into memory)
  if (Fs.existsSync('model.json')) {
    model = JSON.parse(Fs.readFileSync('model.json').toString());
    if (nbSentences == null || nbSentences === 0) {
      return model;
    }
    sentences = Fs.readFileSync('sentences.dat').toString().split('\n');
    sentences = sentences.slice(sentences.length - nbSentences);
  } else {
    sentences = Fs.readFileSync('sentences.dat').toString().split('\n');
  }

  sentences.forEach((sentence) => {
    if (sentence != null && sentence.trim().length > 40) { // TODO add the size limit to the settings file
      model = updateModel(Str.words(sentence), order, model);
    }
  });

  Fs.writeFileSync('model.json', JSON.stringify(model), 'utf8');
  return model;
};

const pickNextState = (model, currentStateKey) => {
  const randomInt = Math.floor(Math.random() * model[currentStateKey].__total);

  let sum = 0;
  const nextStateKeys = Object.keys(model[currentStateKey]);
  for (let i = 0; i < nextStateKeys.length; i += 1) {
    const nextStateKey = nextStateKeys[i];
    if (nextStateKeys[i] !== '__total') {
      if (randomInt >= sum && randomInt < sum + model[currentStateKey][nextStateKey]) {
        return nextStateKey;
      }
      sum += model[currentStateKey][nextStateKey];
    }
  }
  return null;
};

export const generateSentence = (model, order = 2) => {
  const result = [];

  let currentState = Array(order).fill('-'); // root state

  for (let i = 0; i < 100; i += 1) {
    const currentStateKey = currentState.toString();
    if (currentStateKey in model === false) {
      break;
    }

    result.push(pickNextState(model, currentStateKey));

    currentState = currentState.slice(1);
    currentState.push(result[result.length - 1]);
  }

  return result.join(' ');
};

export const generateSentences = (model, minLength = 100, order = 2) => {
  const sentences = [];
  let length = 0;

  while (length < minLength) {
    const sentence = generateSentence(model, order);
    sentences.push(sentence);
    length += sentence.length;
  }

  return sentences.join(' ');
};
