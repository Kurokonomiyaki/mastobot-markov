'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSettings = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mergeOptions = require('merge-options');

var _mergeOptions2 = _interopRequireDefault(_mergeOptions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** DEFAULT OPTIONS */
var TOOT_OPTIONS = {
  visibility: 'unlisted',
  sensitive: false
};
/** */

var getSettings = exports.getSettings = function getSettings(file) {
  var data = _fs2.default.readFileSync(file);
  if (data == null) {
    throw new Error('Unable to load settings');
  }

  var customSettings = JSON.parse(data);
  var sourceInstanceUrl = customSettings.sourceInstanceUrl,
      destinationInstanceUrl = customSettings.destinationInstanceUrl;
  var sourceInstanceToken = customSettings.sourceInstanceToken,
      destinationInstanceToken = customSettings.destinationInstanceToken,
      sourceAccountId = customSettings.sourceAccountId;


  if (sourceInstanceUrl == null || sourceInstanceToken == null || destinationInstanceUrl == null || destinationInstanceToken == null || sourceAccountId == null) {
    throw new Error('access tokens, instance urls and account id are mandatory');
  }
  if (sourceInstanceUrl.endsWith('/') === false) {
    sourceInstanceUrl = sourceInstanceUrl + '/';
  }
  if (destinationInstanceUrl.endsWith('/') === false) {
    destinationInstanceUrl = destinationInstanceUrl + '/';
  }

  var tootOptions = (0, _mergeOptions2.default)(TOOT_OPTIONS, customSettings.tootOptions || {});

  var allowedVisibilities = ['public'];
  if (customSettings.ignoreUnlistedMessage == null || customSettings.ignoreUnlistedMessage === false) {
    allowedVisibilities.push('unlisted');
  }
  if (customSettings.ignorePrivateMessage == null || customSettings.ignorePrivateMessage === false) {
    allowedVisibilities.push('private');
  }
  if (customSettings.ignoreDirectMessage === false) {
    allowedVisibilities.push('direct');
  }

  var minTimeBetweenToots = customSettings.minTimeBetweenToots,
      maxTimeBetweenToots = customSettings.maxTimeBetweenToots;

  minTimeBetweenToots = minTimeBetweenToots || 120;
  maxTimeBetweenToots = maxTimeBetweenToots || 360;
  if (minTimeBetweenToots > maxTimeBetweenToots) {
    throw new Error('minTimeBetweenToots > maxTimeBetweenToots');
  }

  return {
    sourceInstanceUrl: sourceInstanceUrl,
    sourceInstanceToken: sourceInstanceToken,
    sourceAccountId: sourceAccountId,
    ignoreDirectMessage: customSettings.ignoreDirectMessage || true,
    ignorePrivateMessage: customSettings.ignorePrivateMessage || false,
    ignoreUnlistedMessage: customSettings.ignoreUnlistedMessage || false,
    ignoreContentWarning: customSettings.ignoreContentWarning || false,
    allowedVisibilities: allowedVisibilities,
    maxPagesToCollect: Math.ceil((customSettings.maxTootsToCollect || 1000000) / 40),
    destinationInstanceUrl: destinationInstanceUrl,
    destinationInstanceToken: destinationInstanceToken,
    tootOptions: tootOptions,
    tootSuffix: customSettings.tootSuffix || null,
    markovOrder: 2,
    minTimeBetweenToots: minTimeBetweenToots,
    maxTimeBetweenToots: maxTimeBetweenToots,
    sentencesFile: __dirname + '/../sentences.dat',
    lastExecutionFile: __dirname + '/../lastexecution.dat',
    modelFile: __dirname + '/../model.json'
  };
};

exports.default = getSettings;