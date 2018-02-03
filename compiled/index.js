'use strict';

var _markovbot = require('./markovbot');

(0, _markovbot.startBot)().then(function () {}).catch(function (e) {
  return console.log(e);
});