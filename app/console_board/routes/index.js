const fs = require('fs');
const express = require('express');
const router = express.Router();
const co = require('co');

const init = require('../../../src/init');
const pageMap = require('../components/PageMap');
const category = require('../components/Category');
const serviceApi = require('../components/ServiceApi');
const serverControl = require('../components/ServerControl');
const setting = require('../components/Setting');

global.versionMap = {
  'release-0.2.0': {
    version: '0.2.0',
    gitHub: 'https://github.com/alex86gbk/js-multi-seed/releases/tag/0.2.0'
  },
  'pre-release-0.1.1': {
    version: '0.1.1',
    gitHub: 'https://github.com/alex86gbk/js-multi-seed/releases/tag/v0.1.1'
  },
};
global.JMSVersion = null;

let projects;
let currentProject;

/**
 * 获取当前项目
 */
function getCurrentProject(req, res, next) {
  currentProject = req.query.project;

  co(function *() {
    const appPath = yield init.initAppPath();
    const dbPath = yield init.initDBPath(appPath);
    const db = require('../../../src/db');
    const projectDB = db.loadDBFiles(dbPath).project;

    projects = yield db.queryDataSync(projectDB);
    projects = projects.map((item) => {
      return {
        name: item.name,
        path: item.path
      };
    });
    currentProject = currentProject ? currentProject : projects[0].path;
    next();
  });
}

/**
 * 获取项目基础信息
 * @param path 项目路径
 */
function getProjectBaseInfo(path) {
  return new Promise(function (resolve) {
    fs.readFile(`${path}/package.json`, (err) => {
      if (err) {
        resolve();
      } else {
        let projectInfo = require(`${path}/package.json`);

        global.JMSVersion = projectInfo.JMSVersion;
        resolve({
          JMSVersion: projectInfo.JMSVersion,
          name: projectInfo.alias,
          version: projectInfo.version,
        });
      }
    });
  });
}

/**
 * 获取项目地图
 * @param req
 * @param res
 */
function getPageMap(req, res) {
  pageMap.getPageMap(currentProject).then((data) => {
    res.send({
      'message': 'ok',
      'data': data
    });
  }, () => {
    res.send({
      'message': 'fail',
    });
  });
}

/**
 * 获取项目分类
 * @param req
 * @param res
 */
function getCategory(req, res) {
  category.getCategory(currentProject).then((data) => {
    res.send({
      'message': 'ok',
      'data': data
    });
  }, () => {
    res.send({
      'message': 'fail',
    });
  });
}

/**
 * 获取项目接口
 * @param req
 * @param res
 */
function getServiceApi(req, res) {
  serviceApi.getServiceApi(currentProject).then((data) => {
    res.send({
      'message': 'ok',
      'data': data
    });
  }, () => {
    res.send({
      'message': 'fail',
    });
  });
}

/**
 * 获取接口模拟数据
 */
function getMock(req, res) {
  serviceApi.getMock(currentProject, req.body).then((data) => {
    res.send({
      'message': 'ok',
      'data': data
    });
  }, () => {
    res.send({
      'message': 'fail',
    });
  });
}

/**
 * 保存项目设置
 * @param req
 * @param res
 */
function setSetting(req, res) {
  setting.setSetting(currentProject, req.body.setting).then(() => {
    res.send({
      'message': 'ok',
    });
  }, () => {
    res.send({
      'message': 'fail',
    });
  });
}

/**
 * 开启服务
 * @param req
 * @param res
 */
function startServer(req, res) {
  serverControl.startServer(currentProject, req.body.server).then(() => {
    res.send({
      'message': 'ok',
    });
  });
}

/**
 * 停止服务
 * @param req
 * @param res
 */
function stopServer(req, res) {
  serverControl.stopServer(currentProject, req.body.server).then(() => {
    res.send({
      'message': 'ok',
    });
  });
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
  co(function *() {
    const baseInfo = yield getProjectBaseInfo(currentProject);
    const preRelease011 = global.JMSVersion >= global.versionMap['pre-release-0.1.1'].version;
    const release020 = global.JMSVersion >= global.versionMap['release-0.2.0'].version;

    res.render('index', {
      projects: projects,
      currentProject: currentProject,
      baseInfo: baseInfo,
      preRelease011: global.versionMap['pre-release-0.1.1'].version,
      release020: global.versionMap['release-0.2.0'].version,
      setting: preRelease011 ? setting.getSetting(currentProject) : null,
      serverStatus: release020 ? serverControl.getServerStatus(currentProject) : null,
    });
  });
}

router.get('/', getCurrentProject);
router.get('/', renderDefaultView);

router.post('/getPageMap', getPageMap);
router.post('/getCategory', getCategory);
router.post('/getServiceApi', getServiceApi);
router.post('/getMock', getMock);
router.post('/startServer', startServer);
router.post('/stopServer', stopServer);
router.post('/setSetting', setSetting);
router.post('/getServerStatus', getServerStatus);

module.exports = router;
