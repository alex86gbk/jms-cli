const fs = require('fs');
const express = require('express');
const router = express.Router();
const co = require('co');

const init = require('../../../src/init');
const serverControl = require('../components/ServerControl');
const setting = require('../components/Setting');
const settableVersion = '0.1.1';

let currentProject;

/**
 * 获取 JMS 版本
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
 * 保存项目设置
 * @param req
 * @param res
 */
function setSetting(req, res) {
  setting.setSetting(req, res, currentProject);
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
 * 检查服务状态
 * @param req
 * @param res
 */
function getServerStatus(req, res) {
  res.send(serverControl.getServerStatus(currentProject));
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
      return item.path;
    });
    currentProject = currentProject ? currentProject : projects[0];

    let JMSVersion = yield getJMSVersion(currentProject);
    const settableProject = JMSVersion >= settableVersion;

    res.render('index', {
      projects: projects,
      currentProject: currentProject,
      JMSVersion: JMSVersion,
      settableVersion: settableVersion,
      setting: settableProject ? setting.getSetting(currentProject) : null,
      serverStatus: settableProject ? serverControl.getServerStatus(currentProject) : null,
    });
  });
}

router.get('/', renderDefaultView);

router.post('/getProjectMap', getProjectMap);
router.post('/getProjectCategory', getProjectCategory);
router.post('/getServiceAPI', getServiceAPI);
router.post('/startServer', startServer);
router.post('/stopServer', stopServer);
router.post('/setSetting', setSetting);
router.post('/getServerStatus', getServerStatus);

module.exports = router;
