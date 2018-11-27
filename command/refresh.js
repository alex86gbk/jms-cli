const fs = require('fs');
const path = require('path');
const co = require('co');
const prompt = require('co-prompt');
const chalk = require('chalk');

const init = require('../src/init');

let db;
let project;
let projects;

/**
 * 刷新项目
 * @return {Promise}
 */
function refreshProject() {
  console.log(chalk.white('\n Refreshing project...'));

  return co(function * listProject() {
    const appPath = yield init.initAppPath();
    const dbPath = yield init.initDBPath(appPath);

    db = require('../src/db');
    project = db.loadDBFiles(dbPath).project;
    projects = yield db.queryDataSync(project);

    projects = projects.map((item) => {
      const name = require(path.resolve(item.path, 'package.json')).alias;

      return db.updateDataSync(project, { name: item.name }, { $set: { name: name } });
    });

    yield projects;

    console.log(chalk.white('\n Refresh project completed!'));

    return yield Promise.resolve(true);
  });
}

module.exports = () => {
  co(function * refresh() {
    yield refreshProject();

    process.exit();
  });
};
