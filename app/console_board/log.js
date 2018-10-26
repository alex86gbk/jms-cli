const path = require('path');

const winston = require('winston');
const expressWinston = require('express-winston');

/**
 * 设置日志
 * @param {String} logPath
 * @return {Promise} 日志对象
 */
function setLog(logPath) {
  const date = new Date();
  const loggerDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

  const infoLogger = new winston.Logger({
    transports: [
      new winston.transports.File({
        json: true,
        colorize: true,
        level: "info",
        filename: `${path.join(logPath)}/${loggerDate}-info.log`
      }),
    ]
  });

  const warnLogger = new winston.Logger({
    transports: [
      new winston.transports.File({
        json: true,
        colorize: true,
        level: "warn",
        filename: `${path.join(logPath)}/${loggerDate}-warn.log`
      })
    ]
  });

  const errorLogger = new winston.Logger({
    transports: [
      new winston.transports.File({
        json: true,
        colorize: true,
        level: "error",
        filename: `${path.join(logPath)}/${loggerDate}-error.log`
      })
    ]
  });

  function winstonWarn() {
    return expressWinston.logger({
      winstonInstance: warnLogger,
      meta: true,
      msg: "HTTP {{req.method}} {{req.url}}",
      expressFormat: true
    });
  }

  function winstonError() {
    return expressWinston.logger({
      winstonInstance: errorLogger,
      meta: true,
      msg: "HTTP {{req.method}} {{req.url}}",
      expressFormat: true
    });
  }

  return Promise.resolve({
    infoLogger,
    warnLogger,
    errorLogger,
    winstonWarn,
    winstonError,
  });
}

module.exports = setLog;
