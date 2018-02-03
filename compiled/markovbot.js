'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startBot = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _mastodonApi = require('mastodon-api');

var _mastodonApi2 = _interopRequireDefault(_mastodonApi);

var _settings = require('./settings');

var _tootcollector = require('./tootcollector');

var _markovmodel = require('./markovmodel');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var toot = function toot(settings, instance, model) {
  // const text = generateSentences(model, 80, settings.markovOrder) + settings.tootSuffix; // TODO add the min length to the settings file
  var text = (0, _markovmodel.generateSentence)(model, settings.markovOrder) + settings.tootSuffix;
  instance.post('statuses', (0, _assign2.default)(settings.tootOptions, {
    status: text
  }));
  console.log('Published:', text);

  var minTimeBetweenToots = settings.minTimeBetweenToots,
      maxTimeBetweenToots = settings.maxTimeBetweenToots;

  var nextTime = Math.round(Math.random() * (maxTimeBetweenToots - minTimeBetweenToots)) + minTimeBetweenToots;
  setTimeout(function () {
    return toot(settings, instance, model);
  }, nextTime * 60 * 1000);
};

var startBot = exports.startBot = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var settings, nbNewSentences, model, instance;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            settings = (0, _settings.getSettings)(__dirname + '/../settings.json');

            // always collect new toots at startup

            _context.next = 3;
            return (0, _tootcollector.collectToots)(settings);

          case 3:
            nbNewSentences = _context.sent;

            console.log(nbNewSentences, 'toot(s) collected');
            console.log('Updating model...');
            model = (0, _markovmodel.updateModelFromFile)(nbNewSentences, settings.markovOrder);

            console.log('Done.');

            instance = new _mastodonApi2.default({
              access_token: settings.destinationInstanceToken,
              api_url: settings.destinationInstanceUrl
            });

            // immediately toot and set the timer for the next toot

            toot(settings, instance, model);

          case 10:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function startBot() {
    return _ref.apply(this, arguments);
  };
}();

exports.default = startBot;