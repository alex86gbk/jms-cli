const fs = require('fs');
const path = require('path');
const co = require('co');
const prompt = require('co-prompt');
const chalk = require('chalk');

const init = require('../src/init');

let db;
let project;
let projects;

const argv = process.argv.splice(2);

/**
 * 检查项目文件夹
 * @param projectName {String}
 * @return {Promise}
 */
function checkProject(projectName) {
  return new Promise((resolve) => {
    if (projects.indexOf(path.resolve(projectName)) > -1) {
      console.log(chalk.red(` Project "${path.resolve(projectName)}" directory has been exist!`));
      process.exit();
    } else {
      resolve();
    }
  });
}

/**
 * 新增项目记录
 * @param projectName {String}
 * @return {Promise}
 */
function addProject(projectName) {
  const data = {
    name: require(path.resolve(projectName, 'package.json')).alias,
    path: path.resolve(projectName),
  };

  projects.push(path.resolve(projectName));

  return new Promise((resolve) => {
    db.insertDataSync(project, data).then(() => {
      console.log(chalk.green(`\n New project ${path.resolve(projectName)} has been added!`));
      console.log(chalk.blue(' The latest project list is:'));
      console.log(`\n ${projects.join('\n ')}`);
      resolve();
      process.exit();
    });
  });
}

module.exports = () => {
  co(function * add() {
    const appPath = yield init.initAppPath();
    const dbPath = yield init.initDBPath(appPath);

    db = require('../src/db');
    project = db.loadDBFiles(dbPath).project;
    projects = yield db.queryDataSync(project);
    projects = projects.map((item) => {
      return item.path
    });

    const projectName = argv.length >= 2 ? argv[1] : yield prompt('Project name: ');

    yield checkProject(projectName);
    yield addProject(projectName);
  });
};
