const fs = require('fs');
const co = require('co');
const chalk = require('chalk');

const init = require('../src/init');
let project;
let projects;

/**
 * 查询数据
 * @param dataBase 数据库
 */
function queryData(dataBase) {
  return new Promise(function (resolve, reject) {
    dataBase.find({}).exec(function (err, docs) {
      if (err) {
        reject();
      } else {
        resolve(docs);
      }
    });
  });
}

/**
 * 列出项目列表
 */
function listProject() {
  return new Promise((resolve) => {
    console.log(chalk.grey(' The project list is:'));
    console.log(`\n ${projects.join('\n ')}`);
    resolve();
  });
}

module.exports = () => {
  co(function * list() {
    const appPath = yield init.initAppPath();
    const dbPath = yield init.initDBPath(appPath);

    project = require('../src/db')(dbPath).project;
    projects = yield queryData(project);
    projects = projects.map((item) => {
      return item.path
    });

    yield listProject();
  });
};
