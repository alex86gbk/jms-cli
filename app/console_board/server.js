const path = require('path');

const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const co = require('co');

const init = require('../../src/init');
const log = require('./log');

const index = require('./routes/index');

global.logger = null;

/**
 * 初始化 express
 */
function initExpressApp() {
  app.use(global.logger.winstonWarn());
  app.use(global.logger.winstonError());
  app.set('views', path.resolve(__dirname, 'views'));
  app.set('view engine', 'pug');
  app.use('/public', express.static(path.resolve(__dirname, 'public')));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));

  http.listen(3008);
  global.logger.infoLogger.info('Express started on port 3008');

  return Promise.resolve(true);
}

/**
 * 激活路由
 */
function routers() {
  app.all('*', function(req, res, next) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });

  app.use('/console_board', index);

  return Promise.resolve(true);
}

module.exports = (options) => {
  co(function *() {
    const appPath = yield init.initAppPath();
    const logPath = yield init.initLogPath(appPath);
    global.logger = yield log(logPath);

    yield initExpressApp();
    yield routers();

    options.onStart && options.onStart();
  });
};
