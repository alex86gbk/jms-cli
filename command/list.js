const fs = require('fs');
const co = require('co');
const chalk = require('chalk');

const init = require('../src/init');

let db;
let project;
let projects;

/**
 * 列出项目列表
 */
function listProject() {
  return new Promise((resolve) => {
    console.log(chalk.blue(' The project list is:'));
    console.log(`\n ${projects.join('\n ')}`);
    resolve();
  });
}

module.exports = () => {
  co(function * list() {
    const appPath = yield init.initAppPath();
    const dbPath = yield init.initDBPath(appPath);

    db = require('../src/db');
    project = db.loadDBFiles(dbPath).project;
    projects = yield db.queryDataSync(project);
    projects = projects.map((item) => {
      return item.path
    });

    yield listProject();
  });
};
