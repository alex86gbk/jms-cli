const path = require('path');
const fs = require('fs');
const os = require('os');

const pathDelimiter = os.platform() === 'win32' ? '\\' : '/';

/**
 * 初始化应用路径
 * @return {Promise} 应用路径
 */
function initAppPath() {
  const paths = process.execPath.split(pathDelimiter);
  paths.pop();

  const appPath = path.join(paths.join(pathDelimiter), '.jms-cli');
  const existAppPath = fs.existsSync(appPath);

  if (!existAppPath) {
    fs.mkdirSync(appPath);
    return Promise.resolve(appPath);
  } else {
    return Promise.resolve(appPath);
  }
}

/**
 * 初始化数据路径
 * @param {String} appPath
 * @return {Promise} 数据路径
 */
function initDBPath(appPath) {
  const dbPath = path.join(appPath, '_db');
  const existDBPath = fs.existsSync(path.join(dbPath));

  if (!existDBPath) {
    fs.mkdirSync(dbPath);
    return Promise.resolve(dbPath);
  } else {
    return Promise.resolve(dbPath);
  }
}

/**
 * 初始化日志路径
 * @param {String} appPath
 * @return {Promise} 日志路径
 */
function initLogPath(appPath) {
  const logPath = path.join(appPath, '_logs');
  const existLogPath = fs.existsSync(path.join(logPath));

  if (!existLogPath) {
    fs.mkdirSync(logPath);
    return Promise.resolve(logPath);
  } else {
    return Promise.resolve(logPath);
  }
}

module.exports = {
  initAppPath,
  initDBPath,
  initLogPath
};
