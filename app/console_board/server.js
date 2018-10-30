const path = require('path');

const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const co = require('co');

const init = require('../../src/init');
const log = require('./log');

const index = require('./routes/index');

/**
 * 初始化 express
 */
function initExpressApp(logger) {
  app.use(logger.winstonWarn());
  app.use(logger.winstonError());
  app.set('views', path.resolve(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use('/public', express.static(path.resolve(__dirname, 'public')));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));

  http.listen(3008);
  logger.infoLogger.info('Express started on port 3008');

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

  app.use('/console_board/index', index);

  return Promise.resolve(true);
}

module.exports = (options) => {
  co(function *() {
    const appPath = yield init.initAppPath();
    const dbPath = yield init.initDBPath(appPath);
    const database = require('../../src/db')(dbPath);
    const logPath = yield init.initLogPath(appPath);
    const logger = yield log(logPath);

    yield initExpressApp(logger);
    yield routers();

    options.onStart && options.onStart();
  });
};
