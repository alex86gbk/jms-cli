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
function serverStatus(projectPath) {
  const devPid = path.resolve(projectPath, 'config', 'dev-server.pid');
  const mockPid = path.resolve(projectPath, 'config', 'mock-server.pid');
  let devServerStatus;
  let mockServerStatus;

  try {
    devServerStatus = fs.readFileSync(devPid, 'utf-8');
  } catch (err) {
    devServerStatus = 0;
  }

  try {
    mockServerStatus = fs.readFileSync(mockPid, 'utf-8');
  } catch (err) {
    mockServerStatus = 0;
  }

  return {
    devServer: devServerStatus,
    mockServer: mockServerStatus,
  }
}

/**
 * 服务启动 TODO 查询端口是否被占用，被占用先fkill
 * @param {Object} req
 * @param {Object} res
 * @param {String} projectPath
 */
function serverStart(req, res, projectPath) {
  const server = req.body.server;
  const devCommand = `cd ${path.resolve(projectPath)} && npm run local:cli`;
  const mockCommand = `cd ${path.resolve(projectPath)} && npm run mock:cli`;

  if (server === 'dev') {
    exec(devCommand).on('exit', function () {
      console.log('dev stop');
    });
  }
  if (server === 'mock') {
    exec(mockCommand).on('exit', function () {
      console.log('mock stop');
    });
  }

  res.send({
    'message': 'ok'
  });
}

/**
 * 服务停止 TODO 更好的方式结束在运行的进程
 * @param {Object} req
 * @param {Object} res
 * @param {String} projectPath
 */
function serverStop(req, res, projectPath) {
  const server = req.body.server;
  const devPid = path.resolve(projectPath, 'config', 'dev-server.pid');
  const mockPid = path.resolve(projectPath, 'config', 'mock-server.pid');
  let devServerStatus;
  let mockServerStatus;

  try {
    devServerStatus = fs.readFileSync(devPid, 'utf-8');
  } catch (err) {
    devServerStatus = 0;
  }

  try {
    mockServerStatus = fs.readFileSync(mockPid, 'utf-8');
  } catch (err) {
    mockServerStatus = 0;
  }

  co(function * stop() {
    if (server === 'dev' && devServerStatus !== 0) {
      let stats = fs.statSync(devPid);

      try {
        process.kill(devServerStatus);
      } catch (err) {
        if (stats.isFile()) {
          fs.unlinkSync(devPid);
        }
      }

      res.send({
        'message': 'ok'
      });
    }
    if (server === 'mock' && mockServerStatus !== 0) {
      let stats = fs.statSync(mockPid);

      try {
        process.kill(mockServerStatus);
      } catch (err) {
        if (stats.isFile()) {
          fs.unlinkSync(mockPid);
        }
      }

      res.send({
        'message': 'ok'
      });
    }
  });
}

module.exports = {
  serverStatus,
  serverStart,
  serverStop,
};
