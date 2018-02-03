"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.delayExecution = exports.mergeArrays = exports.randomPick = undefined;

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var randomPick = exports.randomPick = function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
};

var mergeArrays = exports.mergeArrays = function mergeArrays(arr1, arr2) {
  if (Array.isArray(arr2)) {
    return [].concat((0, _toConsumableArray3.default)(arr1), (0, _toConsumableArray3.default)(arr2));
  }
  return arr1;
};

var delayExecution = exports.delayExecution = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(func) {
    var minDelay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 500;
    var maxDelay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 700;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", new _promise2.default(function (resolve) {
              var multiplier = maxDelay - minDelay + 1;
              var time = Math.floor(Math.random() * multiplier + minDelay);
              setTimeout(function () {
                resolve(func());
              }, time);
            }));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function delayExecution(_x) {
    return _ref.apply(this, arguments);
  };
}();