const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const co = require('co');
const fkill = require('fkill');

/**
 * 服务状态
 * @param {String} projectPath
 * @return {Object}
 */
function getServerStatus(projectPath) {
  const devPid = path.resolve(projectPath, '.var', 'dev-server.pid');
  const mockPid = path.resolve(projectPath, '.var', 'mock-server.pid');
  let devServerStatus;
  let mockServerStatus;

  try {
    devServerStatus = fs.readFileSync(devPid, 'utf-8');
  } catch (err) {
    devServerStatus = 0;
    global.logger.errorLogger.error('catch error: ', err.stack);
  }

  try {
    mockServerStatus = fs.readFileSync(mockPid, 'utf-8');
  } catch (err) {
    mockServerStatus = 0;
    global.logger.errorLogger.error('catch error: ', err.stack);
  }

  return {
    devServer: devServerStatus,
    mockServer: mockServerStatus,
  }
}

/**
 * 服务启动 TODO 查询端口是否被占用，被占用先fkill
 * @param {String} projectPath
 * @param {String} projectServer
 */
async function startServer(projectPath, projectServer) {
  const server = projectServer;
  const devCommand = `cd ${path.resolve(projectPath)} && npm run dev-server`;
  const mockCommand = `cd ${path.resolve(projectPath)} && npm run mock-server`;

  if (server === 'dev-server') {
    exec(devCommand).on('exit', function () {
      global.logger.infoLogger.info('dev-server stop');
    });
  }
  if (server === 'mock-server') {
    exec(mockCommand).on('exit', function () {
      global.logger.infoLogger.info('mock-server stop');
    });
  }

  return Promise.resolve();
}

/**
 * 服务停止 TODO 更好的方式结束在运行的进程
 * @param {String} projectPath
 * @param {String} projectServer
 */
async function stopServer(projectPath, projectServer) {
  const server = projectServer;
  const devPid = path.resolve(projectPath, '.var', 'dev-server.pid');
  const mockPid = path.resolve(projectPath, '.var', 'mock-server.pid');
  let devServerStatus;
  let mockServerStatus;

  try {
    devServerStatus = fs.readFileSync(devPid, 'utf-8');
  } catch (err) {
    devServerStatus = 0;
    global.logger.errorLogger.error('catch error: ', err.stack);
  }

  try {
    mockServerStatus = fs.readFileSync(mockPid, 'utf-8');
  } catch (err) {
    mockServerStatus = 0;
    global.logger.errorLogger.error('catch error: ', err.stack);
  }

  if (server === 'dev-server' && devServerStatus !== 0) {
    let stats = fs.statSync(devPid);

    try {
      process.kill(devServerStatus);
      if (stats.isFile()) {
        fs.unlinkSync(devPid);
      }
    } catch (err) {
      global.logger.errorLogger.error('catch error: ', err.stack);
      if (stats.isFile()) {
        fs.unlinkSync(devPid);
      }
    }

    return Promise.resolve();
  }
  if (server === 'mock-server' && mockServerStatus !== 0) {
    let stats = fs.statSync(mockPid);

    try {
      process.kill(mockServerStatus);
      if (stats.isFile()) {
        fs.unlinkSync(mockPid);
      }
    } catch (err) {
      global.logger.errorLogger.error('catch error: ', err.stack);
      if (stats.isFile()) {
        fs.unlinkSync(mockPid);
      }
    }

    return Promise.resolve();
  }
}

module.exports = {
  getServerStatus,
  startServer,
  stopServer,
};
