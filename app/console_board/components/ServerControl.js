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
 * 服务启动
 * @param {Object} req
 * @param {Object} res
 * @param {String} projectPath
 */
function serverStart(req, res, projectPath) {
  const server = req.body.server;
  const devCommand = `cd ${path.resolve(projectPath)} && npm run local`;
  const mockCommand = `node ${path.resolve(projectPath, 'mock', 'service.js')}`;

  if (server === 'dev') {
    exec(devCommand, (error) => {
      if (error) {
        console.log(error);
      }
    });
  }
  if (server === 'mock') {
    exec(mockCommand, (error) => {
      if (error) {
        console.log(error);
      }
    });
  }
  res.send({
    'message': 'ok'
  });
}

/**
 * 服务停止
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

      process.kill(devServerStatus);

      if (stats.isFile()) {
        fs.unlinkSync(devPid);
      }

      res.send({
        'message': 'ok'
      });
    }
    if (server === 'mock' && mockServerStatus !== 0) {
      let stats = fs.statSync(mockPid);

      process.kill(mockServerStatus);

      if (stats.isFile()) {
        fs.unlinkSync(mockPid);
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
