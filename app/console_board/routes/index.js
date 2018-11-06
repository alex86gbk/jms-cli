const fs = require('fs');
const express = require('express');
const router = express.Router();
const co = require('co');

const init = require('../../../src/init');
const serverControl = require('../components/ServerControl');
const settableVersion = '0.1.1';

let currentProject;

/**
 * 获取 js-multi-seed 版本
 * @param path 项目路径
 */
function getJMSVersion(path) {
  return new Promise(function (resolve) {
    fs.readFile(`${path}/package.json`, (err) => {
      if (err) {
        console.log(err);
        resolve(null);
      } else {
        resolve(require(`${path}/package.json`).version);
      }
    });
  });
}

/**
 * 获取项目地图
 * @param req
 * @param res
 */
function getProjectMap(req, res) {

}

/**
 * 获取项目分类
 * @param req
 * @param res
 */
function getProjectCategory(req, res) {

}

/**
 * 获取项目接口
 * @param req
 * @param res
 */
function getServiceAPI(req, res) {

}

/**
 * 开启服务
 * @param req
 * @param res
 */
function startServer(req, res) {
  serverControl.serverStart(req, res, currentProject);
}

/**
 * 停止服务
 * @param req
 * @param res
 */
function stopServer(req, res) {
  serverControl.serverStop(req, res, currentProject);
}

/**
 * 渲染默认视图页
 * @param req
 * @param res
 */
function renderDefaultView(req, res) {
  currentProject = req.query.project;

  co(function *() {
    const appPath = yield init.initAppPath();
    const dbPath = yield init.initDBPath(appPath);
    const db = require('../../../src/db');
    const projectDB = db.loadDBFiles(dbPath).project;

    let projects = yield db.queryDataSync(projectDB);
    projects = projects.map((item) => {
      return item.path
    });
    currentProject = currentProject ? currentProject : projects[0];

    let JMSVersion = yield getJMSVersion(currentProject);

    res.render('index', {
      projects: projects,
      currentProject: currentProject,
      JMSVersion: JMSVersion,
      settableProject: JMSVersion >= settableVersion,
      settableVersion: settableVersion,
      serverStatus: serverControl.serverStatus(currentProject),
    });
  });
}

router.get('/', renderDefaultView);

router.post('/getProjectMap', getProjectMap);
router.post('/getProjectCategory', getProjectCategory);
router.post('/getServiceAPI', getServiceAPI);
router.post('/startServer', startServer);
router.post('/stopServer', stopServer);

module.exports = router;
