const fs = require('fs');
const co = require('co');
const prompt = require('co-prompt');
const chalk = require('chalk');
const { listJSON } = require('../src/utils');

const init = require('../src/init');

let db;
let project;
let projects;

/**
 * 列出项目列表
 * @return {Promise}
 */
function listProject() {
  return co(function * listProject() {
    const appPath = yield init.initAppPath();
    const dbPath = yield init.initDBPath(appPath);

    db = require('../src/db');
    project = db.loadDBFiles(dbPath).project;
    projects = yield db.queryDataSync(project);

    let options = {};
    projects.forEach((item, i) => {
      options[i + 1] = `${item.name} ${item.path}`;
    });

    return yield Promise.resolve(options);
  });
}

/**
 * 移除项目
 * @param {number} number
 * @return {Promise}
 */
function removeProject(number) {
  const id = projects[number - 1]._id;
  console.log(chalk.white('\n Remove project...'));

  return co(function * removeProject() {
    const numRemoved = yield db.removeDataSync(project, { _id: id });

    if (numRemoved === 1) {
      const latestList = yield listProject();

      if (projects.length) {
        console.log(chalk.green('\n Remove project completed!'));
        console.log(chalk.blue(`\n The latest project list is: \n ${listJSON(latestList).list}`));
      } else {
        console.log(chalk.green('\n Remove project completed!'));
        console.log(chalk.blue(' There is none of project!'));
      }
    }

    return yield Promise.resolve(true);
  });
}

module.exports = () => {
  co(function * remove() {
    const options = yield listProject();

    if (projects.length) {
      console.log(chalk.blue(' The project list is:'));
      console.log(`\n ${listJSON(options).list}`);

      const number = yield prompt(`\nChoose a order number [${listJSON(options).key}]: `);

      yield removeProject(number);
    } else {
      console.log(chalk.blue(' There is none of project!'));
    }

    process.exit();
  });
};
