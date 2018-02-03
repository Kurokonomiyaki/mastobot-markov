'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.collectToots = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _mastodonApi = require('mastodon-api');

var _mastodonApi2 = _interopRequireDefault(_mastodonApi);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _tootparser = require('./tootparser');

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var processData = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref2, toots, fd) {
    var allowedVisibilities = _ref2.allowedVisibilities,
        ignoreContentWarning = _ref2.ignoreContentWarning;

    var lastId, nbSentences, i, _toots$i, content, reblog, visibility, id, spoiler_text, sentences;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            lastId = -1;
            nbSentences = 0;
            i = 0;

          case 3:
            if (!(i < toots.length)) {
              _context.next = 14;
              break;
            }

            _toots$i = toots[i], content = _toots$i.content, reblog = _toots$i.reblog, visibility = _toots$i.visibility, id = _toots$i.id, spoiler_text = _toots$i.spoiler_text;

            if (!(reblog == null && allowedVisibilities.indexOf(visibility) !== -1 && (ignoreContentWarning === false || spoiler_text == null))) {
              _context.next = 11;
              break;
            }

            _context.next = 8;
            return (0, _tootparser.parseToot)(content);

          case 8:
            sentences = _context.sent;

            if (sentences != null && sentences.length > 0) {
              nbSentences += sentences.length;
              _fs2.default.writeSync(fd, sentences.join('\n'));
              _fs2.default.writeSync(fd, '\n');
            }
            lastId = id;

          case 11:
            i += 1;
            _context.next = 3;
            break;

          case 14:
            return _context.abrupt('return', { lastId: lastId, nbSentences: nbSentences });

          case 15:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function processData(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var collectPage = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(settings, instance, fd, requestParams) {
    var isFirstPage = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    var sourceAccountId, response;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            sourceAccountId = settings.sourceAccountId;
            _context2.next = 3;
            return instance.get('accounts/' + sourceAccountId + '/statuses', requestParams);

          case 3:
            response = _context2.sent;

            if (!(response.data == null || response.data.length === 0)) {
              _context2.next = 6;
              break;
            }

            return _context2.abrupt('return', { lastId: -1, nbSentences: 0 });

          case 6:
            if (isFirstPage) {
              console.log('Will collect everything after this toot:', response.data[0].id);
              _fs2.default.writeFileSync('lastexecution.dat', response.data[0].id, 'utf8');
            }

            return _context2.abrupt('return', processData(settings, response.data, fd));

          case 8:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function collectPage(_x4, _x5, _x6, _x7) {
    return _ref3.apply(this, arguments);
  };
}();

var collectToots = exports.collectToots = function () {
  var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(settings) {
    var instance, sinceId, nbNewSentences, maxId, fd, _loop, i, _ret;

    return _regenerator2.default.wrap(function _callee3$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            instance = new _mastodonApi2.default({
              access_token: settings.sourceInstanceToken,
              api_url: settings.sourceInstanceUrl
            });
            sinceId = null;

            if (_fs2.default.existsSync('lastexecution.dat') && _fs2.default.existsSync('sentences.dat')) {
              sinceId = _fs2.default.readFileSync('lastexecution.dat').toString().trim();
            }
            nbNewSentences = 0;
            maxId = null;
            fd = _fs2.default.openSync('sentences.dat', 'a');


            console.log('Collecting first page:', maxId, sinceId);

            _loop = /*#__PURE__*/_regenerator2.default.mark(function _loop(i) {
              var requestParams, _ref5, lastId, nbSentences;

              return _regenerator2.default.wrap(function _loop$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      requestParams = { limit: 40 };

                      if (sinceId != null) {
                        requestParams.since_id = sinceId;
                      }
                      if (maxId != null) {
                        requestParams.max_id = maxId;
                      }

                      _context3.next = 5;
                      return (0, _util.delayExecution)(function () {
                        return collectPage(settings, instance, fd, requestParams, i === 0);
                      });

                    case 5:
                      _ref5 = _context3.sent;
                      lastId = _ref5.lastId;
                      nbSentences = _ref5.nbSentences;


                      console.log('Collecting next page:', lastId, sinceId);

                      if (!(lastId === -1)) {
                        _context3.next = 11;
                        break;
                      }

                      return _context3.abrupt('return', 'break');

                    case 11:

                      maxId = lastId;
                      nbNewSentences += nbSentences;

                    case 13:
                    case 'end':
                      return _context3.stop();
                  }
                }
              }, _loop, undefined);
            });
            i = 0;

          case 9:
            if (!(i < settings.maxPagesToCollect)) {
              _context4.next = 17;
              break;
            }

            return _context4.delegateYield(_loop(i), 't0', 11);

          case 11:
            _ret = _context4.t0;

            if (!(_ret === 'break')) {
              _context4.next = 14;
              break;
            }

            return _context4.abrupt('break', 17);

          case 14:
            i += 1;
            _context4.next = 9;
            break;

          case 17:

            _fs2.default.closeSync(fd);
            return _context4.abrupt('return', nbNewSentences);

          case 19:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function collectToots(_x9) {
    return _ref4.apply(this, arguments);
  };
}();

exports.default = collectToots;