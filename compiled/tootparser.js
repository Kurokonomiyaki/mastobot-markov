'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseToot = exports.parseHtml = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _htmlparser = require('htmlparser');

var _htmlparser2 = _interopRequireDefault(_htmlparser);

var _underscore = require('underscore.string');

var _underscore2 = _interopRequireDefault(_underscore);

var _sbd = require('sbd');

var _sbd2 = _interopRequireDefault(_sbd);

var _url2 = require('url');

var _url3 = _interopRequireDefault(_url2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _he = require('he');

var _he2 = _interopRequireDefault(_he);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parseHtml = exports.parseHtml = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(data) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt('return', new _promise2.default(function (resolve, reject) {
              var handler = new _htmlparser2.default.DefaultHandler(function (error, dom) {
                if (error != null) {
                  reject(error);
                  return;
                }

                resolve(dom);
              });

              var parser = new _htmlparser2.default.Parser(handler);
              parser.parseComplete(data);
            }));

          case 1:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function parseHtml(_x) {
    return _ref.apply(this, arguments);
  };
}();

var domNodeToText = function domNodeToText(node) {
  var text = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var name = node.name,
      type = node.type,
      _node$attribs = node.attribs,
      attribs = _node$attribs === undefined ? {} : _node$attribs,
      children = node.children;
  var className = attribs.class;

  // regular text

  if (type === 'text') {
    var str = node.data.trim().replace(/"|&quot;|«|&laquo;|»|&raquo;/gi, '');
    if (str !== '') {
      text.push(str);
    }
    return;
  }

  // line jump
  if (name === 'p' || name === 'br') {
    text.push('\n');
  }

  // extract mentionned users and hashtags
  if (name === 'a') {
    if (className != null && className.includes('hashtag')) {
      var href = attribs.href;

      if (href != null) {
        var url = _url3.default.parse(href);
        var hostname = url.hostname,
            pathname = url.pathname;


        if (pathname != null && hostname != null) {
          var hashtag = _path2.default.posix.basename(pathname);
          if (hashtag != null) {
            text.push('#' + hashtag);
          }
        }
      }
    } else if (className != null && className.includes('mention')) {
      var _href = attribs.href;

      if (_href != null) {
        var _url = _url3.default.parse(_href);
        var _hostname = _url.hostname,
            _pathname = _url.pathname;


        if (_pathname != null && _hostname != null) {
          var userName = _path2.default.posix.basename(_pathname);
          if (userName != null) {
            text.push('' + userName);
          }
        }
      }
    }
    return;
  }

  // analyze children
  if (children != null && children.length > 0) {
    children.forEach(function (child) {
      domNodeToText(child, text);
    });
  }
};

var analyzeTootDom = function analyzeTootDom(dom) {
  // console.log('dom', JSON.stringify(dom, null, 2));

  var texts = [];
  if (dom.length > 0) {
    dom.forEach(function (child) {
      domNodeToText(child, texts);
    });
  }

  if (texts.length === 0) {
    return null;
  }

  return _he2.default.decode(texts.join(' '));
};

// TODO find a better implementation
var removeBeginningMentions = function removeBeginningMentions(words) {
  for (var i = 0; i < words.length; i += 1) {
    if (words[i].startsWith('@')) {
      words[i] = '';
    } else {
      break;
    }
  }
  return words;
};

// TODO find a better implementation
var removeEndingMentions = function removeEndingMentions(words) {
  for (var i = words.length - 1; i >= 0; i -= 1) {
    if (words[i].startsWith('@')) {
      words[i] = '';
    } else {
      break;
    }
  }
  return words;
};

// TODO find a better implementation
var cleanOrphanSymbols = function cleanOrphanSymbols(words) {
  for (var i = 0; i < words.length; i += 1) {
    if (words[i] === ';' || words[i] === ',' || words[i] === ':' || words[i] === ')') {
      if (i > 0) {
        words[i - 1] += words[i];
      }
      words[i] = '';
    } else if (words[i] === '(') {
      if (i < words.length) {
        words[i + 1] = words[i] + words[i + 1];
      }
      words[i] = '';
    }
  }
  return words;
};

var parseToot = exports.parseToot = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(toot) {
    var dom, text, sentences;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return parseHtml(toot);

          case 2:
            dom = _context2.sent;
            text = analyzeTootDom(dom);

            if (!(text != null && text.trim() !== '')) {
              _context2.next = 8;
              break;
            }

            sentences = [];

            text.trim().split('\n').forEach(function (line) {
              var newSentences = _sbd2.default.sentences(line.trim()).map(function (sentence) {
                var words = _underscore2.default.words(sentence);
                words = removeBeginningMentions(words);
                words = removeEndingMentions(words);
                words = cleanOrphanSymbols(words);
                return words.join(' ').trim();
              }).filter(function (value) {
                return value != null && value.trim() !== '';
              });
              sentences = [].concat((0, _toConsumableArray3.default)(sentences), (0, _toConsumableArray3.default)(newSentences));
            });
            return _context2.abrupt('return', sentences);

          case 8:
            return _context2.abrupt('return', null);

          case 9:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function parseToot(_x3) {
    return _ref2.apply(this, arguments);
  };
}();

exports.default = parseToot;