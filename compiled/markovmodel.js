'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateSentences = exports.generateSentence = exports.updateModelFromFile = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _underscore = require('underscore.string');

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var updateModel = function updateModel(data) {
  var order = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
  var initialModel = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var model = initialModel;

  var currentState = Array(order).fill('-'); // root state

  for (var i = 0; i < data.length; i += 1) {
    var subState = data[i];
    var stateKey = currentState.toString();
    if (stateKey in model) {
      var state = model[stateKey];
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

var updateModelFromFile = exports.updateModelFromFile = function updateModelFromFile(_ref, nbSentences) {
  var sentencesFile = _ref.sentencesFile,
      modelFile = _ref.modelFile;
  var order = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;

  var model = {};
  var sentences = [];

  // TODO must improve the file loading (line by line reading instead of loading everything into memory)
  if (_fs2.default.existsSync(modelFile)) {
    model = JSON.parse(_fs2.default.readFileSync(modelFile).toString());
    if (nbSentences == null || nbSentences === 0) {
      return model;
    }
    sentences = _fs2.default.readFileSync(sentencesFile).toString().split('\n');
    sentences = sentences.slice(sentences.length - nbSentences);
  } else {
    sentences = _fs2.default.readFileSync(sentencesFile).toString().split('\n');
  }

  sentences.forEach(function (sentence) {
    if (sentence != null && sentence.trim().length > 40) {
      // TODO add the size limit to the settings file
      model = updateModel(_underscore2.default.words(sentence), order, model);
    }
  });

  _fs2.default.writeFileSync(modelFile, (0, _stringify2.default)(model), 'utf8');
  return model;
};

var pickNextState = function pickNextState(model, currentStateKey) {
  var randomInt = Math.floor(Math.random() * model[currentStateKey].__total);

  var sum = 0;
  var nextStateKeys = (0, _keys2.default)(model[currentStateKey]);
  for (var i = 0; i < nextStateKeys.length; i += 1) {
    var nextStateKey = nextStateKeys[i];
    if (nextStateKeys[i] !== '__total') {
      if (randomInt >= sum && randomInt < sum + model[currentStateKey][nextStateKey]) {
        return nextStateKey;
      }
      sum += model[currentStateKey][nextStateKey];
    }
  }
  return null;
};

var generateSentence = exports.generateSentence = function generateSentence(model) {
  var order = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;

  var result = [];

  var currentState = Array(order).fill('-'); // root state

  for (var i = 0; i < 100; i += 1) {
    var currentStateKey = currentState.toString();
    if (currentStateKey in model === false) {
      break;
    }

    result.push(pickNextState(model, currentStateKey));

    currentState = currentState.slice(1);
    currentState.push(result[result.length - 1]);
  }

  return result.join(' ');
};

var generateSentences = exports.generateSentences = function generateSentences(model) {
  var minLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
  var order = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;

  var sentences = [];
  var length = 0;

  while (length < minLength) {
    var sentence = generateSentence(model, order);
    sentences.push(sentence);
    length += sentence.length;
  }

  return sentences.join(' ');
};